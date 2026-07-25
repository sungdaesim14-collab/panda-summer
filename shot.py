"""약속의 산을 여러 진행도에서 캡처. 저장된 로그를 직접 주입해 상태를 만든다."""
import pathlib, time, sys, json
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
URL = "http://localhost:5180/"

def make_save(nick, days, char):
    logs = []
    for i in range(days):
        d = f"2026-07-{25+i:02d}" if 25 + i <= 31 else f"2026-08-{25+i-31:02d}"
        logs.append({
            "date": d, "missions": ["책 30분 읽기"], "done": ["책 30분 읽기"],
            "completed": True, "stars": 3, "outcome": "", "obstacle": "유튜브 보고 싶어져",
            "plan": "", "win": "win" if i % 2 == 0 else "", "selfPraise": "",
            "note": "", "pledged": True, "confessed": False, "savedAt": "2026-07-25T00:00:00Z",
        })
    return {
        "version": 1,
        "user": {"nickname": nick, "pinHash": "x", "character": char, "joinDate": "2026-07-25", "honestyGiven": False},
        "logs": logs, "cards": [], "bosses": [],
    }

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(URL, timeout=20000)
    time.sleep(1.0)

    cases = [("day3", "panda", 3), ("day16", "fox", 16), ("day32", "wolf", 32)]
    for name, char, days in cases:
        save = make_save("별이", days, char)
        pg.evaluate("""(s) => {
          localStorage.clear();
          localStorage.setItem('panda.token', '별이');
          localStorage.setItem('panda.users', JSON.stringify({'별이': s.user}));
          localStorage.setItem('panda.save.별이', JSON.stringify(s));
        }""", save)
        pg.reload()
        time.sleep(1.3)
        pg.get_by_role("button", name="약속의 산").click()
        time.sleep(1.0)
        pg.screenshot(path=str(OUT / f"mtn_{name}.png"), full_page=True)
        print(f"{name} ({days}일, {char}) OK")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close()
    b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
