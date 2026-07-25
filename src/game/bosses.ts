/**
 * 주간 보스 — "내 방해물의 화신"
 *
 * 설계 원칙 (PROJECT_CONTEXT 1장·5장과 충돌하지 않게):
 *
 *  1. 적은 남이 아니라 '내가 적어낸 방해물'이다.
 *     아이가 WOOP에서 쓴 방해물 문장에서 보스가 만들어진다.
 *     → 이기는 대상이 외부의 악귀가 아니라 자기 자신이 된다.
 *
 *  2. 조작이 없다. 실력·반응속도·운이 개입하지 않는다.
 *     내가 쌓은 수련이 그대로 힘이 되어 자동으로 판정된다. (미니게임 아님)
 *
 *  3. '진다'는 개념이 없다. 못 넘긴 보스는 사라지지 않고 기다린다.
 *     나중에 힘이 쌓이면 자동으로 넘어간다. 진행이 막히지 않는다.
 *
 *  4. 문턱은 절반이다. 완벽하지 않아도 넘는다.
 */

export type BossKind = "mid" | "week" | "final";

export interface BossArchetype {
  id: string;
  name: string;
  /** 방해물 문장에 이 말이 들어 있으면 이 보스가 된다 */
  keywords: string[];
  body: string;
  horn: string;
  eye: string;
  /** 사부가 이 보스를 소개할 때 */
  intro: string;
}

/** 방해물 → 보스. 마지막 것은 아무것도 안 걸렸을 때의 기본값이다. */
export const ARCHETYPES: BossArchetype[] = [
  {
    id: "screen",
    name: "화면 도깨비",
    keywords: ["휴대폰", "폰", "게임", "유튜브", "영상", "티비", "TV", "화면", "쇼츠"],
    body: "#7C63D6", horn: "#5A45A8", eye: "#FFF3C4",
    intro: "빛나는 화면으로 너를 붙잡는 도깨비다.",
  },
  {
    id: "sleep",
    name: "졸음 요괴",
    keywords: ["졸", "잠", "피곤", "눕", "침대", "일어나"],
    body: "#4E7FD1", horn: "#31589B", eye: "#E8F1FF",
    intro: "따뜻한 이불 속으로 너를 끌어당기는 요괴다.",
  },
  {
    id: "lazy",
    name: "게으름 도깨비",
    keywords: ["귀찮", "하기싫", "하기 싫", "싫", "미루", "나중"],
    body: "#C4783A", horn: "#93571F", eye: "#FFEBCB",
    intro: "'나중에 하자'고 속삭이는 도깨비다.",
  },
  {
    id: "noise",
    name: "소란 도깨비",
    keywords: ["동생", "친구", "시끄", "불러", "말 걸", "방해"],
    body: "#D9724A", horn: "#A34A26", eye: "#FFE9D8",
    intro: "네 마음을 자꾸 딴 데로 돌리는 도깨비다.",
  },
  {
    id: "mist",
    name: "흔들리는 안개",
    keywords: [],
    body: "#6E8A80", horn: "#4A625A", eye: "#EAF3EE",
    intro: "형체 없이 마음을 흔드는 안개다.",
  },
];

export function archetypeFor(obstacleText: string): BossArchetype {
  const t = (obstacleText || "").toLowerCase();
  for (const a of ARCHETYPES) {
    if (a.keywords.some((k) => t.includes(k.toLowerCase()))) return a;
  }
  return ARCHETYPES[ARCHETYPES.length - 1];
}

/* ---------------------------------------------------------------
   일정 — 수요일 중간보스, 일요일 주보스, 마지막 날 최종보스
   --------------------------------------------------------------- */

export interface BossSlot {
  kind: BossKind;
  /** 만나는 날 */
  date: string;
  /** 힘을 세는 구간 (이 날짜들의 수련이 힘이 된다) */
  from: string;
  to: string;
  /** 넘어서는 데 필요한 힘 */
  need: number;
  label: string;
}

const DAY = 86400000;

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parse(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * 방학 전체의 보스 일정을 만든다.
 * 중간보스 = 직전 보스 다음날부터 수요일까지
 * 주보스   = 직전 보스 다음날부터 일요일까지
 * 최종보스 = 32일 전체
 */
export function buildSchedule(startDate: string, endDate: string): BossSlot[] {
  const start = parse(startDate);
  const end = parse(endDate);
  const slots: BossSlot[] = [];
  let windowStart = new Date(start.getTime());

  for (let t = start.getTime(); t <= end.getTime(); t += DAY) {
    const d = new Date(t);
    const dow = d.getDay(); // 0=일, 3=수
    const isLast = iso(d) === endDate;
    if (isLast) break;
    if (dow !== 3 && dow !== 0) continue;

    // 구간이 너무 짧으면(2일 미만) 건너뛴다 — 시작 직후 보스가 바로 뜨는 것 방지
    const span = Math.round((t - windowStart.getTime()) / DAY) + 1;
    if (span < 3) continue;

    const mid = dow === 3;
    slots.push({
      kind: mid ? "mid" : "week",
      date: iso(d),
      from: iso(windowStart),
      to: iso(d),
      // 문턱은 구간 절반 — 절반만 해내도 넘는다
      need: Math.max(2, Math.round(span / 2)),
      label: mid ? "중간 도깨비" : "이 주의 우두머리",
    });
    windowStart = new Date(t + DAY);
  }

  const totalDays = Math.round((end.getTime() - start.getTime()) / DAY) + 1;
  slots.push({
    kind: "final",
    date: endDate,
    from: startDate,
    to: endDate,
    need: Math.round(totalDays / 2), // 32일 중 16일
    label: "여름의 마지막 상대",
  });

  return slots;
}

/* ---------------------------------------------------------------
   판정 — 내가 쌓은 것이 그대로 힘이 된다
   --------------------------------------------------------------- */

export interface DayRecord {
  date: string;
  completed: boolean;
  /** 작전으로 방해물을 이긴 날 */
  wonAgainstObstacle: boolean;
  /** 아주 힘들었던 날 (별 5개) */
  wasHard: boolean;
  /** 그날 적어낸 방해물 */
  obstacle: string;
}

export interface PowerLine {
  label: string;
  count: number;
  per: number;
  total: number;
  note: string;
}

export interface BossResult {
  slot: BossSlot;
  boss: BossArchetype;
  lines: PowerLine[];
  power: number;
  need: number;
  cleared: boolean;
  /** 넘지 못했을 때 얼마나 남았는지 */
  remaining: number;
  /** 사부의 말 */
  message: string;
}

export function resolveBoss(slot: BossSlot, logs: DayRecord[]): BossResult {
  const inRange = logs.filter((l) => l.date >= slot.from && l.date <= slot.to && l.completed);

  const days = inRange.length;
  const wins = inRange.filter((l) => l.wonAgainstObstacle).length;
  const hard = inRange.filter((l) => l.wasHard).length;

  const lines: PowerLine[] = [
    { label: "수련한 날", count: days, per: 2, total: days * 2, note: "하루가 검격 둘" },
    { label: "작전으로 이긴 방해물", count: wins, per: 1, total: wins, note: "스스로 세운 작전이 통한 날" },
    { label: "아주 힘들었던 수련", count: hard, per: 1, total: hard, note: "고비를 넘은 날" },
  ];

  const power = lines.reduce((s, l) => s + l.total, 0);
  // 문턱도 같은 단위로 환산 (수련일 need일 ≒ need*2)
  const need = slot.need * 2;
  const cleared = power >= need;

  // 가장 자주 적은 방해물이 이 보스의 정체가 된다
  const counts = new Map<string, number>();
  for (const l of inRange) {
    if (l.obstacle) counts.set(l.obstacle, (counts.get(l.obstacle) ?? 0) + 1);
  }
  let topObstacle = "";
  let topN = 0;
  for (const [k, n] of counts) if (n > topN) { topN = n; topObstacle = k; }

  const boss = archetypeFor(topObstacle);

  return {
    slot, boss, lines, power, need, cleared,
    remaining: Math.max(0, need - power),
    message: messageFor(slot.kind, cleared, days, wins, topObstacle),
  };
}

/**
 * 사부의 말.
 * 넘지 못했을 때 '졌다'는 말을 쓰지 않는다.
 * 결과가 아니라 과정을 짚고, 다음이 열려 있음을 반드시 알린다.
 */
function messageFor(
  kind: BossKind, cleared: boolean, days: number, wins: number, obstacle: string
): string {
  if (cleared) {
    if (kind === "final") {
      return "서른두 밤을 걸어 여기까지 왔구나. 네가 이긴 것은 도깨비가 아니라, 매일 아침의 너 자신이었다.";
    }
    if (kind === "week") {
      return days >= 6
        ? "빈틈이 없었구나. 도깨비가 네 앞에 서지도 못하고 물러갔다."
        : "네가 쌓은 것이 그대로 힘이 되었다. 이것이 수련이란다.";
    }
    return wins > 0
      ? `작전이 통했구나. ${wins}번이나 유혹을 밀어냈으니 도깨비가 당해낼 재간이 없지.`
      : "잘 버텼다. 앞으로 나아가거라.";
  }

  const near = "도깨비는 사라지지 않고 그 자리에서 너를 기다린다. 힘이 쌓이면 언제든 다시 넘어설 수 있단다.";
  if (days === 0) {
    return `이번엔 만나지 못했구나. 괜찮다 — ${near} 내일 한 번이면 충분히 시작이다.`;
  }
  const praise = obstacle
    ? `'${obstacle}' — 이번에 너를 가장 자주 붙잡은 것이지. 그걸 알아낸 것만으로도 큰 수확이다.`
    : `${days}일을 해낸 것은 사라지지 않는다.`;
  return `${praise} ${near}`;
}

/** 아직 못 넘긴 보스를 나중에 다시 판정한다 — 실패가 영구적이지 않도록 */
export function retryPending(slots: BossSlot[], logs: DayRecord[], today: string): BossResult[] {
  return slots
    .filter((s) => s.date <= today)
    .map((s) => resolveBoss({ ...s, to: today }, logs)) // 구간을 오늘까지 늘려서 다시 센다
    .filter((r) => r.cleared);
}
