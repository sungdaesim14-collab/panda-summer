"""황금 목표: 배너 표시 + 달성 시 동굴 보물 지급 검증."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
BASE = "http://localhost:5180/"

def fresh(pg):
    s = {"nickname": "별이", "pinHash": "x", "character": "panda", "joinDate": "2026-07-25", "honestyGiven": False}
    save = {"version": 1, "user": s, "logs": [], "cards": [], "bosses": []}
    pg.evaluate("""(s) => {
      localStorage.clear();
      localStorage.setItem('panda.token','별이');
      localStorage.setItem('panda.onboarded','1');
      localStorage.setItem('panda.users', JSON.stringify({'별이': s.user}));
      localStorage.setItem('panda.save.별이', JSON.stringify(s));
    }""", save)

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type=="error" else None)
    pg.goto(BASE + "?hour=10", timeout=20000); time.sleep(1.0)
    fresh(pg); pg.goto(BASE + "?hour=10"); time.sleep(1.2)

    # 오늘의 목표 배너 뜨나
    goal_banner = pg.get_by_text("오늘의 황금 목표").count() > 0
    print(f"[오전] 황금 목표 배너: {goal_banner}")
    goal_title = pg.evaluate("""() => {
      const el = [...document.querySelectorAll('div')].find(d => d.textContent === '오늘의 황금 목표');
      return el ? el.nextElementSibling.textContent : '';
    }""")
    print(f"오늘 목표: {goal_title}")
    pg.screenshot(path=str(OUT / "goal_banner.png"), full_page=True)

    # 계획 (수련 3개 골라서 어떤 목표든 맞을 확률 높이기)
    for m in ["책 30분 읽기", "명상 1분 하기", "운동하기 (줄넘기, 산책 등)"]:
        pg.get_by_role("button", name=m).click()
    pg.get_by_role("button", name="이 3개로 약속할래").click(); time.sleep(0.5)
    for i,o in enumerate(["뿌듯할 것 같아","졸리고 눕고 싶어져","물 한 잔 마시고 다시 앉기"]):
        pg.get_by_role("button", name=o).click(); time.sleep(0.25)
        pg.get_by_role("button", name="다음" if i<2 else "작전 완성 · 약속하기").click(); time.sleep(0.4)

    # 오후 결과 (다 지키고 + 작전승리 + 별5 + 칭찬 → 어떤 목표든 달성 가능성)
    pg.goto(BASE + "?hour=15"); time.sleep(1.2)
    for m in ["책 30분 읽기", "명상 1분 하기", "운동하기 (줄넘기, 산책 등)"]:
        pg.get_by_role("button", name=m).click(); time.sleep(0.2)
    pg.get_by_role("button", name="오늘 수련 마무리하기").click(); time.sleep(0.5)
    pg.get_by_label("5점").click()
    pg.get_by_role("button", name="통했어! 방해물을 이겼어").click()
    pg.get_by_placeholder("예: 끝까지 해낸 내가 자랑스러워").fill("끝까지 해낸 내가 멋져")
    # 두 번째 input(오늘의 한 줄 기록)도 채운다 — 어떤 목표든 달성되게
    inputs = pg.locator("section input")
    if inputs.count() >= 2:
        inputs.nth(1).fill("오늘은 생각보다 재밌었다")
    pg.locator("button").filter(has_text="판다 사부와의 양심 약속").click()
    pg.get_by_role("button", name="오늘 수련 마무리!").click()
    time.sleep(1.6)

    reward = pg.get_by_text("오늘의 황금 목표 달성", exact=False).count() > 0
    print(f"[오후] 목표 달성 → 동굴 보물 지급: {reward}")
    pg.screenshot(path=str(OUT / "goal_reward.png"), full_page=True)

    # 동굴에 실제로 들어갔나
    cave_count = pg.evaluate("""() => {
      const raw = localStorage.getItem('panda.save.별이');
      if(!raw) return -1;
      return JSON.parse(raw).cards.filter(c=>c.kind==='cave').length;
    }""")
    print(f"동굴 보물 저장 수: {cave_count}")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join([e for e in errors if 'vibrate' not in e]) or "없음")
