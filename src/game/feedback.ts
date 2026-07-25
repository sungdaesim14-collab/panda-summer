/**
 * 손맛 — 소리와 진동
 *
 * 음원 파일을 넣지 않는다. Web Audio로 파형을 그 자리에서 합성한다(용량 0).
 * 아이가 무음을 원할 수 있으니 localStorage로 켜고 끌 수 있게 둔다.
 * 소리는 '첫 탭' 이후에만 난다(브라우저 정책). 그래서 사용자 조작에 실려서만 울린다.
 */

const K_SOUND = "panda.sound";
const K_HAPTIC = "panda.haptic";

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export const sound = {
  on(): boolean { return localStorage.getItem(K_SOUND) !== "off"; },
  set(v: boolean) { localStorage.setItem(K_SOUND, v ? "on" : "off"); },
};
export const haptic = {
  on(): boolean { return localStorage.getItem(K_HAPTIC) !== "off"; },
  set(v: boolean) { localStorage.setItem(K_HAPTIC, v ? "on" : "off"); },
};

function buzz(pattern: number | number[]) {
  if (!haptic.on()) return;
  if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch { /* 무시 */ } }
}

/** 한 음 — 부드러운 종소리 계열 */
function tone(freq: number, dur: number, when = 0, type: OscillatorType = "sine", gain = 0.16) {
  const c = ac();
  if (!c || !sound.on()) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/* ---- 상황별 소리 (음이 위로 오르면 긍정) ---- */

export const fx = {
  /** 수련 칩·체크를 켤 때 — 짧은 딸깍 */
  tap() { tone(660, 0.08, 0, "triangle", 0.10); buzz(8); },

  /** 무언가 선택 확정 */
  select() { tone(523.25, 0.10, 0, "sine", 0.13); tone(659.25, 0.12, 0.05); buzz(12); },

  /** 다음 단계로 */
  next() { tone(587.33, 0.10, 0, "sine", 0.13); buzz(10); },

  /** 오늘 수련 마무리 — 세 음 상행 */
  complete() {
    tone(523.25, 0.14, 0);
    tone(659.25, 0.14, 0.10);
    tone(783.99, 0.20, 0.20);
    buzz([16, 40, 24]);
  },

  /** 카드가 열림 — 맑은 종 + 여운 */
  reveal() {
    tone(783.99, 0.5, 0, "sine", 0.16);
    tone(1174.66, 0.6, 0.02, "sine", 0.09);
    tone(1567.98, 0.7, 0.06, "sine", 0.05);
    buzz([20, 30, 60]);
  },

  /** 전설 카드 — 더 길고 화려하게 */
  legend() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.6, i * 0.09, "sine", 0.14));
    tone(1567.98, 0.9, 0.4, "sine", 0.06);
    buzz([30, 40, 30, 40, 80]);
  },

  /** 보스를 넘어섬 */
  bossWin() {
    tone(392, 0.16, 0, "sawtooth", 0.10);
    tone(523.25, 0.16, 0.12, "sine", 0.14);
    tone(783.99, 0.30, 0.24, "sine", 0.14);
    buzz([24, 30, 60]);
  },
};
