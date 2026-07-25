"""동문 화면에서 친구 동굴 구경 검증 (같은 기기에 여러 유저)."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
URL = "http://localhost:5180/"

def user(nick, char, placed_keys):
    cards = [{"key": k, "kind": "cave", "gotDate": "2026-07-25", "pos": i} for i, k in enumerate(placed_keys)]
    return {"nickname": nick, "pinHash": "x", "character": char, "joinDate": "2026-07-25", "honestyGiven": False}, \
           {"version": 1, "user": {"nickname": nick, "pinHash": "x", "character": char, "joinDate": "2026-07-25", "honestyGiven": False},
            "logs": [{"date":"2026-07-25","missions":["x"],"done":["x"],"completed":True,"stars":3,"outcome":"","obstacle":"","plan":"","win":"none","selfPraise":"","note":"","pledged":True,"confessed":False,"savedAt":"2026-07-25T00:00:00Z"}],
            "cards": cards, "bosses": []}

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(URL, timeout=20000); time.sleep(1.0)

    meU, meS = user("별이", "panda", ["amethyst", "ruby", "wcrystal"])
    haU, haS = user("하늘이", "tiger", ["dragonegg", "gfall", "capmush", "firefly", "starshard"])
    pg.evaluate("""(d) => {
      localStorage.clear();
      localStorage.setItem('panda.token', '별이');
      localStorage.setItem('panda.onboarded', '1');
      localStorage.setItem('panda.users', JSON.stringify({'별이': d.me.user, '하늘이': d.ha.user}));
      localStorage.setItem('panda.save.별이', JSON.stringify(d.me));
      localStorage.setItem('panda.save.하늘이', JSON.stringify(d.ha));
    }""", {"me": meS, "ha": haS})
    pg.reload(); time.sleep(1.4)

    pg.get_by_role("button", name="동문").click(); time.sleep(0.9)
    pg.screenshot(path=str(OUT / "friends_visit.png"), full_page=True)

    # 하늘이 동굴 구경
    pg.get_by_role("button", name="🕳️ 동굴 구경").first.click(); time.sleep(1.0)
    seen = pg.get_by_text("의 동굴", exact=False).count() > 0
    print(f"친구 동굴 열림: {seen}")
    pg.screenshot(path=str(OUT / "friend_cave.png"), full_page=True)

    # 돌아가기
    pg.get_by_role("button", name="← 동문으로").click(); time.sleep(0.6)
    back = pg.get_by_text("함께 수련하는 동문들").count() > 0
    print(f"동문으로 복귀: {back}")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
