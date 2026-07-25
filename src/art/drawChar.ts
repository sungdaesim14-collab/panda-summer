/**
 * 캐릭터 SVG 생성기 — 뿌까풍
 *
 * 규칙 (이 셋을 어기면 뿌까풍이 아니게 된다):
 *   1. 그라데이션·그림자·흐림 효과 없음. 전부 납작한 단색.
 *   2. 모든 바깥선은 같은 굵기의 검은 테두리.
 *   3. 얼굴 요소는 최소 — 눈은 검은 점, 눈썹 없음, 입은 아주 작게.
 *
 * 캐릭터 구분은 '그리는 방식'이 아니라 chars.ts의 수치로만 낸다.
 */
import { CHARS, type CharKey, type CharDef } from "./chars";

export const OUTLINE = "#2A2320";

/** 공통 테두리 속성 */
function ol(w: number): string {
  return ` stroke="${OUTLINE}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
}

export interface DrawOpts {
  /** 숨쉬기·눈깜빡임 */
  anim?: boolean;
  /** 발밑 그림자 숨기기 */
  noGround?: boolean;
  /** 접근성 라벨을 직접 지정 */
  label?: string;
}

export function drawChar(key: CharKey, gradeIdx: number, opts: DrawOpts = {}): string {
  const c: CharDef = CHARS[key] ?? CHARS.panda;
  const gi = Math.max(0, Math.min(4, gradeIdx | 0));
  const baby = gi === 0;
  const anim = !!opts.anim;

  // 아기는 머리가 조금 더 크고 몸이 작다
  const hy = baby ? 92 : 88;
  const hrx = c.headRX + (baby ? 2 : 0);
  const hry = c.headRY + (baby ? 2 : 0);
  const hb = hy + hry;
  const bw = baby ? 30 : 34;

  const back: string[] = [];
  const g: string[] = [];

  /* 발밑 그림자 — 흐림 없이 납작한 타원 */
  if (!opts.noGround) {
    back.push(`<ellipse cx="100" cy="207" rx="${bw + 10}" ry="6" fill="${OUTLINE}" opacity="0.16"/>`);
  }

  /* 기(氣)의 빛살 — 달인부터 */
  if (gi >= 3) {
    let rays = "";
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const r1 = Math.max(hrx, hry) + 8;
      const r2 = Math.max(hrx, hry) + 18;
      const w = 0.05;
      const p = (r: number, off: number) =>
        `${(100 + Math.cos(a + off) * r).toFixed(1)} ${(hy + Math.sin(a + off) * r).toFixed(1)}`;
      rays += `<path d="M${p(r2, 0)} L${p(r1, -w)} L${p(r1, w)} Z" fill="${c.accent}"/>`;
    }
    g.push(`<g opacity="0.9">${rays}</g>`);
  }

  /* 검 — 검객부터. 몸 뒤에 그린다 */
  if (gi >= 2) {
    g.push(
      `<g>` +
        `<path d="M148 180 L139 199" fill="none" stroke="${OUTLINE}" stroke-width="11" stroke-linecap="round"/>` +
        `<path d="M154 174 L173 76 L184 80 L165 178 Z" fill="#DDE7EE"${ol(5)}/>` +
        `<path d="M173 76 L183 66 L184 80 Z" fill="#DDE7EE"${ol(5)}/>` +
        `<rect x="141" y="169" width="24" height="9" rx="4" transform="rotate(-64 154 173)" fill="${gi >= 4 ? "#F2C85E" : "#E0B44C"}"${ol(4.5)}/>` +
      `</g>`
    );
  }

  /* 몸 — 아주 단순한 종 모양 */
  const bt = hb + 6;
  const body =
    `M${100 - bw} 196 Q${100 - bw} 202 ${100 - bw + 6} 202 L${100 + bw - 6} 202 ` +
    `Q${100 + bw} 202 ${100 + bw} 196 L${100 + bw} ${bt + 14} ` +
    `C${100 + bw} ${bt + 2} ${100 + 16} ${bt} 100 ${bt} ` +
    `C${100 - 16} ${bt} ${100 - bw} ${bt + 2} ${100 - bw} ${bt + 14} Z`;
  g.push(`<path d="${body}" fill="${c.fur}"${ol(5)}/>`);

  /* 도복 깃 — 수련생부터 */
  if (gi >= 1) {
    const vt = bt + 1;
    const vd = `M${100 - 16} ${vt} L100 ${vt + 22} L${100 + 16} ${vt}`;
    g.push(
      `<path d="${vd}" fill="none" stroke="${OUTLINE}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${vd}" fill="none" stroke="${c.accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }
  /* 허리띠 — 검객부터 */
  if (gi >= 2) {
    g.push(`<rect x="${100 - bw - 2}" y="184" width="${(bw + 2) * 2}" height="12" rx="4" fill="${c.accent2}"${ol(4.5)}/>`);
  }
  /* 금테 — 전설 */
  if (gi >= 4) {
    g.push(`<path d="${body}" fill="none" stroke="#F2C85E" stroke-width="2.5"/>`);
  }

  /* 귀 (머리 뒤) */
  g.push(drawEar(c, hy, hrx, hry, baby));

  /* 머리 */
  g.push(`<ellipse cx="100" cy="${hy}" rx="${hrx}" ry="${hry}" fill="${c.fur}"${ol(5)}/>`);

  /* 얼굴판 / 주둥이 */
  if (c.mark === "disc") {
    g.push(`<circle cx="100" cy="${hy + 4}" r="36" fill="${c.muzzle}"${ol(4.5)}/>`);
  } else if (c.muzzle) {
    g.push(`<ellipse cx="100" cy="${hy + 19}" rx="24" ry="17" fill="${c.muzzle}"${ol(4.5)}/>`);
  }

  /* 무늬 */
  if (c.mark === "patch") {
    const px = c.eyeGap + 1;
    g.push(
      `<ellipse cx="${100 - px}" cy="${hy + c.eyeY}" rx="16" ry="19" fill="${OUTLINE}"/>` +
      `<ellipse cx="${100 + px}" cy="${hy + c.eyeY}" rx="16" ry="19" fill="${OUTLINE}"/>`
    );
  } else if (c.mark === "stripe") {
    g.push(
      `<g fill="none" stroke="${OUTLINE}" stroke-width="5.5" stroke-linecap="round">` +
        `<path d="M100 ${hy - hry + 2} L100 ${hy - hry + 15}"/>` +
        `<path d="M86 ${hy - hry + 5} L90 ${hy - hry + 17}"/>` +
        `<path d="M114 ${hy - hry + 5} L110 ${hy - hry + 17}"/>` +
      `</g>`
    );
  }

  /* 눈 — 검은 점. 흰자도 반사광도 눈썹도 없다. */
  const ey = hy + c.eyeY;
  const erx = c.eyeR;
  const ery = c.eyeR * c.eyeSquash;
  const onPatch = c.mark === "patch";
  const blink = anim
    ? ` style="transform-box:fill-box;transform-origin:50% 50%;animation:pcBlink 5.4s ease-in-out infinite"`
    : "";
  let eyes = `<g${blink}>`;
  for (const d of [-1, 1]) {
    const x = 100 + d * c.eyeGap;
    if (onPatch) eyes += `<ellipse cx="${x}" cy="${ey}" rx="${erx + 3.5}" ry="${ery + 3.5}" fill="#FFFFFF"/>`;
    eyes += `<ellipse cx="${x}" cy="${ey}" rx="${erx}" ry="${ery}" fill="${OUTLINE}"/>`;
  }
  eyes += `</g>`;
  g.push(eyes);

  /* 볼 — 테두리 없는 납작한 원 */
  g.push(
    `<ellipse cx="${100 - hrx + 13}" cy="${hy + c.cheekY}" rx="11" ry="8" fill="${c.cheek}"/>` +
    `<ellipse cx="${100 + hrx - 13}" cy="${hy + c.cheekY}" rx="11" ry="8" fill="${c.cheek}"/>`
  );

  /* 입 — 아주 작게. 코는 생략 (부엉이만 부리) */
  const my = hy + c.mouthY;
  if (c.mark === "disc") {
    g.push(`<path d="M100 ${my - 6} L94 ${my + 2} L100 ${my + 10} L106 ${my + 2} Z" fill="${c.nose}"${ol(3.5)}/>`);
  } else {
    g.push(`<path d="M94 ${my} q6 7 12 0" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/>`);
  }

  /* 배냇털 — 아기만 */
  if (baby) {
    g.push(`<path d="M100 ${hy - hry + 2} q7 -16 -5 -21 q16 3 15 20" fill="${c.fur}"${ol(4)}/>`);
  }

  /* 머리띠 — 수련생부터 */
  if (gi >= 1) {
    const by = hy - hry + 26;
    g.push(
      `<path d="M${100 - hrx - 1} ${by} Q100 ${by - 17} ${100 + hrx + 1} ${by} ` +
      `L${100 + hrx + 1} ${by + 14} Q100 ${by - 3} ${100 - hrx - 1} ${by + 14} Z" fill="${c.accent}"${ol(4.5)}/>` +
      `<g${anim ? ` style="transform-box:fill-box;transform-origin:100% 0%;animation:pcTail 3.6s ease-in-out infinite"` : ""}>` +
        `<path d="M${100 - hrx} ${by + 6} q-24 10 -32 30 q16 -6 25 -15 Z" fill="${c.accent2}"${ol(4.5)}/>` +
      `</g>`
    );
  }

  /* 왕관과 별 — 전설 */
  if (gi >= 4) {
    const cy0 = hy - hry - 6;
    g.push(
      `<path d="M${100 - 30} ${cy0} L${100 - 18} ${cy0 - 24} L${100 - 7} ${cy0 - 7} ` +
      `L100 ${cy0 - 32} L${100 + 7} ${cy0 - 7} L${100 + 18} ${cy0 - 24} L${100 + 30} ${cy0} ` +
      `L${100 + 25} ${cy0 + 13} L${100 - 25} ${cy0 + 13} Z" fill="#F2C85E"${ol(5)}/>` +
      `<circle cx="100" cy="${cy0 + 1}" r="4.5" fill="${c.accent}"/>`
    );
    g.push(star(30, hy - 24, 11, anim, "2.4s") + star(172, hy - 2, 9, anim, "3.2s"));
  }

  const breathe = anim
    ? ` style="transform-box:fill-box;transform-origin:50% 100%;animation:pcBreathe 4.2s ease-in-out infinite"`
    : "";
  back.push(`<g${breathe}>${g.join("")}</g>`);

  const label = opts.label ?? `${c.name} ${["아기", "수련생", "검객", "달인", "전설"][gi]} 단계`;
  return (
    `<svg viewBox="0 0 200 215" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">` +
    back.join("") +
    `</svg>`
  );
}

function star(x: number, y: number, r: number, anim: boolean, dur: string): string {
  const k = r * 0.3;
  return (
    `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} ` +
    `Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z" fill="#F2C85E"${ol(3.5)}>` +
    (anim ? `<animate attributeName="opacity" values="0.3;1;0.3" dur="${dur}" repeatCount="indefinite"/>` : "") +
    `</path>`
  );
}

function drawEar(c: CharDef, hy: number, hrx: number, hry: number, baby: boolean): string {
  const top = hy - hry;

  if (c.earType === "round") {
    const r = baby ? 21 : 22;
    const ey = top + 8;
    let s =
      `<circle cx="${100 - hrx + 6}" cy="${ey}" r="${r}" fill="${c.ear}"${ol(5)}/>` +
      `<circle cx="${100 + hrx - 6}" cy="${ey}" r="${r}" fill="${c.ear}"${ol(5)}/>`;
    if (c.earIn) {
      s +=
        `<circle cx="${100 - hrx + 6}" cy="${ey + 2}" r="${r * 0.5}" fill="${c.earIn}"/>` +
        `<circle cx="${100 + hrx - 6}" cy="${ey + 2}" r="${r * 0.5}" fill="${c.earIn}"/>`;
    }
    return s;
  }

  if (c.earType === "point") {
    const by = top + 26;
    const outer = (m: number) =>
      `<path d="M${100 + m * (hrx - 2)} ${by} L${100 + m * (hrx + 4)} ${by - 46} L${100 + m * 14} ${by - 10} Z" fill="${c.ear}"${ol(5)}/>`;
    let s = outer(-1) + outer(1);
    if (c.earIn) {
      s +=
        `<path d="M${100 - hrx + 4} ${by - 9} L${100 - hrx} ${by - 30} L${100 - 25} ${by - 14} Z" fill="${c.earIn}"/>` +
        `<path d="M${100 + hrx - 4} ${by - 9} L${100 + hrx} ${by - 30} L${100 + 25} ${by - 14} Z" fill="${c.earIn}"/>`;
    }
    if (c.earTip) {
      s +=
        `<path d="M${100 - hrx - 4} ${by - 46} L${100 - hrx + 3} ${by - 27} L${100 - hrx - 9} ${by - 28} Z" fill="${c.earTip}"/>` +
        `<path d="M${100 + hrx + 4} ${by - 46} L${100 + hrx - 3} ${by - 27} L${100 + hrx + 9} ${by - 28} Z" fill="${c.earTip}"/>`;
    }
    return s;
  }

  if (c.earType === "long") {
    const ly = top - 12;
    let s =
      `<ellipse cx="${100 - 24}" cy="${ly}" rx="14" ry="40" transform="rotate(-10 ${100 - 24} ${ly})" fill="${c.ear}"${ol(5)}/>` +
      `<ellipse cx="${100 + 24}" cy="${ly}" rx="14" ry="40" transform="rotate(10 ${100 + 24} ${ly})" fill="${c.ear}"${ol(5)}/>`;
    if (c.earIn) {
      s +=
        `<ellipse cx="${100 - 24}" cy="${ly + 2}" rx="6.5" ry="27" transform="rotate(-10 ${100 - 24} ${ly + 2})" fill="${c.earIn}"/>` +
        `<ellipse cx="${100 + 24}" cy="${ly + 2}" rx="6.5" ry="27" transform="rotate(10 ${100 + 24} ${ly + 2})" fill="${c.earIn}"/>`;
    }
    return s;
  }

  // tuft — 부엉이 깃털 뿔
  const ty = top + 16;
  return (
    `<path d="M${100 - 30} ${ty} L${100 - 40} ${ty - 30} L${100 - 8} ${ty - 6} Z" fill="${c.ear}"${ol(5)}/>` +
    `<path d="M${100 + 30} ${ty} L${100 + 40} ${ty - 30} L${100 + 8} ${ty - 6} Z" fill="${c.ear}"${ol(5)}/>`
  );
}
