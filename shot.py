"""관리자 24시간 흐름 + 일반 정오 게이트 둘 다 검증."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
BASE = "http://localhost:5180/"

def setup(pg, nick):
    u = {"nickname": nick, "pinHash": "x", "character": "panda", "joinDate": "2026-07-25", "honestyGiven": False}
    s = {"version": 1, "user": u, "logs": [], "cards": [], "bosses": []}
    pg.evaluate("""(d) => {
      localStorage.clear();
      localStorage.setItem('panda.token', d.nick);
      localStorage.setItem('panda.onboarded','1');
      localStorage.setItem('panda.users', JSON.stringify({[d.nick]: d.u}));
      localStorage.setItem('panda.save.'+d.nick, JSON.stringify(d.s));
    }""", {"nick": nick, "u": u, "s": s})

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type=="error" and "vibrate" not in m.text else None)

    # === 관리자 뽀귀, 오후 3시(정오 지남)에도 계획+결과 되는지 ===
    pg.goto(BASE + "?hour=15", timeout=25000); time.sleep(1.2)
    setup(pg, "뽀귀")
    pg.goto(BASE + "?hour=15"); time.sleep(1.4)
    # 관리자는 정오 지나도 '놓침' 아니라 계획 화면이어야
    plan_ui = pg.get_by_text("오늘의 수련 고르기").count() > 0
    missed_ui = pg.get_by_text("계획 시간은 지났구나", exact=False).count() > 0
    print(f"[관리자 오후3시] 계획화면={plan_ui}, 놓침화면={missed_ui} (계획O 놓침X 여야)")
    # 계획 → WOOP → 바로 결과 되는지
    pg.get_by_role("button", name="책 30분 읽기").click()
    pg.get_by_role("button", name="이 1개로 약속할래").click(); time.sleep(0.4)
    for i,o in enumerate(["뿌듯할 것 같아","졸리고 눕고 싶어져","물 한 잔 마시고 다시 앉기"]):
        pg.get_by_role("button", name=o).click(); time.sleep(0.25)
        pg.get_by_role("button", name="다음" if i<2 else "작전 완성 · 약속하기").click(); time.sleep(0.4)
    result_ui = pg.get_by_text("해낸 만큼 체크").count() > 0
    wait_ui = pg.get_by_text("낮 12시가 지나면", exact=False).count() > 0
    print(f"[관리자] 계획후 바로 결과화면={result_ui}, 대기화면={wait_ui} (결과O 대기X 여야)")

    # === 일반 아이, 오후에 계획 없이 → 놓침 ===
    setup(pg, "일반이")
    pg.goto(BASE + "?hour=15"); time.sleep(1.4)
    missed2 = pg.get_by_text("계획 시간은 지났구나", exact=False).count() > 0
    print(f"[일반 오후] 놓침화면={missed2} (True 여야)")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤={ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
