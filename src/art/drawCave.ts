/**
 * 동굴 보물 그림 + 동굴 배경 — 뿌까풍(납작한 단색 + 굵은 검은 테두리)
 * 형태(shape)별 함수 하나에 색만 바꿔 31종을 그린다.
 */
import { CAVE_ITEMS, type CaveShape } from "../game/cave";

const OL = "#2A2320";
function o(w = 4): string {
  return ` stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
}

/** 아이템 하나를 100x100 viewBox로 */
export function drawCaveItem(key: string): string {
  const item = CAVE_ITEMS.find((i) => i.key === key);
  if (!item) return `<svg viewBox="0 0 100 100"></svg>`;
  const [c1, c2] = item.colors;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${shape(item.shape, c1, c2)}</svg>`;
}

function shape(s: CaveShape, c1: string, c2: string): string {
  switch (s) {
    case "pebble":
      return (
        `<ellipse cx="50" cy="64" rx="34" ry="26" fill="${c1}"${o()}/>` +
        `<ellipse cx="40" cy="54" rx="12" ry="8" fill="${c2}" opacity="0.5"/>`
      );
    case "crystal":
      return (
        `<path d="M50 8 L66 44 L58 90 L42 90 L34 44 Z" fill="${c1}"${o()}/>` +
        `<path d="M50 8 L50 90 M34 44 L66 44" fill="none" stroke="${OL}" stroke-width="2.5"/>` +
        `<path d="M50 8 L42 44 L50 90 Z" fill="${c2}" opacity="0.45"/>` +
        `<path d="M30 34 L22 58 L30 82 L34 58 Z" fill="${c1}"${o(3)}/>` +
        `<path d="M70 34 L78 58 L70 82 L66 58 Z" fill="${c2}"${o(3)}/>`
      );
    case "gem":
      return (
        `<path d="M50 12 L78 38 L50 92 L22 38 Z" fill="${c1}"${o()}/>` +
        `<path d="M22 38 H78 M50 12 L36 38 L50 92 M50 12 L64 38" fill="none" stroke="${OL}" stroke-width="2.5"/>` +
        `<path d="M36 38 L50 12 L64 38 Z" fill="${c2}" opacity="0.5"/>` +
        `<circle cx="34" cy="28" r="3" fill="#fff" opacity="0.7"/>`
      );
    case "mushroom":
      return (
        `<rect x="42" y="52" width="16" height="34" rx="7" fill="#F2E8D2"${o()}/>` +
        `<path d="M18 54 Q50 20 82 54 Q50 66 18 54 Z" fill="${c1}"${o()}/>` +
        `<circle cx="38" cy="44" r="4.5" fill="${c2}"/><circle cx="58" cy="42" r="5.5" fill="${c2}"/>` +
        `<circle cx="50" cy="50" r="3.5" fill="${c2}"/>`
      );
    case "drop":
      return (
        `<path d="M50 12 C64 40 74 52 74 64 A24 24 0 0 1 26 64 C26 52 36 40 50 12 Z" fill="${c1}"${o()}/>` +
        `<path d="M40 58 A10 10 0 0 0 52 50" fill="none" stroke="#fff" stroke-width="4" opacity="0.6" stroke-linecap="round"/>` +
        `<ellipse cx="50" cy="90" rx="20" ry="4" fill="${c2}" opacity="0.5"/>`
      );
    case "shell":
      return (
        `<path d="M50 84 C18 84 14 44 50 18 C86 44 82 84 50 84 Z" fill="${c1}"${o()}/>` +
        `<path d="M50 84 L50 20 M50 80 C36 72 30 52 40 30 M50 80 C64 72 70 52 60 30" fill="none" stroke="${OL}" stroke-width="2.5"/>` +
        `<path d="M50 84 C30 84 26 56 42 34 Z" fill="${c2}" opacity="0.4"/>`
      );
    case "plant":
      return (
        `<path d="M50 90 L50 44" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M50 60 C34 58 26 46 28 34 C42 36 50 48 50 60 Z" fill="${c1}"${o(3.5)}/>` +
        `<path d="M50 52 C66 50 74 38 72 26 C58 28 50 40 50 52 Z" fill="${c2}"${o(3.5)}/>` +
        `<path d="M50 44 C40 40 36 30 40 22 C48 26 50 36 50 44 Z" fill="${c1}"${o(3.5)}/>` +
        `<circle cx="50" cy="20" r="6" fill="${c2}"${o(3)}/>`
      );
    case "fossil":
      return (
        `<circle cx="50" cy="56" r="34" fill="${c1}"${o()}/>` +
        `<path d="M50 30 C60 40 60 52 50 56 C40 60 40 72 50 82" fill="none" stroke="${OL}" stroke-width="3.5"/>` +
        `<path d="M50 40 L58 44 M50 50 L44 54 M50 62 L58 66 M50 72 L44 76" stroke="${OL}" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="50" cy="56" r="34" fill="${c2}" opacity="0.16"/>`
      );
    case "orb":
      return (
        `<circle cx="50" cy="54" r="30" fill="${c1}" opacity="0.28"/>` +
        `<circle cx="50" cy="54" r="20" fill="${c1}"${o()}/>` +
        `<circle cx="43" cy="47" r="6" fill="#fff" opacity="0.6"/>` +
        `<path d="M50 20 L53 30 M50 88 L47 78 M16 54 L26 51 M84 54 L74 57" stroke="${c2}" stroke-width="4" stroke-linecap="round"/>`
      );
    case "stalactite":
      return (
        `<path d="M28 12 L36 12 L33 70 Z" fill="${c1}"${o()}/>` +
        `<path d="M50 12 L60 12 L55 84 Z" fill="${c1}"${o()}/>` +
        `<path d="M70 12 L78 12 L74 60 Z" fill="${c2}"${o()}/>` +
        `<rect x="14" y="8" width="72" height="8" rx="3" fill="${c2}"${o(3)}/>`
      );
  }
}

/** 동굴 배경 — 캐릭터 테마색으로 물든 지하 공간. 아이템 배치용 스팟 좌표 포함 */
export interface CaveSpot { x: number; y: number; }

/** 12개의 배치 스팟 (바닥·벽감) */
export function caveSpots(): CaveSpot[] {
  return [
    { x: 70, y: 300 }, { x: 150, y: 320 }, { x: 240, y: 305 }, { x: 320, y: 322 },
    { x: 110, y: 250 }, { x: 210, y: 245 }, { x: 300, y: 255 },
    { x: 55, y: 200 }, { x: 340, y: 195 },
    { x: 175, y: 355 }, { x: 275, y: 358 }, { x: 90, y: 358 },
  ];
}

/**
 * 동굴 배경. 바위는 어두운 갈색으로 고정하고,
 * 캐릭터색(accent)은 빛무리·웅덩이 반사에만 은은하게 써서 '동굴다움'을 지킨다.
 */
export function drawCaveBackground(accent: string): string {
  const W = 380, H = 400;
  const ROCK = "#3A322C";     // 벽/바닥 바위 (따뜻한 갈색)
  const ROCK_D = "#241E19";   // 천장 어둠
  const L: string[] = [];

  // 벽 전체 어둠
  L.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="${ROCK_D}"/>`);
  // 은은한 빛무리 (캐릭터색) — 작고 투명하게
  L.push(
    `<defs><radialGradient id="cglow"><stop offset="0%" stop-color="${accent}" stop-opacity="0.34"/>` +
    `<stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs>` +
    `<ellipse cx="${W / 2}" cy="220" rx="130" ry="150" fill="url(#cglow)"/>`
  );

  // 종유석 (천장) — 바위색
  const stal = (x: number, h: number, w: number) =>
    `<path d="M${x - w} 0 L${x + w} 0 L${x} ${h} Z" fill="${ROCK_D}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>`;
  L.push(stal(48, 58, 12) + stal(120, 38, 9) + stal(210, 66, 13) + stal(300, 44, 10) + stal(348, 52, 11));

  // 바닥 바위
  L.push(`<path d="M0 ${H} L0 336 Q${W / 2} 302 ${W} 336 L${W} ${H} Z" fill="${ROCK}" stroke="${OL}" stroke-width="3"/>`);

  // 바닥 웅덩이 — 캐릭터색 반사 (어둡게)
  L.push(`<ellipse cx="${W / 2}" cy="372" rx="118" ry="17" fill="${accent}" opacity="0.30"/>`);
  L.push(`<ellipse cx="${W / 2}" cy="372" rx="118" ry="17" fill="${ROCK_D}" opacity="0.45"/>`);
  L.push(`<ellipse cx="${W / 2}" cy="372" rx="118" ry="17" fill="none" stroke="${OL}" stroke-width="2.5"/>`);
  L.push(`<path d="M${W / 2 - 60} 370 q30 -6 60 0" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.5" stroke-linecap="round"/>`);

  // 석순 (바닥에서 솟은) — 바위색
  const sm = (x: number, h: number, w: number) =>
    `<path d="M${x - w} 344 L${x + w} 344 L${x} ${344 - h} Z" fill="${ROCK}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>`;
  L.push(sm(30, 44, 12) + sm(360, 50, 13));

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="수정 동굴">${L.join("")}</svg>`;
}
