/**
 * 여름의 32일 — 하루에 한 장씩 열리는 카드
 *
 * 왜 32장인가:
 *   예전 앱은 캐릭터별 16종 × 6 = 97종이었다. 다 모을 수 없는 양이라
 *   중복이 나오고, 마지막 날 도감이 비어 있었다.
 *   32장이면 하루 한 장으로 마지막 날 도감이 정확히 꽉 찬다.
 *
 * 왜 순서가 고정인가:
 *   N일째엔 반드시 N번 카드가 열린다. 운이 개입하지 않는다.
 *   (PROJECT_CONTEXT 5장 — 랜덤 뽑기 금지)
 *
 * 왜 모두가 같은 32장인가:
 *   같은 산을 오르기 때문이다. 친구와 "너도 17번 나왔어?" 할 수 있다.
 *   경쟁이 아니라 같은 길을 걷는 이야기의 공유다.
 *   캐릭터 개성은 이미 6종 × 5단계 + 도복 색으로 충분히 표현된다.
 */
import type { Rarity } from "./cards";

/** 산의 네 구간 — 기존 '약속의 산'과 같은 구획 */
export type Leg = "bamboo" | "mist" | "ridge" | "summit";

export const LEGS: Record<Leg, { name: string; range: string }> = {
  bamboo: { name: "대나무 숲길", range: "1–8일" },
  mist:   { name: "안개 계곡",   range: "9–16일" },
  ridge:  { name: "바람 능선",   range: "17–24일" },
  summit: { name: "눈꽃 정상길", range: "25–32일" },
};

export interface TreasureDef {
  /** 며칠째에 열리는가 = 도감 번호 */
  day: number;
  key: string;
  name: string;
  sub: string;
  leg: Leg;
  rarity: Rarity;
}

function t(day: number, key: string, name: string, sub: string, leg: Leg, rarity: Rarity): TreasureDef {
  return { day, key, name, sub, leg, rarity };
}

export const TREASURES: TreasureDef[] = [
  // 대나무 숲길 — 시작. 흔하고 작은 것들.
  t(1,  "sprout",   "첫 죽순",     "여기서 시작했다",         "bamboo", "common"),
  t(2,  "leaf",     "댓잎",        "바람에 스치는 소리",       "bamboo", "common"),
  t(3,  "dew",      "아침 이슬",   "일찍 일어난 자만 본다",     "bamboo", "common"),
  t(4,  "stream",   "작은 개울",   "쉬어가도 좋다",           "bamboo", "common"),
  t(5,  "stone",    "산길 돌",     "밟고 올라선 자리",         "bamboo", "common"),
  t(6,  "flower",   "들꽃",        "길가에 피어 있던",         "bamboo", "common"),
  t(7,  "butterfly","산 나비",     "일주일을 함께 걸었다",      "bamboo", "common"),
  t(8,  "joint",    "대나무 마디", "마디가 있어 부러지지 않는다", "bamboo", "common"),

  // 안개 계곡 — 흐릿하고 헷갈리는 구간.
  t(9,  "mist",     "골짜기 안개", "앞이 잘 안 보이는 날",      "mist", "common"),
  t(10, "firefly",  "반딧불",      "어두울수록 밝다",          "mist", "common"),
  t(11, "moss",     "이끼 바위",   "오래 버틴 것의 빛깔",       "mist", "common"),
  t(12, "bridge",   "나무 다리",   "건너기로 마음먹었다",       "mist", "common"),
  t(13, "berry",    "산딸기",      "고생 끝의 단맛",           "mist", "rare"),
  t(14, "track",    "사슴 발자국", "먼저 지나간 누군가",        "mist", "rare"),
  t(15, "fall",     "작은 폭포",   "쏟아져도 멈추지 않는다",     "mist", "rare"),
  t(16, "rainbow",  "무지개",      "비 온 뒤에만 나온다",       "mist", "rare"),

  // 바람 능선 — 탁 트이지만 흔들리는 구간.
  t(17, "wind",     "능선의 바람", "맞바람도 앞으로 밀어준다",   "ridge", "rare"),
  t(18, "feather",  "매의 깃털",   "높이 나는 것이 흘린 것",     "ridge", "rare"),
  t(19, "seaCloud", "구름 바다",   "아래를 내려다본 날",        "ridge", "rare"),
  t(20, "sunset",   "능선의 노을", "하루가 저물어도 괜찮다",     "ridge", "rare"),
  t(21, "meteor",   "별똥별",      "빌지 않아도 이미 오고 있다", "ridge", "rare"),
  t(22, "moon",     "초승달",      "조금씩 차오르는 중",        "ridge", "rare"),
  t(23, "lantern",  "산신의 등불", "길을 잃지 않게",           "ridge", "rare"),
  t(24, "thunder",  "먼 천둥",     "무서워도 지나간다",         "ridge", "rare"),

  // 눈꽃 정상길 — 마지막. 드물고 귀한 것들.
  t(25, "snow",     "첫 눈송이",   "정상이 가까워졌다",         "summit", "rare"),
  t(26, "ice",      "얼음 결정",   "천천히 만들어진 것",        "summit", "legend"),
  t(27, "peak",     "설산의 얼굴", "이제 보인다",              "summit", "legend"),
  t(28, "aurora",   "오로라",      "밤을 견딘 자의 하늘",       "summit", "legend"),
  t(29, "dawn",     "새벽 빛",     "가장 어두운 뒤에 온다",      "summit", "legend"),
  t(30, "gale",     "정상의 바람", "여기까지 온 자만 맞는다",    "summit", "legend"),
  t(31, "sunrise",  "해돋이",      "서른한 밤이 걸렸다",        "summit", "legend"),
  t(32, "flag",     "정상의 깃발", "내가 나에게 한 약속을 지켰다", "summit", "legend"),
];

/** 32장 밖의 특별 카드 — 날수가 아니라 용기로 얻는다 */
export interface SpecialDef {
  key: string;
  name: string;
  sub: string;
  how: string;
}

export const SPECIALS: SpecialDef[] = [
  { key: "honest", name: "정직의 보석", sub: "용기로만 얻는 것", how: "솔직하게 고백하면 열린다" },
];

export function treasureOfDay(day: number): TreasureDef | undefined {
  return TREASURES.find((x) => x.day === day);
}

export function legOf(day: number): Leg {
  if (day <= 8) return "bamboo";
  if (day <= 16) return "mist";
  if (day <= 24) return "ridge";
  return "summit";
}
