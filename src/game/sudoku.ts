/**
 * 스도쿠 엔진 — 하루에 하나, 천천히 난이도가 오른다
 *
 * 원칙:
 *  - 그날의 퍼즐은 '날짜'로 고정된다. 같은 날 친구끼리 같은 퍼즐을 푼다.
 *  - 난이도는 수련일에 따라 산의 4구간처럼 오른다 (4x4 → 6x6 → 9x9).
 *  - 아이용이라 항상 '풀리는' 유효한 퍼즐만 낸다.
 *
 * 이건 미니게임이지만 도깨비(보스)와는 무관하다.
 * 보상은 동굴 꾸미기 아이템이며, 메인 수련 루프의 힘에는 영향을 주지 않는다.
 */

/** 시드 기반 난수 — 같은 시드면 같은 퍼즐 (재현성) */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SudokuSpec {
  size: number;     // 4, 6, 9
  boxRows: number;  // 박스 세로 칸수
  boxCols: number;  // 박스 가로 칸수
  blanks: number;   // 빈칸 개수
  level: string;    // 표시용 난이도 이름
}

/**
 * 몇 번째 스도쿠인가(1~)에 따른 난이도.
 * 항상 9x9. 빈칸 수만 서서히 늘려 난이도를 올린다.
 *   시작 34칸 → 회차마다 +1 → 상한 58칸(꽤 어려움).
 * (스도쿠는 보통 빈칸 46~54면 어려움, 55+는 고난도)
 */
export function specForDay(day: number): SudokuSpec {
  const blanks = Math.min(58, 34 + Math.max(0, day - 1));
  const level =
    blanks <= 40 ? "죽순길" :
    blanks <= 48 ? "안개 계곡" :
    blanks <= 54 ? "바람 능선" : "눈꽃 정상";
  return { size: 9, boxRows: 3, boxCols: 3, blanks, level };
}

export type Grid = number[][]; // 0 = 빈칸

export interface Puzzle {
  spec: SudokuSpec;
  puzzle: Grid;    // 문제 (빈칸 0)
  solution: Grid;  // 정답
  given: boolean[][]; // 처음부터 주어진 칸인지 (수정 불가)
}

/** 완성된 유효 그리드를 만든다 (패턴 + 셔플) */
function fullGrid(spec: SudokuSpec, rnd: () => number): Grid {
  const { size, boxRows, boxCols } = spec;

  // 표준 패턴 공식 — 항상 유효한 스도쿠
  const pattern = (r: number, c: number) =>
    (boxCols * (r % boxRows) + Math.floor(r / boxRows) + c) % size;

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const range = (n: number) => Array.from({ length: n }, (_, i) => i);

  // 밴드(가로 묶음)·스택(세로 묶음) 안에서 행·열을 섞는다
  const bands = shuffle(range(boxCols));   // 세로로 몇 개의 밴드
  const rows: number[] = [];
  for (const b of bands) for (const r of shuffle(range(boxRows))) rows.push(b * boxRows + r);

  const stacks = shuffle(range(boxRows));
  const cols: number[] = [];
  for (const s of stacks) for (const c of shuffle(range(boxCols))) cols.push(s * boxCols + c);

  const nums = shuffle(range(size)); // 숫자 리매핑

  const grid: Grid = [];
  for (const r of rows) {
    const row: number[] = [];
    for (const c of cols) row.push(nums[pattern(r, c)] + 1);
    grid.push(row);
  }
  return grid;
}

/** 날짜 문자열을 숫자 시드로 */
function seedFrom(dateISO: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < dateISO.length; i++) h = (Math.imul(h, 31) + dateISO.charCodeAt(i)) | 0;
  return h >>> 0;
}

/** 그날의 퍼즐을 만든다 (날짜로 고정) */
export function makePuzzle(dateISO: string, day: number): Puzzle {
  const spec = specForDay(day);
  const rnd = mulberry32(seedFrom(dateISO, spec.size * 1000 + spec.blanks));
  const solution = fullGrid(spec, rnd);

  // 빈칸 뚫기 — 대칭으로 (보기 좋게)
  const { size } = spec;
  const puzzle = solution.map((r) => r.slice());
  const given = solution.map((r) => r.map(() => true));

  const cells = size * size;
  const order: number[] = [];
  for (let i = 0; i < cells; i++) order.push(i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  let removed = 0;
  for (const idx of order) {
    if (removed >= spec.blanks) break;
    const r = Math.floor(idx / size), c = idx % size;
    if (puzzle[r][c] === 0) continue;
    puzzle[r][c] = 0; given[r][c] = false;
    removed++;
    // 대칭 칸도 (가운데가 아니면)
    const sr = size - 1 - r, sc = size - 1 - c;
    if ((sr !== r || sc !== c) && removed < spec.blanks && puzzle[sr][sc] !== 0) {
      puzzle[sr][sc] = 0; given[sr][sc] = false;
      removed++;
    }
  }

  return { spec, puzzle, solution, given };
}

/**
 * 완성 판정 — '우리 정답과 같은가'가 아니라 '스도쿠 규칙을 다 지켰는가'.
 * 빈칸 많은 9x9는 정답이 여러 개일 수 있어, 아이가 찾은 유효한 답도 인정해야 한다.
 */
export function isSolved(grid: Grid, spec: SudokuSpec): boolean {
  const n = spec.size;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 0) return false;          // 빈칸 남음
      if (isConflict(grid, spec, r, c)) return false; // 규칙 위반
    }
  return true;
}

/** 특정 칸이 규칙에 어긋나는지 (같은 행·열·박스에 같은 수) — 힌트 표시용 */
export function isConflict(grid: Grid, spec: SudokuSpec, r: number, c: number): boolean {
  const v = grid[r][c];
  if (v === 0) return false;
  const n = spec.size;
  for (let i = 0; i < n; i++) {
    if (i !== c && grid[r][i] === v) return true;
    if (i !== r && grid[i][c] === v) return true;
  }
  const br = Math.floor(r / spec.boxRows) * spec.boxRows;
  const bc = Math.floor(c / spec.boxCols) * spec.boxCols;
  for (let i = br; i < br + spec.boxRows; i++)
    for (let j = bc; j < bc + spec.boxCols; j++)
      if ((i !== r || j !== c) && grid[i][j] === v) return true;
  return false;
}
