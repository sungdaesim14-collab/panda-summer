/**
 * 카드 — 앱의 모든 수집물을 담는 하나의 그릇
 *
 * 중요한 결정 (PROJECT_CONTEXT 5장):
 *   카드의 '생김새'만 쓰고 카드게임의 '규칙'은 쓰지 않는다.
 *   팩 개봉·덱 대전·강화 합성·턴제 전투는 넣지 않는다.
 *
 * 그리고 카드는 수집품이 아니라 '그날의 박제'다.
 * 뒷면에 그날의 기록(한 수련·이긴 방해물·자기 칭찬)이 박힌다.
 * 그래서 카드를 모으는 일이 곧 자기 여름을 기록하는 일이 된다.
 */

export type Rarity = "common" | "rare" | "legend" | "special";
export type CardKind = "treasure" | "kata" | "char" | "boss" | "title";

export interface RarityStyle {
  key: Rarity;
  label: string;
  /** 테두리 */
  edge: string;
  /** 카드 바탕 물듦 */
  tint: string;
  /** 이름표 글자색 */
  ink: string;
  /** 빛나는가 */
  glow: boolean;
  /** 모서리 장식 */
  ornament: boolean;
}

export const RARITY: Record<Rarity, RarityStyle> = {
  common: {
    key: "common", label: "일 반",
    edge: "#6E7A64", tint: "rgba(110,122,100,0.10)", ink: "#9AA890",
    glow: false, ornament: false,
  },
  rare: {
    key: "rare", label: "희 귀",
    edge: "#7FB8C9", tint: "rgba(127,184,201,0.13)", ink: "#A7D5E2",
    glow: false, ornament: true,
  },
  legend: {
    key: "legend", label: "전 설",
    edge: "#E0AC48", tint: "rgba(224,172,72,0.16)", ink: "#F5CE73",
    glow: true, ornament: true,
  },
  special: {
    // 노력이 아니라 '용기'로 얻는 것 — 정직의 보석처럼
    key: "special", label: "특 별",
    edge: "#D4604A", tint: "rgba(212,96,74,0.14)", ink: "#F09080",
    glow: true, ornament: true,
  },
};

/** 카드 뒷면에 박히는 그날의 기록 */
export interface CardRecord {
  date: string;
  /** 그날 해낸 수련들 */
  missions: string[];
  /** 그날 이긴 방해물 (없으면 빈 문자열) */
  beatObstacle: string;
  /** 그날 아이가 쓴 자기 칭찬 */
  selfPraise: string;
}

export interface CardData {
  id: string;
  kind: CardKind;
  name: string;
  /** 이름 아래 한 줄 */
  sub: string;
  rarity: Rarity;
  /** 도감 번호 */
  no?: string;
  /** 아직 못 얻었으면 없음 */
  record?: CardRecord;
}

export function isOwned(c: CardData): boolean {
  return !!c.record;
}
