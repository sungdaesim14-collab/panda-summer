"""관리자(뽀귀) 패널 렌더 확인 — 로컬 데이터로."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
BASE = "http://localhost:5180/"

def mk(nick, char, days, last):
    return {"nickname": nick, "pinHash": "x", "character": char, "joinDate": "2026-07-25",
            "honestyGiven": False, "lastSeen": last}

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type=="error" and "vibrate" not in m.text else None)
    try:
        pg.goto(BASE, timeout=25000)
    except Exception as e:
        sys.exit(f"서버 연결 실패: {e}")
    time.sleep(1.2)

    import json
    now = "2026-07-26T05:00:00Z"
    users = {
        "뽀귀": mk("뽀귀", "panda", 3, now),
        "똑똑별": mk("똑똑별", "owl", 5, "2026-07-26T02:00:00Z"),
        "동건": mk("동건", "tiger", 1, "2026-07-25T09:00:00Z"),
    }
    admin_save = {"version":1,"user":users["뽀귀"],"logs":[
        {"date":f"2026-07-{25+i}","missions":["책"],"done":["책"],"completed":True,"stars":3,
         "outcome":"","obstacle":"","plan":"","win":"none","selfPraise":"","note":"","pledged":True,
         "confessed":False,"savedAt":now} for i in range(3)],"cards":[],"bosses":[]}
    pg.evaluate("""(d) => {
      localStorage.clear();
      localStorage.setItem('panda.token','뽀귀');
      localStorage.setItem('panda.onboarded','1');
      localStorage.setItem('panda.users', JSON.stringify(d.users));
      localStorage.setItem('panda.save.뽀귀', JSON.stringify(d.admin));
    }""", {"users": users, "admin": admin_save})
    pg.goto(BASE); time.sleep(1.4)

    pg.get_by_role("button", name="설정", exact=True).click(); time.sleep(0.8)
    is_admin = pg.get_by_text("관리자 · 회원 관리", exact=False).count() > 0
    print(f"관리자 패널 표시: {is_admin}")
    print(f"똑똑별 보임: {pg.get_by_text('똑똑별').count() > 0}")
    print(f"최종접속 표시: {pg.get_by_text('최종접속', exact=False).count() > 0}")
    print(f"삭제 버튼: {pg.get_by_role('button', name='삭제').count()}")
    pg.screenshot(path=str(OUT / "admin.png"), full_page=True)

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
