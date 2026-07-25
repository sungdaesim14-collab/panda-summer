"""신규 가입 → 캐릭터 선택 → 첫 튜토리얼 등장 → 완료 후 재방문 시 안 뜸 검증."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
URL = "http://localhost:5180/"

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 880}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(URL, timeout=20000); time.sleep(1.0)
    pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(1.2)

    # 가입
    pg.get_by_placeholder("이름 (2~10글자)").fill("보름")
    pg.get_by_placeholder("비밀번호 (숫자 4자리)").fill("2222")
    pg.get_by_role("button", name="처음 왔어요 · 새 수련생 등록").click()
    time.sleep(0.9)
    # 캐릭터 선택 (판다)
    pg.get_by_role("button", name="판다", exact=False).first.click()
    time.sleep(0.3)
    pg.get_by_role("button", name="이 검객으로 정할래").click()
    time.sleep(1.0)

    # 튜토리얼 등장?
    tut = pg.get_by_text("판다 사부", exact=False).count() > 0 and pg.get_by_role("button", name="다음").count() > 0
    print(f"튜토리얼 등장: {tut}")
    pg.screenshot(path=str(OUT / "onboard_1.png"), full_page=False)

    # 다음 → 다음 → 시작
    pg.get_by_role("button", name="다음").click(); time.sleep(0.4)
    pg.screenshot(path=str(OUT / "onboard_2.png"), full_page=False)
    pg.get_by_role("button", name="다음").click(); time.sleep(0.4)
    pg.get_by_role("button", name="수련 시작하기").click(); time.sleep(0.8)

    # 튜토리얼 닫힘 → 홈?
    home = pg.get_by_text("수련일").count() > 0
    print(f"튜토리얼 닫고 홈 진입: {home}")
    pg.screenshot(path=str(OUT / "onboard_home.png"), full_page=False)

    # 재방문 시 안 뜨는지
    pg.reload(); time.sleep(1.3)
    again = pg.get_by_role("button", name="수련 시작하기").count() > 0
    print(f"재방문 시 튜토리얼 다시 뜸: {again} (False여야 정상)")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
