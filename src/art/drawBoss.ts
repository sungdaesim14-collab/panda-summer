/**
 * 보스(도깨비) SVG — 캐릭터와 같은 뿌까풍
 *
 * 무섭게 그리지 않는다. 아이가 겁먹을 대상이 아니라
 * '내 안의 방해물'이 눈에 보이는 모습을 한 것뿐이다.
 * 둥글고, 조금 우스꽝스럽고, 넘어설 만해 보이게.
 */
import { OUTLINE } from "./drawChar";
import type { BossArchetype, BossKind } from "../game/bosses";

function ol(w: number): string {
  return ` stroke="${OUTLINE}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
}

export interface BossDrawOpts {
  anim?: boolean;
  /** 넘어선 뒤의 모습 — 김이 빠져 쪼그라든다 */
  defeated?: boolean;
}

export function drawBoss(b: BossArchetype, kind: BossKind, opts: BossDrawOpts = {}): string {
  const anim = !!opts.anim;
  const done = !!opts.defeated;

  // 등급이 올라갈수록 커지고 뿔이 늘어난다
  const scale = kind === "final" ? 1.0 : kind === "week" ? 0.86 : 0.72;
  const horns = kind === "final" ? 3 : kind === "week" ? 2 : 1;

  const cx = 100;
  const cy = 118;
  const rx = 56 * scale;
  const ry = 50 * scale;

  const g: string[] = [];

  /* 그림자 */
  g.push(`<ellipse cx="${cx}" cy="${cy + ry + 16}" rx="${rx * 0.9}" ry="6" fill="${OUTLINE}" opacity="0.18"/>`);

  const float = anim && !done
    ? ` style="transform-box:fill-box;transform-origin:50% 100%;animation:bossFloat 3.4s ease-in-out infinite"`
    : "";

  const inner: string[] = [];

  /* 최종보스만 기운이 뻗는다 */
  if (kind === "final" && !done) {
    let rays = "";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r1 = rx + 12, r2 = rx + 26, w = 0.045;
      const p = (r: number, o: number) =>
        `${(cx + Math.cos(a + o) * r).toFixed(1)} ${(cy + Math.sin(a + o) * r * 0.92).toFixed(1)}`;
      rays += `<path d="M${p(r2, 0)} L${p(r1, -w)} L${p(r1, w)} Z" fill="${b.body}" opacity="0.55"/>`;
    }
    inner.push(rays);
  }

  /* 뿔 */
  const hornY = cy - ry + 4;
  const spread = horns === 1 ? [0] : horns === 2 ? [-1, 1] : [-1, 0, 1];
  for (const s of spread) {
    const hx = cx + s * rx * 0.52;
    const h = 26 * scale * (s === 0 ? 1.2 : 1);
    inner.push(
      `<path d="M${hx - 9 * scale} ${hornY + 6} L${hx} ${hornY - h} L${hx + 9 * scale} ${hornY + 6} Z" fill="${b.horn}"${ol(5)}/>`
    );
  }

  /* 몸 — 둥글둥글한 덩어리 */
  inner.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${b.body}"${ol(5)}/>`);

  /* 아래쪽 삐죽삐죽 (연기처럼) */
  let skirt = `M${cx - rx + 4} ${cy + ry * 0.55}`;
  const n = 5;
  for (let i = 0; i < n; i++) {
    const x0 = cx - rx + 4 + ((rx * 2 - 8) / n) * i;
    const x1 = x0 + (rx * 2 - 8) / n;
    skirt += ` L${(x0 + x1) / 2} ${cy + ry + 10} L${x1} ${cy + ry * 0.55}`;
  }
  inner.push(`<path d="${skirt} Z" fill="${b.horn}" opacity="0.9"/>`);

  /* 눈 — 넘어선 뒤엔 뱅글뱅글 */
  const eyeGap = rx * 0.42;
  const eyeY = cy - ry * 0.12;
  const eyeR = 13 * scale;
  for (const d of [-1, 1]) {
    const x = cx + d * eyeGap;
    inner.push(`<ellipse cx="${x}" cy="${eyeY}" rx="${eyeR}" ry="${eyeR * 1.08}" fill="${b.eye}"${ol(4)}/>`);
    if (done) {
      inner.push(
        `<path d="M${x - eyeR * 0.55} ${eyeY - eyeR * 0.5} L${x + eyeR * 0.55} ${eyeY + eyeR * 0.5}" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M${x + eyeR * 0.55} ${eyeY - eyeR * 0.5} L${x - eyeR * 0.55} ${eyeY + eyeR * 0.5}" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/>`
      );
    } else {
      inner.push(`<ellipse cx="${x + d * 1.5}" cy="${eyeY + 1}" rx="${eyeR * 0.42}" ry="${eyeR * 0.52}" fill="${OUTLINE}"/>`);
    }
  }

  /* 눈썹 — 성난 표정이지만 과하지 않게 */
  if (!done) {
    for (const d of [-1, 1]) {
      const x = cx + d * eyeGap;
      inner.push(
        `<path d="M${x - d * eyeR * 1.1} ${eyeY - eyeR * 1.5} L${x + d * eyeR * 0.9} ${eyeY - eyeR * 0.95}" ` +
        `fill="none" stroke="${OUTLINE}" stroke-width="5" stroke-linecap="round"/>`
      );
    }
  }

  /* 입 */
  const my = cy + ry * 0.42;
  if (done) {
    inner.push(`<ellipse cx="${cx}" cy="${my}" rx="${9 * scale}" ry="${7 * scale}" fill="${OUTLINE}"/>`);
  } else {
    inner.push(
      `<path d="M${cx - 17 * scale} ${my} Q${cx} ${my + 16 * scale} ${cx + 17 * scale} ${my} ` +
      `Q${cx} ${my + 6 * scale} ${cx - 17 * scale} ${my} Z" fill="${OUTLINE}"/>` +
      `<path d="M${cx - 9 * scale} ${my + 1.5} l${4 * scale} ${5 * scale} l${4 * scale} -${5 * scale} Z" fill="#FFFFFF"/>`
    );
  }

  g.push(`<g${float}>${inner.join("")}</g>`);

  const label = done ? `${b.name} — 물러간 모습` : b.name;
  return (
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">` +
    g.join("") +
    `</svg>`
  );
}
