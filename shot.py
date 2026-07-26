"""졸업 인증서 검증: 32일 완주 / 미완주 두 경우."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
BASE = "http://localhost:5180/"

def save(days, char):
    logs = []
    for i in range(days):
        d = i
        mm = 7 if 25+d <= 31 else 8
        dd = 25+d if 25+d <= 31 else 25+d-31
        logs.append({"date": f"2026-{mm:02d}-{dd:02d}", "missions": ["책 30분 읽기", "명상 1분 하기"],
                     "done": ["책 30분 읽기", "명상 1분 하기"], "completed": True,
                     "stars": 5 if i % 4 == 0 else 3, "outcome": "", "obstacle": "유튜브 보고 싶어져",
                     "plan": "", "win": "win" if i % 2 == 0 else "none", "selfPraise": "",
                     "note": "", "pledged": True, "confessed": False, "savedAt": "2026-07-25T00:00:00Z"})
    cards = [{"key": k, "kind": "treasure", "gotDate": "2026-07-25", "pos": -1} for k in ["sprout","leaf","dew"][:min(3,days)]]
    cave = [{"key": "amethyst", "kind": "cave", "gotDate": "2026-08-01", "pos": 0}]
    return {"version": 1,
            "user": {"nickname": "별이", "pinHash": "x", "character": char, "joinDate": "2026-07-25", "honestyGiven": False},
            "logs": logs, "cards": cards + cave, "bosses": []}

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 950}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(BASE, timeout=20000); time.sleep(1.0)

    for days, tag in [(32, "finished"), (18, "partial")]:
        s = save(days, "panda")
        pg.evaluate("""(s) => {
          localStorage.clear();
          localStorage.setItem('panda.token', '별이');
          localStorage.setItem('panda.onboarded', '1');
          localStorage.setItem('panda.users', JSON.stringify({'별이': s.user}));
          localStorage.setItem('panda.save.별이', JSON.stringify(s));
        }""", s)
        pg.goto(BASE + "?grad=1"); time.sleep(1.4)
        cert = pg.get_by_text("여름 수련 수료증").count() > 0
        print(f"[{days}일 {tag}] 수료증 뜸: {cert}")
        pg.screenshot(path=str(OUT / f"grad_{tag}.png"), full_page=True)

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
