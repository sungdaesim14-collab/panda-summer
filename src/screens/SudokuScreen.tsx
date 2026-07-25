import { useMemo, useState, useEffect } from "react";
import { Sabu } from "../components/Sabu";
import { makePuzzle, isSolved, isConflict, type Grid, type Puzzle } from "../game/sudoku";
// isSolved는 이제 정답 그리드가 아니라 규칙(spec)으로 판정한다
import { todayISO } from "../data/useGame";
import { fx } from "../game/feedback";
import { rollCaveItem, caveItem, RARITY_META, myCaveItems, CAVE_TOTAL, type CaveItem } from "../game/cave";
import { drawCaveItem } from "../art/drawCave";
import type { SaveData } from "../data/types";

interface Props {
  data: SaveData;
  /** 동굴 보물 획득 시 저장 */
  onAward: (key: string) => Promise<void>;
}

const K = "panda.sudoku.v1";

interface Store {
  done: string[];            // 완성한 날짜들
  progress?: { date: string; grid: Grid }; // 오늘 풀던 것
}

function load(): Store {
  try { return JSON.parse(localStorage.getItem(K) || "") as Store; } catch { return { done: [] }; }
}
function save(s: Store) { localStorage.setItem(K, JSON.stringify(s)); }

export function SudokuScreen({ data, onAward }: Props) {
  const today = todayISO();
  const store = useMemo(load, []);
  const solvedToday = store.done.includes(today);

  // 토끼는 1학년도 쓸 수 있게 완만한 난이도, 나머지는 도전적
  const easy = data.user.character === "rabbit";
  // 몇 번째 스도쿠인가 = 지금까지 완성한 수 + 1 (풀수록 난이도 상승)
  const day = store.done.length + 1;
  const puzzle: Puzzle = useMemo(() => makePuzzle(today, day, easy), [today, day, easy]);

  const [grid, setGrid] = useState<Grid>(() => {
    if (store.progress?.date === today) return store.progress.grid.map((r) => r.slice());
    return puzzle.puzzle.map((r) => r.slice());
  });
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [justSolved, setJustSolved] = useState(false);
  const [wonItem, setWonItem] = useState<CaveItem | null | "none">(null); // null=미정, "none"=다모음

  const n = puzzle.spec.size;

  // 진행 저장
  useEffect(() => {
    if (solvedToday) return;
    const s = load();
    s.progress = { date: today, grid };
    save(s);
  }, [grid, today, solvedToday]);

  if (solvedToday && !justSolved) {
    return (
      <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
        <Sabu>오늘의 두뇌 수련은 이미 마쳤구나. 서두르지 않아도 된다. 내일 또 새 문제가 온단다.</Sabu>
        <div style={{ ...panel, textAlign: "center", padding: "36px 20px" }}>
          <div style={{ fontSize: 40 }}>🧩</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 8 }}>오늘의 두뇌 수련 완료</div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
            지금까지 {store.done.length}개의 문제를 풀었다
          </div>
        </div>
      </div>
    );
  }

  const setCell = (v: number) => {
    if (!sel) return;
    const [r, c] = sel;
    if (puzzle.given[r][c]) return;
    fx.tap();
    const g = grid.map((row) => row.slice());
    g[r][c] = g[r][c] === v ? 0 : v; // 같은 수 다시 누르면 지움
    setGrid(g);

    if (isSolved(g, puzzle.spec)) {
      // 완성!
      const s = load();
      if (!s.done.includes(today)) s.done.push(today);
      s.progress = undefined;
      save(s);
      setJustSolved(true);

      // 동굴 보물 뽑기 (중복 없이, 등급 가중)
      const owned = new Set(myCaveItems(data.cards).map((c) => c.key));
      const won = rollCaveItem(owned);
      setWonItem(won ?? "none");
      if (won) {
        fx.legend();
        onAward(won.key);
      } else {
        fx.complete();
      }
    }
  };

  const solved = justSolved;

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
      <Sabu>
        <b>오늘의 두뇌 수련</b>이다. 가로·세로·칸마다 1부터 {n}까지 한 번씩. 서두르지 말고 차근차근.
      </Sabu>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
        <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
          {puzzle.spec.level}의 문제 · {n}×{n}
        </span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>지금까지 {load().done.length}개</span>
      </div>

      {/* 그리드 */}
      <SudokuGrid
        puzzle={puzzle} grid={grid} sel={sel} solved={solved}
        onPick={(r, c) => { if (!solved) { setSel([r, c]); fx.tap(); } }}
      />

      {solved ? (
        <div style={{ ...panel, textAlign: "center", borderColor: "var(--kin)" }}>
          <div style={{ fontSize: 30 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>다 풀었다!</div>
          <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: "5px 0 14px", lineHeight: 1.6 }}>
            끝까지 집중해 해냈구나. 이 끈기가 진짜 수련이다.
          </p>

          {wonItem && wonItem !== "none" && <WonTreasure item={wonItem} />}
          {wonItem === "none" && (
            <div style={{ fontSize: 13, color: "var(--kin)", fontWeight: 700, padding: "12px 0" }}>
              동굴의 보물 {CAVE_TOTAL}종을 모두 모았구나. 대단하다!
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 숫자 패드 */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${n <= 6 ? n : 5}, 1fr)`, gap: 7 }}>
            {Array.from({ length: n }, (_, i) => i + 1).map((v) => (
              <button key={v} onClick={() => setCell(v)} disabled={!sel} style={numBtn(!sel)}>
                {v}
              </button>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-3)", margin: 0, lineHeight: 1.6 }}>
            빈칸을 누르고 숫자를 고르면 된다. 같은 숫자를 다시 누르면 지워진다.
          </p>
        </>
      )}
    </div>
  );
}

function SudokuGrid({
  puzzle, grid, sel, solved, onPick,
}: {
  puzzle: Puzzle; grid: Grid; sel: [number, number] | null; solved: boolean;
  onPick: (r: number, c: number) => void;
}) {
  const n = puzzle.spec.size;
  const { boxRows, boxCols } = puzzle.spec;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${n}, 1fr)`,
      gap: 0,
      border: `2.5px solid var(--ink)`,
      borderRadius: 8, overflow: "hidden",
      aspectRatio: "1 / 1", background: "var(--edge)",
      maxWidth: 380, width: "100%", margin: "0 auto",
    }}>
      {grid.map((row, r) =>
        row.map((v, c) => {
          const given = puzzle.given[r][c];
          const isSel = sel && sel[0] === r && sel[1] === c;
          const conflict = !given && isConflict(grid, puzzle.spec, r, c);
          // 박스 경계 굵은 선
          const thickR = (r + 1) % boxRows === 0 && r < n - 1;
          const thickC = (c + 1) % boxCols === 0 && c < n - 1;
          return (
            <button
              key={`${r}-${c}`}
              onClick={() => !given && onPick(r, c)}
              style={{
                aspectRatio: "1 / 1", border: "none", cursor: given ? "default" : "pointer",
                background: solved ? "rgba(95,179,124,0.16)"
                  : isSel ? "rgba(224,172,72,0.28)"
                  : given ? "var(--ground-2)" : "var(--surface)",
                color: conflict ? "var(--shu)" : given ? "var(--ink)" : "var(--kin)",
                fontWeight: given ? 800 : 700,
                fontSize: n <= 4 ? 24 : n <= 6 ? 20 : 15,
                fontVariantNumeric: "tabular-nums",
                boxShadow: `inset -${thickC ? 2 : 0.5}px -${thickR ? 2 : 0.5}px 0 0 ${thickC || thickR ? "var(--ink)" : "var(--edge)"}`,
                transition: "background .12s",
              }}
            >
              {v === 0 ? "" : v}
            </button>
          );
        })
      )}
    </div>
  );
}

function WonTreasure({ item }: { item: CaveItem }) {
  const meta = RARITY_META[item.rarity];
  const info = caveItem(item.key)!;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 10.5, letterSpacing: ".2em", color: meta.edge, fontWeight: 800 }}>
        동굴의 보물을 얻었다
      </div>
      <div style={{
        width: 120, aspectRatio: "3/4", borderRadius: 12, position: "relative",
        border: `2px solid ${meta.edge}`, background: "var(--ground-2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: meta.glow ? `0 0 22px -4px ${meta.edge}` : "none",
      }}>
        <span style={{ position: "absolute", top: 7, left: 0, right: 0, fontSize: 9, letterSpacing: ".28em", color: meta.edge, fontWeight: 800, textAlign: "center" }}>
          {meta.label}
        </span>
        <span style={{ width: "62%", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: drawCaveItem(item.key) }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 800 }}>{info.name}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>동굴 탭에서 꾸며보자</div>
    </div>
  );
}

const panel: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--edge)",
  borderRadius: "var(--r-lg)", padding: "var(--s5)",
};
function numBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: "14px 0", borderRadius: "var(--r-md)", border: "1px solid var(--edge)",
    background: disabled ? "var(--ground-2)" : "var(--surface)",
    color: disabled ? "var(--ink-3)" : "var(--kin)",
    fontSize: 20, fontWeight: 800, cursor: disabled ? "default" : "pointer",
    fontVariantNumeric: "tabular-nums",
  };
}
