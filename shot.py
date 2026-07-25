"""기록·친구 화면 검증. 여러 명의 저장 데이터를 주입해 친구 목록을 만든다."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
URL = "http://localhost:5180/"

def log(d, done=True, stars=3, win="win", obst="유튜브 보고 싶어져", praise="", note=""):
    return {"date": d, "missions": ["책 30분 읽기", "명상 1분 하기"],
            "done": ["책 30분 읽기", "명상 1분 하기"] if done else [],
            "completed": done, "stars": stars, "outcome": "", "obstacle": obst,
            "plan": "", "win": win, "selfPraise": praise, "note": note,
            "pledged": True, "confessed": False, "savedAt": "2026-07-25T00:00:00Z"}

def save(nick, char, logs):
    return {"version": 1,
            "user": {"nickname": nick, "pinHash": "x", "character": char,
                     "joinDate": "2026-07-25", "honestyGiven": False},
            "logs": logs, "cards": [], "bosses": []}

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(URL, timeout=20000); time.sleep(1.0)

    me = save("별이", "fox", [
        log("2026-07-25", stars=4, praise="첫날부터 해냈다"),
        log("2026-07-26", stars=3, win="none", note="생각보다 재밌었다"),
        log("2026-07-27", stars=5, praise="진짜 하기 싫었는데 해냈다"),
    ])
    friends = {
        "별이": me["user"],
        "하늘이": save("하늘이", "tiger", [log("2026-07-25"), log("2026-07-26")])["user"],
        "달콩이": save("달콩이", "rabbit", [log("2026-07-25"), log("2026-07-26"), log("2026-07-27")])["user"],
    }
    pg.evaluate("""(d) => {
      localStorage.clear();
      localStorage.setItem('panda.token', '별이');
      localStorage.setItem('panda.users', JSON.stringify(d.friends));
      localStorage.setItem('panda.save.별이', JSON.stringify(d.me));
      localStorage.setItem('panda.save.하늘이', JSON.stringify(d.h));
      localStorage.setItem('panda.save.달콩이', JSON.stringify(d.dal));
    }""", {"friends": friends, "me": me,
            "h": save("하늘이", "tiger", [log("2026-07-25"), log("2026-07-26")]),
            "dal": save("달콩이", "rabbit", [log("2026-07-25"), log("2026-07-26"), log("2026-07-27")])})
    pg.reload(); time.sleep(1.4)

    pg.get_by_role("button", name="기록").click(); time.sleep(0.9)
    pg.screenshot(path=str(OUT / "record.png"), full_page=True)
    print("기록 화면 OK")

    # 고백 흐름
    pg.get_by_role("button", name="🙏 솔직하게 고백하기").first.click(); time.sleep(0.5)
    pg.screenshot(path=str(OUT / "record_confess.png"), full_page=True)
    pg.get_by_role("button", name="응, 솔직하게 말할래").click(); time.sleep(1.0)
    pg.screenshot(path=str(OUT / "record_gem.png"), full_page=True)
    print("고백 → 정직의 보석 OK")

    pg.get_by_role("button", name="동문").click(); time.sleep(0.9)
    pg.screenshot(path=str(OUT / "friends.png"), full_page=True)
    print("동문 화면 OK")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
