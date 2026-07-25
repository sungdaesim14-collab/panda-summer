/**
 * 약속의 산 — 32일 여정을 하나의 그림으로
 *
 * 뿌까풍과 같은 규칙: 납작한 단색 + 굵은 검은 테두리.
 * 산을 네 구간으로 나눈다(도감의 네 구간과 같다):
 *   대나무 숲길(1–8) → 안개 계곡(9–16) → 바람 능선(17–24) → 눈꽃 정상길(25–32)
 * 구불구불한 등산로 위에 32개의 점이 있고, 지금까지 온 만큼 금색으로 채워진다.
 * 캐릭터는 현재 위치(오늘의 수련일)에 서 있다.
 *
 * 좌표계: viewBox 0 0 360 560 (세로로 길다 = 위로 오르는 산)
 */
import { drawChar } from "./drawChar";
import type { CharKey } from "./chars";

const OL = "#2A2320";
function o(w = 4): string {
  return ` stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
}

const C = {
  sky1: "#20304A", sky2: "#3A4E6E",
  bambooHill: "#3E7D52", mistHill: "#4C6E8A", ridgeHill: "#7C6E9E", snowHill: "#C9D6E4",
  bamboo: "#5FB37C", path: "#6B5A3E", pathOn: "#E0AC48",
  cloud: "#B7C4D6", snow: "#F3F7FC", sun: "#F0C044",
  post: "#8A6A44",
};

export interface MountainOpts {
  charKey: CharKey;
  /** 총 수련일 (0~32) — 여기까지 길이 켜지고 캐릭터가 여기 선다 */
  totalDays: number;
  /** 캐릭터 외형 등급 */
  grade: number;
  width?: number;
}

/** 등산로 위 32개 지점의 좌표 (아래=1일, 위=32일) */
function pathPoints(): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  // 아래(y=520)에서 위(y=60)로. x는 좌우로 구불구불.
  for (let i = 0; i < 32; i++) {
    const t = i / 31;
    const y = 522 - t * 462;
    // 3번 굽이치는 사인 곡선 + 위로 갈수록 가운데로 모임
    const sway = Math.sin(t * Math.PI * 3.1) * (70 * (1 - t * 0.55));
    const x = 180 + sway;
    pts.push({ x, y });
  }
  return pts;
}

export function drawMountain(opts: MountainOpts): string {
  const { charKey, grade } = opts;
  const total = Math.max(0, Math.min(32, opts.totalDays));
  const pts = pathPoints();

  const layers: string[] = [];

  /* 하늘 */
  layers.push(
    `<defs><linearGradient id="msky" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="${C.sky1}"/><stop offset="100%" stop-color="${C.sky2}"/>` +
    `</linearGradient></defs>` +
    `<rect x="0" y="0" width="360" height="560" fill="url(#msky)"/>`
  );

  /* 달과 별 */
  layers.push(`<circle cx="300" cy="70" r="30" fill="${C.sun}"${o(3)}/>`);
  layers.push(`<circle cx="290" cy="60" r="9" fill="${C.sky1}"/>`);
  for (const [sx, sy, sr] of [[60, 50, 2.5], [120, 90, 2], [200, 40, 2.2], [40, 130, 1.8], [330, 150, 2]] as const) {
    layers.push(`<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${C.snow}"/>`);
  }

  /* 산 실루엣 — 네 겹 (뒤에서 앞으로, 위에서 아래로 구간) */
  // 눈꽃 정상 (가장 위, 가장 뒤)
  layers.push(`<path d="M0 200 L120 70 L180 130 L250 60 L360 190 L360 320 L0 320 Z" fill="${C.snowHill}"${o(4)}/>`);
  layers.push(`<path d="M120 70 L95 108 Q140 96 160 118 L180 130 Q150 100 120 70 Z" fill="${C.snow}"${o(3)}/>`);
  layers.push(`<path d="M250 60 L228 98 Q262 88 282 110 L360 190 Q300 120 250 60 Z" fill="${C.snow}"${o(3)}/>`);
  // 바람 능선
  layers.push(`<path d="M0 300 L90 210 L180 280 L280 200 L360 300 L360 400 L0 400 Z" fill="${C.ridgeHill}"${o(4)}/>`);
  // 안개 계곡
  layers.push(`<path d="M0 380 L110 320 L210 380 L320 320 L360 360 L360 470 L0 470 Z" fill="${C.mistHill}"${o(4)}/>`);
  // 대나무 숲 (가장 앞, 아래)
  layers.push(`<path d="M0 450 L100 410 L200 460 L300 415 L360 450 L360 560 L0 560 Z" fill="${C.bambooHill}"${o(4)}/>`);

  /* 대나무 몇 그루 (맨 아래) */
  for (const [bx, bh] of [[30, 90], [58, 70], [330, 80], [305, 60]] as const) {
    layers.push(
      `<rect x="${bx}" y="${560 - bh}" width="9" height="${bh}" rx="4" fill="${C.bamboo}"${o(3)}/>` +
      `<path d="M${bx + 9} ${560 - bh + 14} q18 -6 26 4 q-16 6 -26 -4Z" fill="${C.bamboo}"${o(2.5)}/>`
    );
  }

  /* 안개 계곡의 안개 띠 */
  for (const [mx, my, mw] of [[80, 360, 90], [230, 345, 80], [150, 375, 70]] as const) {
    layers.push(`<rect x="${mx}" y="${my}" width="${mw}" height="7" rx="3.5" fill="${C.cloud}" opacity="0.7"/>`);
  }

  /* 등산로 — 전체를 어두운 길로 먼저 깔고, 지나온 만큼 금색으로 덮는다 */
  const dAll = pathToD(pts, 0, 31);
  layers.push(`<path d="${dAll}" fill="none" stroke="${OL}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`);
  layers.push(`<path d="${dAll}" fill="none" stroke="${C.path}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 9"/>`);
  if (total >= 2) {
    const dOn = pathToD(pts, 0, Math.max(1, total - 1));
    layers.push(`<path d="${dOn}" fill="none" stroke="${C.pathOn}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`);
  }

  /* 구간 경계의 이정표 (8·16·24일) */
  for (const day of [8, 16, 24]) {
    const p = pts[day - 1];
    layers.push(
      `<path d="M${p.x + 12} ${p.y} l0 -22" stroke="${C.post}" stroke-width="4"${o(0).replace(` stroke="${OL}" stroke-width="0"`, "")}/>`.replace(/stroke-width="0"/, "") +
      `<path d="M${p.x + 12} ${p.y - 22} l16 5 l-16 5 Z" fill="${C.pathOn}"${o(2.5)}/>`
    );
  }

  /* 32개 지점의 점 */
  for (let i = 0; i < 32; i++) {
    const p = pts[i];
    const reached = i < total;
    const isNext = i === total; // 다음 목표 — 반짝임
    const r = i === 31 ? 0 : 4.5; // 정상은 깃발로 대체
    if (r > 0) {
      layers.push(
        `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${reached ? C.pathOn : C.sky2}"${o(2.5)}/>` +
        (isNext ? `<circle cx="${p.x}" cy="${p.y}" r="10" fill="none" stroke="${C.pathOn}" stroke-width="2"><animate attributeName="r" values="6;13;6" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/></circle>` : "")
      );
    }
  }

  /* 정상 깃발 */
  const top = pts[31];
  layers.push(
    `<path d="M${top.x} ${top.y + 4} l0 -34" stroke="${OL}" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M${top.x + 2} ${top.y - 30} l22 6 l-22 7 Z" fill="${total >= 32 ? C.pathOn : "#D4604A"}"${o(3)}/>`
  );

  /* 캐릭터 — 현재 위치에 */
  const here = pts[Math.max(0, Math.min(31, total - (total > 0 ? 1 : 0)))];
  const size = 74;
  const charSvg = drawChar(charKey, grade, { anim: true, noGround: true });
  // drawChar는 200x215 viewBox. 그대로 x/y에 얹는다.
  layers.push(
    `<g transform="translate(${here.x - size / 2}, ${here.y - size + 8})">` +
    `<svg width="${size}" height="${size * 215 / 200}" viewBox="0 0 200 215" x="0" y="0">${stripSvgWrapper(charSvg)}</svg>` +
    `</g>`
  );

  return `<svg viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="약속의 산 — ${total}일째">${layers.join("")}</svg>`;
}

/** 여러 점을 부드러운 곡선(Catmull-Rom → 베지어)으로 잇는다 */
function pathToD(pts: { x: number; y: number }[], from: number, to: number): string {
  const p = pts.slice(from, to + 1);
  if (p.length < 2) return "";
  let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/** drawChar가 준 <svg …>내용</svg>에서 바깥 svg 태그를 벗겨 내용만 반환 */
function stripSvgWrapper(svg: string): string {
  const start = svg.indexOf(">");
  const end = svg.lastIndexOf("</svg>");
  return start >= 0 && end >= 0 ? svg.slice(start + 1, end) : svg;
}
