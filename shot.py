"""스도쿠: 4x4 퍼즐을 실제로 풀어서 완성 판정까지 검증."""
import pathlib, time, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)
URL = "http://localhost:5180/"

def save(days):
    logs = []
    for i in range(days):
        day = 25 + i
        d = f"2026-07-{day:02d}" if day <= 31 else f"2026-08-{day-31:02d}"
        logs.append({"date": d, "missions": ["책 30분 읽기"], "done": ["책 30분 읽기"],
                     "completed": True, "stars": 3, "outcome": "", "obstacle": "", "plan": "",
                     "win": "none", "selfPraise": "", "note": "", "pledged": True,
                     "confessed": False, "savedAt": "2026-07-25T00:00:00Z"})
    return {"version": 1,
            "user": {"nickname": "별이", "pinHash": "x", "character": "panda",
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

    # 신규(0일) — 첫 스도쿠는 4x4
    s = save(0)
    pg.evaluate("""(s) => {
      localStorage.clear();
      localStorage.setItem('panda.token', '별이');
      localStorage.setItem('panda.users', JSON.stringify({'별이': s.user}));
      localStorage.setItem('panda.save.별이', JSON.stringify(s));
    }""", s)
    pg.reload(); time.sleep(1.3)

    pg.get_by_role("button", name="두뇌 수련").click(); time.sleep(1.0)
    pg.screenshot(path=str(OUT / "sudoku_start.png"), full_page=True)

    # 퍼즐과 정답을 브라우저에서 직접 계산해 유효성 검증 + 풀 계획 수립
    info = pg.evaluate("""async () => {
      const mod = await import('/src/game/sudoku.ts');
      const day = 1;
      const today = (() => { const d=new Date();
        return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
      const pz = mod.makePuzzle(today, day);
      // 정답이 유효한 스도쿠인지 확인
      const n = pz.spec.size;
      let valid = true;
      for (let r=0;r<n;r++){ const seen=new Set(); for(let c=0;c<n;c++){ if(seen.has(pz.solution[r][c])) valid=false; seen.add(pz.solution[r][c]); } }
      return { size:n, valid, solution: pz.solution, puzzle: pz.puzzle, given: pz.given };
    }""")
    print(f"퍼즐 크기 {info['size']}x{info['size']}, 정답 유효: {info['valid']}")
    assert info["valid"], "정답이 유효한 스도쿠가 아님!"

    n = info["size"]
    sol = info["solution"]
    given = info["given"]

    # 빈칸을 정답대로 채운다: 각 빈칸 클릭 → 해당 숫자 버튼
    cells = pg.locator(".panda-cell")  # 없으면 버튼 순서로
    # 그리드 버튼은 순서대로 n*n개. 숫자패드는 그 뒤 n개.
    grid_buttons = pg.locator("div[style*='grid-template-columns'] > button")
    filled = 0
    for r in range(n):
        for c in range(n):
            if given[r][c]:
                continue
            # 셀 클릭 (그리드는 첫 번째 grid 컨테이너)
            pg.locator("div[style*='aspect-ratio'] > button").nth(r*n+c).click()
            time.sleep(0.05)
            # 숫자패드에서 sol[r][c] 클릭
            pg.get_by_role("button", name=str(sol[r][c]), exact=True).last.click()
            time.sleep(0.05)
            filled += 1
    print(f"빈칸 {filled}개 채움")
    time.sleep(0.8)
    pg.screenshot(path=str(OUT / "sudoku_solved.png"), full_page=True)

    done = pg.get_by_text("다 풀었다").count() > 0
    print(f"완성 판정: {done}")

    ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    print(f"가로스크롤 = {ov}")
    ctx.close(); b.close()

print("\n=== JS 에러 ===")
print("\n".join(errors) if errors else "없음")
