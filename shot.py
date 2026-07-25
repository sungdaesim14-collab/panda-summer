"""스도쿠 완성 → 동굴 보물 뽑기 → 동굴 배치 + 도감 검증."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
URL = "http://localhost:5180/"

def save(char, cave_keys):
    cards = [{"key": k, "kind": "cave", "gotDate": "2026-07-25", "pos": -1} for k in cave_keys]
    return {"version": 1,
            "user": {"nickname": "별이", "pinHash": "x", "character": char,
                     "joinDate": "2026-07-25", "honestyGiven": False},
            "logs": [], "cards": cards, "bosses": []}

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(URL, timeout=20000); time.sleep(1.0)

    # 몇 개 이미 가진 상태 (도감/배치 확인용) — 토끼(쉬운 난이도로 빨리 풀기)
    have = ["amethyst", "ruby", "wcrystal", "capmush", "firefly", "dragonegg", "gfall", "fern"]
    s = save("rabbit", have)
    pg.evaluate("""(s) => {
      localStorage.setItem('panda.token', '별이');
      localStorage.setItem('panda.users', JSON.stringify({'별이': s.user}));
      localStorage.setItem('panda.save.별이', JSON.stringify(s));
      localStorage.removeItem('panda.sudoku.v1');
    }""", s)
    pg.reload(); time.sleep(1.3)

    # 동굴 도감 먼저
    pg.get_by_role("button", name="동굴", exact=True).click(); time.sleep(0.7)
    pg.get_by_role("button", name="보물 도감", exact=False).click(); time.sleep(0.7)
    pg.screenshot(path=str(OUT / "cave_dex.png"), full_page=True)
    print("동굴 도감 OK")

    # 꾸미기: 보관함 아이템 골라 배치
    pg.get_by_role("button", name="꾸미기").click(); time.sleep(0.6)
    # 첫 보관함 아이템 클릭 → 첫 스팟 클릭
    bag = pg.locator("div[style*='minmax(58px'] > button")
    if bag.count() > 0:
        bag.nth(0).click(); time.sleep(0.4)
        spot = pg.get_by_role("button", name="여기 놓기")
        if spot.count() > 0:
            spot.nth(0).click(); time.sleep(0.6)
    pg.screenshot(path=str(OUT / "cave_decorate.png"), full_page=True)
    print("동굴 꾸미기(배치) OK")

    # 스도쿠 완성 → 뽑기 (토끼라 40빈칸이지만 solution대로 채움)
    pg.get_by_role("button", name="두뇌 수련").click(); time.sleep(0.8)
    info = pg.evaluate("""async () => {
      const mod = await import('/src/game/sudoku.ts');
      const today = (() => { const d=new Date();
        return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
      const pz = mod.makePuzzle(today, 1, true);
      return { size: pz.spec.size, solution: pz.solution, given: pz.given };
    }""")
    n = info["size"]; sol = info["solution"]; given = info["given"]
    for r in range(n):
        for c in range(n):
            if given[r][c]: continue
            pg.locator("div[style*='aspect-ratio'] > button").nth(r*n+c).click()
            pg.get_by_role("button", name=str(sol[r][c]), exact=True).last.click()
    time.sleep(1.0)
    pg.screenshot(path=str(OUT / "cave_won.png"), full_page=True)
    won = pg.get_by_text("동굴의 보물을 얻었다").count() > 0
    print(f"스도쿠 완성 → 보물 뽑기: {won}")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
