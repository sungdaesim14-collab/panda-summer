/**
 * 32장 카드의 그림 — 캐릭터와 같은 뿌까풍
 * 납작한 단색 + 굵은 검은 테두리. 그라데이션·그림자 없음.
 * 작게 보이므로 도형은 적게, 실루엣이 분명하게.
 */
import { OUTLINE } from "./drawChar";

function o(w = 4.5): string {
  return ` stroke="${OUTLINE}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
}
function line(w = 4.5): string {
  return ` fill="none" stroke="${OUTLINE}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
}

const C = {
  green: "#4CAE6E", greenD: "#2F7C4A", leaf: "#6FC98A",
  blue: "#5FA8DE", blueD: "#3B7CB0", ice: "#BFE4F2",
  gold: "#F0C044", goldD: "#C79424",
  red: "#E0604A", pink: "#F2879F", purple: "#8B6FD4",
  gray: "#9BAAA0", grayD: "#6B7A70", white: "#FBFAF4",
  brown: "#B4834E", brownD: "#7E5A32", night: "#3C4B6B",
};

export function drawItem(key: string): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${shapes(key)}</svg>`;
}

function shapes(key: string): string {
  switch (key) {
    /* ---------- 대나무 숲길 ---------- */
    case "sprout":
      return (
        `<path d="M50 88 C40 70 42 46 50 30 C58 46 60 70 50 88 Z" fill="${C.green}"${o()}/>` +
        `<path d="M50 78 C40 74 34 64 34 54 C44 56 50 66 50 78 Z" fill="${C.leaf}"${o(4)}/>` +
        `<path d="M50 66 C60 62 66 52 66 42 C56 44 50 54 50 66 Z" fill="${C.leaf}"${o(4)}/>` +
        `<path d="M50 30 L50 88"${line(3)}/>`
      );
    case "leaf":
      return (
        `<path d="M52 82 C22 74 16 44 30 22 C58 28 70 56 52 82 Z" fill="${C.leaf}"${o()}/>` +
        `<path d="M30 22 L52 82"${line(3.5)}/>` +
        `<path d="M78 66 C64 62 60 48 66 38 C78 42 84 56 78 66 Z" fill="${C.green}"${o(4)}/>`
      );
    case "dew":
      return (
        `<path d="M20 58 C34 32 66 30 82 46 C68 70 36 74 20 58 Z" fill="${C.leaf}"${o()}/>` +
        `<path d="M20 58 C44 54 66 50 82 46"${line(3.5)}/>` +
        `<path d="M52 34 C60 46 64 52 64 58 A12 12 0 0 1 40 58 C40 52 44 46 52 34 Z" fill="${C.ice}"${o()}/>`
      );
    case "stream":
      return (
        `<path d="M12 40 C30 28 44 52 62 40 C74 32 82 38 90 34"${line(6)}/>` +
        `<path d="M12 40 C30 28 44 52 62 40 C74 32 82 38 90 34" fill="none" stroke="${C.blue}" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M10 60 C28 48 42 72 60 60 C72 52 80 58 88 54"${line(6)}/>` +
        `<path d="M10 60 C28 48 42 72 60 60 C72 52 80 58 88 54" fill="none" stroke="${C.blue}" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M16 78 C32 68 46 86 62 78"${line(5)}/>`
      );
    case "stone":
      return (
        `<ellipse cx="50" cy="72" rx="32" ry="17" fill="${C.gray}"${o()}/>` +
        `<ellipse cx="40" cy="48" rx="21" ry="14" fill="${C.grayD}"${o()}/>` +
        `<ellipse cx="66" cy="42" rx="14" ry="10" fill="${C.gray}"${o(4)}/>`
      );
    case "flower":
      return (
        petals(5, 50, 44, 22, C.pink) +
        `<circle cx="50" cy="44" r="9" fill="${C.gold}"${o()}/>` +
        `<path d="M50 56 L50 86"${line(4.5)}/>` +
        `<path d="M50 74 C38 72 32 64 34 56 C44 56 50 64 50 74 Z" fill="${C.green}"${o(4)}/>`
      );
    case "butterfly":
      return (
        `<path d="M48 50 C30 24 8 32 14 52 C18 68 38 68 48 50 Z" fill="${C.purple}"${o()}/>` +
        `<path d="M52 50 C70 24 92 32 86 52 C82 68 62 68 52 50 Z" fill="${C.purple}"${o()}/>` +
        `<path d="M48 52 C34 74 20 78 22 66 C24 56 38 54 48 52 Z" fill="${C.pink}"${o(4)}/>` +
        `<path d="M52 52 C66 74 80 78 78 66 C76 56 62 54 52 52 Z" fill="${C.pink}"${o(4)}/>` +
        `<ellipse cx="50" cy="54" rx="5" ry="17" fill="${OUTLINE}"/>` +
        `<path d="M47 36 C42 26 38 22 34 20"${line(3.5)}/>` +
        `<path d="M53 36 C58 26 62 22 66 20"${line(3.5)}/>`
      );
    case "joint":
      return (
        `<rect x="36" y="10" width="28" height="80" rx="8" fill="${C.green}"${o()}/>` +
        `<path d="M36 36 L64 36"${line(4)}/>` +
        `<path d="M36 62 L64 62"${line(4)}/>` +
        `<path d="M64 30 C78 26 86 16 86 8 C74 10 66 20 64 30 Z" fill="${C.leaf}"${o(4)}/>` +
        `<path d="M36 56 C22 52 14 42 14 34 C26 36 34 46 36 56 Z" fill="${C.leaf}"${o(4)}/>`
      );

    /* ---------- 안개 계곡 ---------- */
    case "mist":
      return (
        `<path d="M14 36 H62" ${line(9)}/><path d="M14 36 H62" fill="none" stroke="${C.white}" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M32 54 H88" ${line(9)}/><path d="M32 54 H88" fill="none" stroke="${C.white}" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M18 72 H70" ${line(9)}/><path d="M18 72 H70" fill="none" stroke="${C.white}" stroke-width="4" stroke-linecap="round"/>`
      );
    case "firefly":
      return (
        `<circle cx="50" cy="52" r="26" fill="${C.gold}" opacity="0.22"/>` +
        `<circle cx="50" cy="52" r="16" fill="${C.gold}" opacity="0.4"/>` +
        `<ellipse cx="50" cy="54" rx="11" ry="13" fill="${C.gold}"${o()}/>` +
        `<path d="M42 44 C30 34 26 24 30 20 C38 24 42 36 42 44 Z" fill="${C.white}"${o(3.5)}/>` +
        `<path d="M58 44 C70 34 74 24 70 20 C62 24 58 36 58 44 Z" fill="${C.white}"${o(3.5)}/>`
      );
    case "moss":
      return (
        `<ellipse cx="50" cy="66" rx="34" ry="22" fill="${C.gray}"${o()}/>` +
        `<path d="M18 60 C24 44 40 38 52 42 C64 38 78 46 82 60 C64 52 34 52 18 60 Z" fill="${C.green}"${o(4)}/>` +
        `<circle cx="34" cy="70" r="3.5" fill="${C.grayD}"/><circle cx="62" cy="74" r="3" fill="${C.grayD}"/>`
      );
    case "bridge":
      return (
        `<path d="M8 44 C30 62 70 62 92 44"${line(6)}/>` +
        `<rect x="14" y="46" width="72" height="12" rx="4" fill="${C.brown}"${o()}/>` +
        `<path d="M32 46 L32 58 M50 46 L50 58 M68 46 L68 58"${line(3)}/>` +
        `<path d="M16 58 L16 76 M84 58 L84 76"${line(5)}/>`
      );
    case "berry":
      return (
        `<circle cx="38" cy="60" r="15" fill="${C.red}"${o()}/>` +
        `<circle cx="64" cy="56" r="13" fill="${C.red}"${o()}/>` +
        `<circle cx="52" cy="76" r="11" fill="${C.pink}"${o(4)}/>` +
        `<path d="M40 44 C36 30 30 24 22 22 C34 20 44 30 46 42" fill="${C.green}"${o(3.5)}/>`
      );
    case "track":
      return (
        `<ellipse cx="36" cy="38" rx="9" ry="14" transform="rotate(-12 36 38)" fill="${C.brownD}"${o(4)}/>` +
        `<ellipse cx="52" cy="36" rx="9" ry="14" transform="rotate(-12 52 36)" fill="${C.brownD}"${o(4)}/>` +
        `<ellipse cx="46" cy="70" rx="9" ry="14" transform="rotate(8 46 70)" fill="${C.brown}"${o(4)}/>` +
        `<ellipse cx="62" cy="68" rx="9" ry="14" transform="rotate(8 62 68)" fill="${C.brown}"${o(4)}/>`
      );
    case "fall":
      return (
        `<path d="M12 16 H44 V62 C44 76 30 84 22 78 C14 72 12 58 12 44 Z" fill="${C.grayD}"${o()}/>` +
        `<path d="M44 16 H60 C62 44 58 70 46 86 C40 66 42 40 44 16 Z" fill="${C.blue}"${o()}/>` +
        `<path d="M50 30 C50 48 48 64 46 76"${line(3)}/>` +
        `<ellipse cx="56" cy="88" rx="26" ry="8" fill="${C.ice}"${o(4)}/>`
      );
    case "rainbow":
      return (
        arc(50, 78, 38, C.red) + arc(50, 78, 30, C.gold) +
        arc(50, 78, 22, C.green) + arc(50, 78, 14, C.blue)
      );

    /* ---------- 바람 능선 ---------- */
    case "wind":
      return (
        `<path d="M12 34 H58 A11 11 0 1 0 47 23"${line(6)}/>` +
        `<path d="M16 54 H72 A9 9 0 1 1 63 63"${line(6)}/>` +
        `<path d="M20 74 H50 A8 8 0 1 0 42 66"${line(6)}/>`
      );
    case "feather":
      return (
        `<path d="M62 16 C34 30 22 56 26 78 C50 74 70 50 62 16 Z" fill="${C.ice}"${o()}/>` +
        `<path d="M62 16 C50 40 38 62 26 78"${line(3.5)}/>` +
        `<path d="M44 34 L54 40 M38 48 L48 54 M33 62 L43 68"${line(2.5)}/>` +
        `<path d="M26 78 L18 90"${line(4)}/>`
      );
    case "seaCloud":
      return (
        `<path d="M14 60 A14 14 0 0 1 32 46 A18 18 0 0 1 66 46 A13 13 0 0 1 82 60 Z" fill="${C.white}"${o()}/>` +
        `<path d="M22 78 A11 11 0 0 1 36 66 A15 15 0 0 1 64 68 A10 10 0 0 1 76 78 Z" fill="${C.ice}"${o(4)}/>` +
        `<path d="M40 32 L50 18 L60 32 Z" fill="${C.grayD}"${o(4)}/>`
      );
    case "sunset":
      return (
        `<path d="M18 62 A32 32 0 0 1 82 62 Z" fill="${C.gold}"${o()}/>` +
        `<path d="M8 62 H92"${line(6)}/>` +
        `<path d="M18 76 H82"${line(5)}/><path d="M18 76 H82" fill="none" stroke="${C.red}" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M28 88 H72"${line(4)}/>`
      );
    case "meteor":
      return (
        star4(66, 34, 20, C.gold) +
        `<path d="M52 46 L18 80"${line(7)}/>` +
        `<path d="M52 46 L18 80" fill="none" stroke="${C.gold}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M60 56 L36 80"${line(5)}/>` +
        `<circle cx="24" cy="34" r="3.5" fill="${C.white}"/>`
      );
    case "moon":
      return (
        `<path d="M62 12 A40 40 0 1 0 62 88 A32 32 0 1 1 62 12 Z" fill="${C.gold}"${o()}/>` +
        `<circle cx="80" cy="26" r="4" fill="${C.white}"/>`
      );
    case "lantern":
      return (
        `<path d="M50 10 L50 20"${line(4)}/>` +
        `<rect x="30" y="20" width="40" height="8" rx="3" fill="${C.brownD}"${o(4)}/>` +
        `<path d="M28 30 C22 46 22 62 28 76 H72 C78 62 78 46 72 30 Z" fill="${C.red}"${o()}/>` +
        `<path d="M25 44 H75 M25 60 H75"${line(3)}/>` +
        `<rect x="34" y="76" width="32" height="8" rx="3" fill="${C.brownD}"${o(4)}/>` +
        `<path d="M50 84 L50 94"${line(4)}/>`
      );
    case "thunder":
      return (
        `<path d="M18 52 A14 14 0 0 1 34 38 A19 19 0 0 1 68 38 A13 13 0 0 1 82 52 Z" fill="${C.grayD}"${o()}/>` +
        `<path d="M54 52 L36 76 H50 L44 94 L66 66 H52 Z" fill="${C.gold}"${o()}/>`
      );

    /* ---------- 눈꽃 정상길 ---------- */
    case "snow":
      return snowflake(50, 50, 36, C.ice);
    case "ice":
      return (
        `<path d="M50 10 L82 30 V70 L50 90 L18 70 V30 Z" fill="${C.ice}"${o()}/>` +
        `<path d="M50 10 L50 90 M18 30 L82 70 M82 30 L18 70"${line(3)}/>` +
        `<path d="M50 30 L66 40 V60 L50 70 L34 60 V40 Z" fill="${C.white}"${o(3.5)}/>`
      );
    case "peak":
      return (
        `<path d="M8 82 L36 34 L52 60 L64 42 L92 82 Z" fill="${C.grayD}"${o()}/>` +
        `<path d="M36 34 L26 52 C32 48 40 50 44 54 L52 60 Z" fill="${C.white}"${o(3.5)}/>` +
        `<path d="M64 42 L56 54 C62 52 68 54 72 58 L64 42 Z" fill="${C.white}"${o(3.5)}/>`
      );
    case "aurora":
      return (
        `<path d="M14 76 C22 40 34 26 44 20"${line(11)}/>` +
        `<path d="M14 76 C22 40 34 26 44 20" fill="none" stroke="${C.green}" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M38 82 C46 46 56 28 66 18"${line(11)}/>` +
        `<path d="M38 82 C46 46 56 28 66 18" fill="none" stroke="${C.ice}" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M62 84 C70 52 78 34 86 24"${line(11)}/>` +
        `<path d="M62 84 C70 52 78 34 86 24" fill="none" stroke="${C.purple}" stroke-width="6" stroke-linecap="round"/>`
      );
    case "dawn":
      return (
        `<path d="M8 74 H92"${line(6)}/>` +
        `<path d="M24 74 A26 26 0 0 1 76 74 Z" fill="${C.gold}"${o()}/>` +
        `<path d="M50 14 L50 30 M22 26 L32 38 M78 26 L68 38 M10 52 L24 56 M90 52 L76 56"${line(4.5)}/>`
      );
    case "gale":
      return (
        `<path d="M10 30 H54 A12 12 0 1 0 42 18"${line(7)}/>` +
        `<path d="M14 52 H74 A10 10 0 1 1 64 62"${line(7)}/>` +
        `<path d="M10 74 H46 A9 9 0 1 0 37 65"${line(7)}/>` +
        `<path d="M62 34 L84 30 M66 78 L86 74"${line(5)}/>`
      );
    case "sunrise":
      return (
        `<circle cx="50" cy="60" r="24" fill="${C.gold}"${o()}/>` +
        `<path d="M6 78 H94"${line(7)}/>` +
        `<path d="M50 16 L50 28 M18 26 L27 36 M82 26 L73 36 M6 56 H18 M82 56 H94"${line(5)}/>` +
        `<path d="M20 90 H80"${line(5)}/>`
      );
    case "flag":
      return (
        `<path d="M10 84 L40 32 L58 60 L70 44 L90 84 Z" fill="${C.white}"${o()}/>` +
        `<path d="M40 32 L30 50 C36 46 44 48 48 52 L58 60 Z" fill="${C.ice}"${o(3.5)}/>` +
        `<path d="M50 12 L50 58"${line(5)}/>` +
        `<path d="M52 14 L84 22 L52 32 Z" fill="${C.red}"${o()}/>` +
        star4(24, 22, 13, C.gold) + star4(76, 52, 10, C.gold)
      );

    /* ---------- 특별 ---------- */
    case "honest":
      return (
        `<path d="M50 12 L80 36 L50 90 L20 36 Z" fill="${C.ice}"${o()}/>` +
        `<path d="M20 36 H80 M50 12 L36 36 L50 90 M50 12 L64 36"${line(3.5)}/>` +
        `<circle cx="38" cy="26" r="4" fill="${C.white}"/>`
      );

    default:
      return `<circle cx="50" cy="50" r="30" fill="${C.gray}"${o()}/>`;
  }
}

/* ---------- 도우미 ---------- */

function petals(n: number, cx: number, cy: number, r: number, fill: string): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360;
    s += `<ellipse cx="${cx}" cy="${cy - r * 0.62}" rx="${r * 0.42}" ry="${r * 0.66}" ` +
         `transform="rotate(${a} ${cx} ${cy})" fill="${fill}"${o(4)}/>`;
  }
  return s;
}

function arc(cx: number, cy: number, r: number, color: string): string {
  const d = `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return `<path d="${d}"${line(9)}/><path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`;
}

function star4(x: number, y: number, r: number, fill: string): string {
  const k = r * 0.3;
  return `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} ` +
         `Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z" fill="${fill}"${o(3.5)}/>`;
}

function snowflake(cx: number, cy: number, r: number, color: string): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x2 = cx + Math.cos(a) * r, y2 = cy + Math.sin(a) * r;
    const bx = cx + Math.cos(a) * r * 0.58, by = cy + Math.sin(a) * r * 0.58;
    const p = a + 0.6, m = a - 0.6;
    s += `<path d="M${cx} ${cy} L${x2.toFixed(1)} ${y2.toFixed(1)}"${line(6)}/>`;
    s += `<path d="M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + Math.cos(p) * r * 0.3).toFixed(1)} ${(by + Math.sin(p) * r * 0.3).toFixed(1)}"${line(4.5)}/>`;
    s += `<path d="M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + Math.cos(m) * r * 0.3).toFixed(1)} ${(by + Math.sin(m) * r * 0.3).toFixed(1)}"${line(4.5)}/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="7" fill="${color}"${o(4)}/>`;
  return s;
}
