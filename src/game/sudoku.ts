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
 * 몇 번째 스도쿠인가(1~)와 캐릭터에 따른 난이도. 항상 9x9.
 * blanks는 '목표 빈칸 수'다. 실제로는 유일해가 유지되는 선까지만 빼므로,
 * 논리로 풀리는(추측 필요 없는) 퍼즐이 나온다.
 *
 *  - 토끼(easy=true): 1학년용. 34칸 시작 → 상한 44칸.
 *  - 나머지(easy=false): 조금 도전적. 38칸 시작 → 상한 50칸.
 */
export function specForDay(day: number, easy = false): SudokuSpec {
  const d = Math.max(0, day - 1);
  const blanks = easy
    ? Math.min(44, 34 + d)
    : Math.min(50, 38 + d);
  const level =
    blanks <= 38 ? "새잎길" :
    blanks <= 44 ? "안개 계곡" :
    blanks <= 48 ? "바람 능선" : "눈꽃 정상";
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

/** (r,c)에 v를 놓아도 되나 (행·열·박스 규칙) */
function canPlace(g: Grid, spec: SudokuSpec, r: number, c: number, v: number): boolean {
  const n = spec.size;
  for (let i = 0; i < n; i++) {
    if (g[r][i] === v) return false;
    if (g[i][c] === v) return false;
  }
  const br = Math.floor(r / spec.boxRows) * spec.boxRows;
  const bc = Math.floor(c / spec.boxCols) * spec.boxCols;
  for (let i = br; i < br + spec.boxRows; i++)
    for (let j = bc; j < bc + spec.boxCols; j++)
      if (g[i][j] === v) return false;
  return true;
}

/** 해가 몇 개인지 센다 (limit개에서 멈춤). 유일해 판정용 */
function countSolutions(g: Grid, spec: SudokuSpec, limit: number): number {
  const n = spec.size;
  // 첫 빈칸 찾기
  let er = -1, ec = -1;
  outer: for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (g[r][c] === 0) { er = r; ec = c; break outer; }
  if (er === -1) return 1; // 빈칸 없음 = 완성된 해 하나

  let count = 0;
  for (let v = 1; v <= n; v++) {
    if (canPlace(g, spec, er, ec, v)) {
      g[er][ec] = v;
      count += countSolutions(g, spec, limit - count);
      g[er][ec] = 0;
      if (count >= limit) break;
    }
  }
  return count;
}

/**
 * 그날의 퍼즐 (날짜로 고정). easy는 토끼(1학년용) 여부.
 * 유일해가 유지되는 선까지만 칸을 빼서, 추측 없이 논리로 풀리는 퍼즐을 만든다.
 */
export function makePuzzle(dateISO: string, day: number, easy = false): Puzzle {
  const spec = specForDay(day, easy);
  const rnd = mulberry32(seedFrom(dateISO, spec.size * 1000 + spec.blanks));
  const solution = fullGrid(spec, rnd);

  const { size } = spec;
  const puzzle = solution.map((r) => r.slice());

  // 셀을 랜덤 순서로 하나씩 빼되, 유일해가 깨지면 되돌린다
  const order: number[] = [];
  for (let i = 0; i < size * size; i++) order.push(i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  let removed = 0;
  for (const idx of order) {
    if (removed >= spec.blanks) break;
    const r = Math.floor(idx / size), c = idx % size;
    if (puzzle[r][c] === 0) continue;
    const saved = puzzle[r][c];
    puzzle[r][c] = 0;
    // 유일해가 아니면 되돌린다 (복사본으로 검사)
    if (countSolutions(puzzle.map((row) => row.slice()), spec, 2) !== 1) {
      puzzle[r][c] = saved;
    } else {
      removed++;
    }
  }

  const given = puzzle.map((row) => row.map((v) => v !== 0));
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
