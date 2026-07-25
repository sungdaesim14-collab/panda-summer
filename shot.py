"""정오 게이트 검증: 오전=계획, 오후=결과, 계획없이 오후=놓침, 저장 지속성."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
BASE = "http://localhost:5180/"

def fresh_user(pg):
    s = {"nickname": "별이", "pinHash": "x", "character": "panda", "joinDate": "2026-07-25", "honestyGiven": False}
    save = {"version": 1, "user": s, "logs": [], "cards": [], "bosses": []}
    pg.evaluate("""(s) => {
      localStorage.clear();
      localStorage.setItem('panda.token', '별이');
      localStorage.setItem('panda.onboarded', '1');
      localStorage.setItem('panda.users', JSON.stringify({'별이': s.user}));
      localStorage.setItem('panda.save.별이', JSON.stringify(s));
    }""", save)

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

    # --- 오전 10시: 계획만 ---
    pg.goto(BASE + "?hour=10", timeout=20000); time.sleep(1.0)
    fresh_user(pg)
    pg.goto(BASE + "?hour=10"); time.sleep(1.2)
    plan_ui = pg.get_by_text("오늘의 수련 고르기").count() > 0
    print(f"[오전10시] 계획 화면: {plan_ui}")
    pg.get_by_role("button", name="책 30분 읽기").click()
    pg.get_by_role("button", name="명상 1분 하기").click()
    pg.get_by_role("button", name="이 2개로 약속할래").click(); time.sleep(0.5)
    for i, o in enumerate(["뿌듯할 것 같아", "졸리고 눕고 싶어져", "물 한 잔 마시고 다시 앉기"]):
        pg.get_by_role("button", name=o).click(); time.sleep(0.3)
        if i < 2: pg.get_by_role("button", name="다음").click()
        else: pg.get_by_role("button", name="작전 완성 · 약속하기").click()
        time.sleep(0.5)
    # 계획 저장 후 대기 화면?
    wait_ui = pg.get_by_text("낮 12시가 지나면", exact=False).count() > 0
    print(f"[오전10시] 작전 후 대기 화면: {wait_ui}")
    pg.screenshot(path=str(OUT / "noon_wait.png"), full_page=True)
    # 오전엔 결과(마무리) 못 함 — '마무리' 버튼 없어야
    no_finish = pg.get_by_role("button", name="오늘 수련 마무리하기").count() == 0
    print(f"[오전10시] 결과 버튼 없음(정상): {no_finish}")

    # 저장 지속성: 새로고침해도 계획 유지
    pg.goto(BASE + "?hour=10"); time.sleep(1.2)
    still_plan = pg.get_by_text("낮 12시가 지나면", exact=False).count() > 0
    print(f"[오전10시] 새로고침 후 계획 유지: {still_plan}")

    # --- 오후 3시: 같은 계획으로 결과 입력 가능 ---
    pg.goto(BASE + "?hour=15"); time.sleep(1.2)
    result_ui = pg.get_by_text("해낸 만큼 체크").count() > 0
    print(f"[오후15시] 결과 화면 뜸: {result_ui}")
    pg.screenshot(path=str(OUT / "noon_result.png"), full_page=True)
    pg.get_by_role("button", name="책 30분 읽기").click()
    pg.get_by_role("button", name="명상 1분 하기").click()
    pg.get_by_role("button", name="오늘 수련 마무리하기").click(); time.sleep(0.5)
    pg.get_by_label("4점").click()
    pg.get_by_role("button", name="통했어! 방해물을 이겼어").click()
    pg.locator("button").filter(has_text="판다 사부와의 양심 약속").click()
    pg.get_by_role("button", name="오늘 수련 마무리!").click(); time.sleep(1.2)
    done_ui = pg.get_by_text("오늘의 노력이 하나를 열었다", exact=False).count() > 0
    print(f"[오후15시] 완료→카드: {done_ui}")

    # --- 계획 없이 오후: 놓침 ---
    fresh_user(pg)
    pg.goto(BASE + "?hour=15"); time.sleep(1.2)
    missed_ui = pg.get_by_text("계획 시간은 지났구나", exact=False).count() > 0
    print(f"[계획없이 오후] 놓침 화면: {missed_ui}")
    pg.screenshot(path=str(OUT / "noon_missed.png"), full_page=True)

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
