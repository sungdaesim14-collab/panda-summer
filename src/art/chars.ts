/**
 * 검객단 캐릭터 정의 (뿌까풍)
 *
 * 뿌까풍은 눈이 '검은 점' 하나뿐이라 캐릭터가 서로 비슷해지기 쉽다.
 * 그래서 화풍은 그대로 두고 아래 값들을 캐릭터마다 다르게 준다:
 *   - 눈 크기 / 간격 / 높이  → 인상이 가장 크게 갈린다
 *   - 머리 가로세로 비율
 *   - 귀 모양, 주둥이 유무, 볼 위치
 * 이것만으로 점 눈이어도 여섯이 확실히 구분된다.
 */

export type CharKey = "panda" | "tiger" | "fox" | "rabbit" | "wolf" | "owl";
export type EarType = "round" | "point" | "long" | "tuft";
export type MarkType = "patch" | "stripe" | "disc" | "none";

export interface CharDef {
  key: CharKey;
  name: string;
  short: string;
  jp: string;
  theme: string;
  desc: string;

  /* 색 (전부 납작한 단색 — 그라데이션 없음) */
  fur: string;
  ear: string;
  earIn?: string;
  earTip?: string;
  muzzle?: string;
  nose: string;
  cheek: string;
  accent: string;
  accent2: string;

  /* 형태 */
  earType: EarType;
  mark: MarkType;
  headRX: number;   // 머리 가로 반지름
  headRY: number;   // 머리 세로 반지름

  /* 얼굴 배치 — 여섯을 구분짓는 핵심 */
  eyeR: number;     // 눈 가로 반지름
  eyeSquash: number;// 세로/가로 비 (1보다 작으면 가늘게 = 능글맞음)
  eyeGap: number;   // 눈 사이 거리 (좁으면 어리고 순함)
  eyeY: number;     // 눈 높이 (머리 중심 기준 오프셋)
  cheekY: number;
  mouthY: number;
}

export const CHARS: Record<CharKey, CharDef> = {
  panda: {
    key: "panda", name: "판다 검객", short: "판다", jp: "竹",
    theme: "대나무 숲", desc: "차분하고 끈기 있는 대나무 숲의 검객",
    fur: "#FFFFFF", ear: "#2A2320", nose: "#2A2320", cheek: "#F79FB0",
    accent: "#3FA366", accent2: "#28744A",
    earType: "round", mark: "patch", headRX: 58, headRY: 56,
    eyeR: 7.5, eyeSquash: 1.28, eyeGap: 20, eyeY: -2, cheekY: 17, mouthY: 23,
  },
  tiger: {
    key: "tiger", name: "호랑이 검객", short: "호랑이", jp: "炎",
    theme: "불꽃", desc: "불꽃처럼 용맹한 산의 검객",
    fur: "#F9A63F", ear: "#F9A63F", earIn: "#F2C79A", muzzle: "#FFE9C8",
    nose: "#2A2320", cheek: "#F0705C", accent: "#E5432B", accent2: "#AC2E19",
    earType: "round", mark: "stripe", headRX: 58, headRY: 55,
    eyeR: 6.6, eyeSquash: 1.30, eyeGap: 21, eyeY: -4, cheekY: 16, mouthY: 22,
  },
  fox: {
    key: "fox", name: "여우 검객", short: "여우", jp: "月",
    theme: "달빛", desc: "신비롭고 영리한 달빛의 검객",
    fur: "#F0812F", ear: "#F0812F", earIn: "#F9B183", earTip: "#3A2A1E",
    muzzle: "#FFF5E6", nose: "#2A2320", cheek: "#F08A7C",
    accent: "#7C63D6", accent2: "#513F9E",
    earType: "point", mark: "none", headRX: 57, headRY: 53,
    eyeR: 7.2, eyeSquash: 0.92, eyeGap: 23, eyeY: -3, cheekY: 15, mouthY: 22,
  },
  rabbit: {
    key: "rabbit", name: "토끼 검객", short: "토끼", jp: "春",
    theme: "봄꽃", desc: "재빠르고 씩씩한 들판의 검객",
    fur: "#FFFFFF", ear: "#FFFFFF", earIn: "#FBC3D4",
    nose: "#E2698C", cheek: "#F79FB0", accent: "#F06A9B", accent2: "#BE3F6E",
    earType: "long", mark: "none", headRX: 55, headRY: 57,
    eyeR: 8.4, eyeSquash: 1.32, eyeGap: 17, eyeY: -1, cheekY: 18, mouthY: 24,
  },
  wolf: {
    key: "wolf", name: "늑대 검객", short: "늑대", jp: "雪",
    theme: "눈보라", desc: "늠름하고 강인한 설산의 검객",
    fur: "#AABBC7", ear: "#AABBC7", earIn: "#D9E4EB", earTip: "#5D6E7B",
    muzzle: "#EEF4F8", nose: "#2A2320", cheek: "#8FA8BC",
    accent: "#3E8FD6", accent2: "#2A6098",
    earType: "point", mark: "none", headRX: 60, headRY: 54,
    eyeR: 6.8, eyeSquash: 1.06, eyeGap: 24, eyeY: -4, cheekY: 15, mouthY: 22,
  },
  owl: {
    key: "owl", name: "부엉이 검객", short: "부엉이", jp: "星",
    theme: "밤하늘", desc: "지혜롭고 조용한 밤하늘의 검객",
    fur: "#C0915F", ear: "#C0915F", muzzle: "#FBECD2",
    nose: "#F2A03C", cheek: "#D6906D", accent: "#F0B93E", accent2: "#B3831C",
    earType: "tuft", mark: "disc", headRX: 58, headRY: 56,
    eyeR: 10.5, eyeSquash: 1.02, eyeGap: 25, eyeY: -2, cheekY: 20, mouthY: 20,
  },
};

export const CHAR_LIST: CharDef[] = [
  CHARS.panda, CHARS.tiger, CHARS.fox, CHARS.rabbit, CHARS.wolf, CHARS.owl,
];

/** 성장 5단계 — 총 수련일 기준 */
export interface Grade {
  idx: number;
  need: number;
  name: string;
  no: string;
  gain: string;
}

export const GRADES: Grade[] = [
  { idx: 0, need: 0,  name: "아기",   no: "零", gain: "" },
  { idx: 1, need: 5,  name: "수련생", no: "壹", gain: "머리띠와 도복" },
  { idx: 2, need: 12, name: "검객",   no: "貳", gain: "검과 허리띠" },
  { idx: 3, need: 20, name: "달인",   no: "參", gain: "기(氣)의 빛" },
  { idx: 4, need: 30, name: "전설",   no: "肆", gain: "왕관과 별" },
];

export function gradeIndexOf(totalDays: number): number {
  let gi = 0;
  for (const g of GRADES) if (totalDays >= g.need) gi = g.idx;
  return gi;
}
