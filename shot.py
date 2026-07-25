"""실제 데이터로 도감·보스 화면 검증."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
URL = "http://localhost:5180/"

def log(d, win="win", stars=3, obst="유튜브 보고 싶어져"):
    return {"date": d, "missions": ["책 30분 읽기", "명상 1분 하기"],
            "done": ["책 30분 읽기", "명상 1분 하기"], "completed": True,
            "stars": stars, "outcome": "", "obstacle": obst, "plan": "",
            "win": win, "selfPraise": "오늘도 해낸 나", "note": "",
            "pledged": True, "confessed": False, "savedAt": "2026-07-25T00:00:00Z"}

def save(days):
    logs = []
    for i in range(days):
        day = 25 + i
        d = f"2026-07-{day:02d}" if day <= 31 else f"2026-08-{day-31:02d}"
        logs.append(log(d, win="win" if i % 2 == 0 else "none", stars=5 if i % 3 == 0 else 3))
    return {"version": 1,
            "user": {"nickname": "별이", "pinHash": "x", "character": "fox",
                     "joinDate": "2026-07-25", "honestyGiven": True},
            "logs": logs,
            "cards": [{"key": "honest", "kind": "special", "gotDate": "2026-08-01", "pos": -1}],
            "bosses": []}

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(URL, timeout=20000); time.sleep(1.0)

    # 10일차로 주입 (7/25~8/3)
    s = save(10)
    pg.evaluate("""(s) => {
      localStorage.clear();
      localStorage.setItem('panda.token', '별이');
      localStorage.setItem('panda.users', JSON.stringify({'별이': s.user}));
      localStorage.setItem('panda.save.별이', JSON.stringify(s));
    }""", s)
    pg.reload(); time.sleep(1.4)

    pg.get_by_role("button", name="도감").click(); time.sleep(1.0)
    pg.screenshot(path=str(OUT / "real_dex.png"), full_page=True)
    print("도감(실데이터) OK")

    pg.get_by_role("button", name="보스", exact=True).click(); time.sleep(1.0)
    pg.screenshot(path=str(OUT / "real_boss.png"), full_page=True)
    print("보스(실데이터) OK")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
