"""캐릭터별 스도쿠 난이도 비교: 판다(어려움) vs 토끼(쉬움)."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
URL = "http://localhost:5180/"

def save(char):
    return {"version": 1,
            "user": {"nickname": "별이", "pinHash": "x", "character": char,
                     "joinDate": "2026-07-25", "honestyGiven": False},
            "logs": [], "cards": [], "bosses": []}

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(URL, timeout=20000); time.sleep(1.0)

    for char, label in [("panda", "hard"), ("rabbit", "easy")]:
        s = save(char)
        pg.evaluate("""(s) => {
          localStorage.setItem('panda.token', '별이');
          localStorage.setItem('panda.users', JSON.stringify({'별이': s.user}));
          localStorage.setItem('panda.save.별이', JSON.stringify(s));
          // 스도쿠 진행 초기화
          localStorage.removeItem('panda.sudoku.v1');
        }""", s)
        pg.reload(); time.sleep(1.3)
        pg.get_by_role("button", name="두뇌 수련").click(); time.sleep(0.9)
        # 빈칸 수 계산
        blanks = pg.evaluate("""() => {
          const cells = document.querySelectorAll("div[style*='aspect-ratio'] > button");
          let empty = 0; cells.forEach(c => { if (!c.textContent.trim()) empty++; });
          return empty;
        }""")
        print(f"{char}: 빈칸 {blanks}개")
        pg.screenshot(path=str(OUT / f"sudoku_{label}.png"), full_page=True)

    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
