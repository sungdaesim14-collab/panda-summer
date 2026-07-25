/**
 * 수정 동굴 — 스도쿠(두뇌 수련) 완성 보상
 *
 * 31종의 동굴 보물을 모아 자기 동굴을 꾸민다.
 *  - 등급 차별: 일반 15 / 희귀 10 / 전설 6
 *  - 중복 금지: 이미 가진 건 다시 안 나온다 (다 모으면 완성)
 *  - 가챠: '랜덤'은 여기서만 허용된다 (메인 수련 루프는 '노력→확실한 성장' 유지)
 *
 * 다른 유저가 내 동굴을 구경할 수 있다 (경쟁 아니라 함께 보기).
 * 도깨비(보스)와는 무관하다.
 */
import type { OwnedCard } from "../data/types";

export type CaveRarity = "common" | "rare" | "legend";

/** 그림 형태 — drawCave.ts가 이 shape로 그린다 */
export type CaveShape =
  | "pebble" | "crystal" | "gem" | "mushroom" | "drop"
  | "shell" | "plant" | "fossil" | "orb" | "stalactite";

export interface CaveItem {
  key: string;
  name: string;
  shape: CaveShape;
  /** [주색, 보조색] */
  colors: [string, string];
  rarity: CaveRarity;
}

function it(key: string, name: string, shape: CaveShape, c1: string, c2: string, rarity: CaveRarity): CaveItem {
  return { key, name, shape, colors: [c1, c2], rarity };
}

export const CAVE_ITEMS: CaveItem[] = [
  // 일반 15
  it("pebble",   "조약돌",     "pebble",     "#9BAAA0", "#6B7A70", "common"),
  it("mossrock", "이끼 바위",   "pebble",     "#8AA36B", "#5F7C48", "common"),
  it("acorn",    "도토리",     "pebble",     "#B4834E", "#7E5A32", "common"),
  it("sprout",   "여린 새싹",   "plant",      "#6FC98A", "#3E7D52", "common"),
  it("fern",     "고사리",     "plant",      "#5FB37C", "#2F7C4A", "common"),
  it("wpuddle",  "물웅덩이",   "drop",       "#7FB8C9", "#3B7CB0", "common"),
  it("wcrystal", "흰 수정",     "crystal",    "#DDE7EE", "#9FB1BC", "common"),
  it("ycrystal", "노란 수정",   "crystal",    "#F0C044", "#C79424", "common"),
  it("capmush",  "갓버섯",     "mushroom",   "#C4783A", "#93571F", "common"),
  it("firefly",  "반딧불",     "orb",        "#F0C044", "#B3831C", "common"),
  it("shell",    "조개껍질",   "shell",      "#F2CCd6", "#C98BA0", "common"),
  it("smstal",   "작은 종유석", "stalactite", "#B7C4D6", "#7C8D9A", "common"),
  it("snail",    "달팽이",     "shell",      "#C9A47C", "#8A6A44", "common"),
  it("shinyst",  "반짝이 돌",   "pebble",     "#D6C9A0", "#A89460", "common"),
  it("seed",     "빛의 씨앗",   "orb",        "#BFE4A0", "#7CA85C", "common"),

  // 희귀 10
  it("amethyst", "자수정",     "crystal",    "#9B6FD4", "#5E3E9E", "rare"),
  it("aquacry",  "청수정",     "crystal",    "#5FA8DE", "#2E6698", "rare"),
  it("ruby",     "홍옥 원석",   "gem",        "#E0604A", "#A83618", "rare"),
  it("gfall",    "지하 폭포",   "drop",       "#8FD0E2", "#3B7CB0", "rare"),
  it("glowmush", "발광 버섯",   "mushroom",   "#7FE0C0", "#2FA383", "rare"),
  it("bfossil",  "나비 화석",   "fossil",     "#C9B48A", "#8A7248", "rare"),
  it("goldbit",  "황금 조각",   "gem",        "#F0C85A", "#B8892A", "rare"),
  it("rbshell",  "무지개 조개", "shell",      "#E890B0", "#B44E74", "rare"),
  it("crypillar","수정 기둥",   "crystal",    "#C0A0E8", "#7E5AB0", "rare"),
  it("nightpond","밤하늘 웅덩이","drop",       "#4E5E8E", "#2A345C", "rare"),

  // 전설 6
  it("dragonegg","용의 알",     "orb",        "#E0AC48", "#9E7620", "legend"),
  it("starshard","별의 조각",   "gem",        "#F5CE73", "#C79424", "legend"),
  it("rainbowc", "무지개 수정", "crystal",    "#E88EC0", "#7C63D6", "legend"),
  it("ancientf", "고대 화석",   "fossil",     "#D0B87C", "#96773E", "legend"),
  it("lightbloom","빛의 꽃",    "plant",      "#F2C85E", "#E0604A", "legend"),
  it("underland","지하 태양",   "orb",        "#FFD86A", "#E0902A", "legend"),
];

export const CAVE_TOTAL = CAVE_ITEMS.length; // 31

export function caveItem(key: string): CaveItem | undefined {
  return CAVE_ITEMS.find((i) => i.key === key);
}

export const RARITY_META: Record<CaveRarity, { label: string; edge: string; glow: boolean }> = {
  common: { label: "일반", edge: "#8A968C", glow: false },
  rare:   { label: "희귀", edge: "#7FB8C9", glow: false },
  legend: { label: "전설", edge: "#E0AC48", glow: true },
};

/**
 * 가챠 한 번 — 아직 없는 것 중에서 등급 가중치로 하나.
 * 중복 금지: 이미 가진 건 후보에서 빠진다. 다 모았으면 null.
 */
export function rollCaveItem(ownedKeys: Set<string>, rnd: () => number = Math.random): CaveItem | null {
  const remaining = CAVE_ITEMS.filter((i) => !ownedKeys.has(i.key));
  if (remaining.length === 0) return null;

  const weight: Record<CaveRarity, number> = { common: 6, rare: 3, legend: 1 };
  let total = 0;
  for (const i of remaining) total += weight[i.rarity];

  let pick = rnd() * total;
  for (const i of remaining) {
    pick -= weight[i.rarity];
    if (pick <= 0) return i;
  }
  return remaining[remaining.length - 1];
}

/** 내 동굴 아이템만 골라낸다 */
export function myCaveItems(cards: OwnedCard[]): OwnedCard[] {
  return cards.filter((c) => c.kind === "cave");
}
