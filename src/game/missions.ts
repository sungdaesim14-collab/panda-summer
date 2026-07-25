/**
 * 매일의 수련 목록과 WOOP 작전 선택지
 *
 * WOOP = Wish · Outcome · Obstacle · Plan (심리학자 가브리엘레 외팅겐의 기법)
 * 이 앱에서는 아이가 버튼 세 번으로 15초 안에 끝낼 수 있게 줄였다.
 * 직접 쓰기도 늘 열어둔다 — '스스로 정한다'가 1장의 첫 기둥이기 때문.
 */

export const DEFAULT_MISSIONS: string[] = [
  "책 30분 읽기",
  "휴대폰, 정한 만큼만 쓰기",
  "공부 정한 분량 끝내기",
  "운동하기 (줄넘기, 산책 등)",
  "내 방 스스로 정리하기",
  "정한 시간에 일어나기",
  "명상 1분 하기",
  "취미 연습하기",
  "집안일 하나 돕기",
  "하기 싫지만 해야 할 일 1개 해치우기",
];

export const MAX_MISSIONS = 5;

export interface WoopStep {
  key: "outcome" | "obstacle" | "plan";
  step: string;
  question: string;
  hint: string;
  options: string[];
  placeholder: string;
}

export const WOOP: WoopStep[] = [
  {
    key: "outcome",
    step: "하나",
    question: "오늘 이걸 다 해내면, 어떤 기분일까?",
    hint: "먼저 그려보는 것만으로도 해낼 확률이 올라간단다.",
    options: [
      "뿌듯할 것 같아",
      "후련할 것 같아",
      "나 자신이 좀 멋져 보일 것 같아",
      "마음 편하게 잘 수 있을 것 같아",
    ],
    placeholder: "직접 쓰기",
  },
  {
    key: "obstacle",
    step: "둘",
    question: "그런데 오늘, 뭐가 너를 방해할까?",
    hint: "미리 아는 방해물은 절반쯤 이긴 것이다.",
    options: [
      "휴대폰·게임이 하고 싶어져",
      "졸리고 눕고 싶어져",
      "동생이나 친구가 불러서",
      "그냥 귀찮아져",
      "하기 싫은 마음이 들어",
    ],
    placeholder: "직접 쓰기",
  },
  {
    key: "plan",
    step: "셋",
    question: "그러면, 그때 어떻게 하겠느냐?",
    hint: "'만약 ~하면, ~하겠다'를 미리 정해두면 몸이 먼저 움직인다.",
    options: [
      "딱 5분만 참고 먼저 하기",
      "휴대폰을 다른 방에 두고 오기",
      "방문 닫고 하기",
      "물 한 잔 마시고 다시 앉기",
      "알림을 꺼두기",
    ],
    placeholder: "직접 쓰기",
  },
];

/** 완료 화면의 '작전 회고' */
export const WIN_OPTIONS = [
  { key: "win",  label: "통했어! 방해물을 이겼어" },
  { key: "lose", label: "방해물한테 졌어 (괜찮아)" },
  { key: "none", label: "방해물이 안 왔어" },
] as const;

export type WinKey = (typeof WIN_OPTIONS)[number]["key"];

/** 한 줄 기록의 물음 — 매번 다른 것이 뜬다 */
export const NOTE_PROMPTS = [
  "오늘 수련, 시작 전과 후의 기분이 어떻게 달랐어?",
  "오늘 제일 하기 싫었던 순간은 언제였어?",
  "하다 보니 재밌어진 부분이 있었어?",
  "오늘 나를 도와준 건 뭐였을까?",
  "시간이 빨리 갔던 순간이 있었어?",
  "내일의 나에게 한마디 남긴다면?",
];

/* ---------------------------------------------------------------
   판다 사부의 말 — 같은 말이 반복되면 사흘이면 질린다
   --------------------------------------------------------------- */

export const SABU = {
  pick: [
    "수련의 시작은 '내가 정하는 것'이다. 오늘은 무엇에 도전하겠느냐?",
    "많이 고르는 것보다, 지킬 수 있는 만큼 약속하고 전부 지키는 것이 진짜 실력이란다.",
    "오늘의 너를 정하는 건 오늘의 너다. 천천히 골라보거라.",
    "하나만 골라 확실히 지켜도 아주 훌륭하다.",
  ],
  planDone: [
    "작전이 섰구나. 이제 해내는 일만 남았다.",
    "미리 정해둔 자는 흔들려도 되돌아온다. 다녀오거라.",
    "좋다. 방해물이 오거든 네가 정한 대로 하면 된다.",
  ],
  checking: [
    "해낸 것을 체크하거라. 정직하게.",
    "다 못 했어도 괜찮다. 한 것만 체크하면 된다.",
    "오늘의 너를 있는 그대로 남기거라.",
  ],
  wonAll: [
    "오늘의 약속을 전부 지켰구나. 훌륭하다.",
    "빈틈이 없었다. 이런 날이 쌓여 검객이 되는 것이다.",
    "스스로 한 약속을 스스로 지켰다. 그것이 가장 어려운 일이지.",
  ],
  wonSome: [
    "전부는 아니어도, 해낸 것은 분명히 남는다.",
    "하나라도 해낸 날과 아예 하지 않은 날은 하늘과 땅 차이다.",
    "오늘 네가 움직인 만큼 산을 올랐다.",
  ],
  comeback: [
    "돌아왔구나. 쉬었다가 다시 시작하는 것이야말로 진짜 용기다.",
    "며칠 쉬어도 길은 사라지지 않는다. 다시 걸으면 그만이지.",
    "가장 어려운 건 시작이 아니라 '다시' 시작하는 것이란다. 잘 왔다.",
  ],
} as const;

export function pickLine(pool: readonly string[], seed: number): string {
  return pool[Math.abs(seed) % pool.length];
}

/** 오늘 날짜를 씨앗으로 — 같은 날엔 같은 말, 다음 날엔 다른 말 */
export function daySeed(dateISO: string): number {
  let h = 0;
  for (let i = 0; i < dateISO.length; i++) h = (h * 31 + dateISO.charCodeAt(i)) | 0;
  return h;
}
