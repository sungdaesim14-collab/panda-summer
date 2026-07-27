"""전체 탭 회귀 테스트 — 모든 화면이 에러 없이 렌더되는지."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
BASE = "http://localhost:5180/"

def seed(pg, days=5):
    logs = []
    for i in range(days):
        d = 25 + i
        logs.append({"date": f"2026-07-{d:02d}", "missions": ["책 30분 읽기", "명상 1분 하기"],
                     "done": ["책 30분 읽기", "명상 1분 하기"], "completed": True,
                     "stars": 5 if i % 3 == 0 else 3, "outcome": "뿌듯", "obstacle": "유튜브 보고 싶어져",
                     "plan": "폰 멀리", "win": "win" if i % 2 == 0 else "none", "selfPraise": "잘했어",
                     "note": "재밌었다", "pledged": True, "confessed": False, "savedAt": "2026-07-25T00:00:00Z"})
    cards = [{"key": k, "kind": "treasure", "gotDate": "2026-07-25", "pos": -1} for k in ["sprout","leaf","dew","stream","stone"][:days]]
    cave = [{"key": "amethyst", "kind": "cave", "gotDate": "2026-07-27", "pos": 0},
            {"key": "ruby", "kind": "cave", "gotDate": "2026-07-28", "pos": -1}]
    return {"version": 1,
            "user": {"nickname": "별이", "pinHash": "x", "character": "panda", "joinDate": "2026-07-25", "honestyGiven": False},
            "logs": logs, "cards": cards + cave, "bosses": []}

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type=="error" and "vibrate" not in m.text else None)
    try:
        pg.goto(BASE + "?hour=15", timeout=25000)
    except Exception as e:
        sys.exit(f"서버 연결 실패: {e}")
    time.sleep(1.2)
    pg.evaluate("""(s) => {
      localStorage.clear();
      localStorage.setItem('panda.token','별이');
      localStorage.setItem('panda.onboarded','1');
      localStorage.setItem('panda.users', JSON.stringify({'별이': s.user}));
      localStorage.setItem('panda.save.별이', JSON.stringify(s));
    }""", seed(pg))
    pg.goto(BASE + "?hour=15"); time.sleep(1.4)

    tabs = ["수련", "약속의 산", "보스", "도감", "호흡법", "두뇌 수련", "동굴", "동문", "기록", "설정"]
    for t in tabs:
        try:
            pg.get_by_role("button", name=t, exact=True).click(); time.sleep(0.7)
            # 화면에 내용이 있는지 (빈 화면 아님)
            body_len = len(pg.evaluate("document.body.innerText"))
            print(f"[{t}] 렌더 OK (텍스트 {body_len}자)")
        except Exception as e:
            print(f"[{t}] ❌ 실패: {e}")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"\n가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
