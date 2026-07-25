/**
 * 대나무의 호흡 — 열 개의 형(型)
 *
 * 예전 앱의 업적 19종을 10형으로 압축해 세계관에 맞췄다.
 * 돈으로 사는 게 아니라 '노력으로만 얻는 증표'라는 원칙은 그대로.
 * 진행도는 전부 실제 수련 기록에서 계산한다 (조작 불가).
 *
 * 잠긴 형은 화면에서 이름을 ??? 로 가려 다음을 궁금하게 만든다.
 */
import type { DayLog } from "../data/types";

export type KataType = "total" | "streak" | "win" | "hard" | "honest" | "mission";

export interface Kata {
  no: string;       // 형의 번호 (한자)
  key: string;
  name: string;
  desc: string;
  type: KataType;
  need: number;
  keyword?: string; // mission 형일 때 수련 이름에 이 말이 들어가야 함
  /** 이 형을 화면에서 숨길지 (스포일러 방지). 앞 형을 익히기 전엔 ??? */
  secret?: boolean;
}

export const KATA: Kata[] = [
  { no: "壹", key: "first",   name: "첫 걸음",         desc: "첫 수련을 마친다",         type: "total",  need: 1 },
  { no: "貳", key: "three",   name: "사흘의 벽",       desc: "사흘을 잇따라 오른다",     type: "streak", need: 3 },
  { no: "參", key: "week",    name: "일주일의 약속",   desc: "이레를 잇따라 오른다",     type: "streak", need: 7 },
  { no: "肆", key: "plan",    name: "스스로 세운 작전", desc: "작전으로 방해물을 세 번 이긴다", type: "win", need: 3 },
  { no: "伍", key: "quiet",   name: "고요한 밤",       desc: "휴대폰 수련을 열흘 해낸다", type: "mission", need: 10, keyword: "휴대폰", secret: true },
  { no: "陸", key: "hard",    name: "고비를 넘는 자",   desc: "아주 힘든 수련을 세 번 견딘다", type: "hard", need: 3, secret: true },
  { no: "柒", key: "ten",     name: "열흘의 뚝심",     desc: "모두 열흘을 오른다",       type: "total",  need: 10, secret: true },
  { no: "捌", key: "master",  name: "꾸준함의 고수",   desc: "열나흘을 잇따라 오른다",   type: "streak", need: 14, secret: true },
  { no: "玖", key: "conquer", name: "유혹 정복자",     desc: "작전으로 방해물을 열 번 이긴다", type: "win", need: 10, secret: true },
  { no: "拾", key: "avatar",  name: "수련의 화신",     desc: "서른 밤의 약속을 지킨다",   type: "total",  need: 30, secret: true },
];

export interface KataProgress {
  kata: Kata;
  cur: number;
  need: number;
  done: boolean;
  /** 화면에 이름을 드러낼지 (secret인데 아직 앞을 못 익혔으면 false) */
  revealed: boolean;
}

/** 로그에서 통계를 뽑는다 */
export interface KataStats {
  total: number;
  maxStreak: number;
  winCount: number;
  hardCount: number;
  honestCount: number;
  missionCounts: Record<string, number>;
}

export function computeStats(logs: DayLog[]): KataStats {
  const completed = logs.filter((l) => l.completed);
  const total = completed.length;
  const winCount = completed.filter((l) => l.win === "win").length;
  const hardCount = completed.filter((l) => l.stars >= 5).length;
  const honestCount = logs.filter((l) => l.confessed).length;

  // 수련 이름별 완료 횟수 (keyword 매칭용)
  const missionCounts: Record<string, number> = {};
  for (const l of completed) {
    for (const m of l.done) missionCounts[m] = (missionCounts[m] ?? 0) + 1;
  }

  // 최고 연속 기록 — 완료한 날짜를 정렬해 하루씩 이어지는 최대 길이
  const dates = completed.map((l) => l.date).sort();
  let maxStreak = 0, run = 0;
  let prev: string | null = null;
  for (const d of dates) {
    if (prev === null) run = 1;
    else {
      const diff = Math.round(
        (new Date(d + "T12:00:00").getTime() - new Date(prev + "T12:00:00").getTime()) / 86400000
      );
      if (diff === 1) run++;
      else if (diff === 0) { /* 같은 날 중복 */ }
      else run = 1;
    }
    if (run > maxStreak) maxStreak = run;
    prev = d;
  }

  return { total, maxStreak, winCount, hardCount, honestCount, missionCounts };
}

function valueFor(k: Kata, s: KataStats): number {
  switch (k.type) {
    case "total": return s.total;
    case "streak": return s.maxStreak;
    case "win": return s.winCount;
    case "hard": return s.hardCount;
    case "honest": return s.honestCount;
    case "mission": {
      const kw = k.keyword ?? "";
      let n = 0;
      for (const name in s.missionCounts) if (name.includes(kw)) n += s.missionCounts[name];
      return n;
    }
  }
}

export function computeKata(logs: DayLog[]): KataProgress[] {
  const stats = computeStats(logs);
  const out: KataProgress[] = [];
  let prevDone = true; // 첫 형은 항상 보임
  for (const k of KATA) {
    const cur = Math.min(valueFor(k, stats), k.need);
    const done = valueFor(k, stats) >= k.need;
    // secret 형은 '바로 앞 형을 익혔을 때'부터 이름을 드러낸다
    const revealed = !k.secret || prevDone;
    out.push({ kata: k, cur, need: k.need, done, revealed });
    prevDone = done;
  }
  return out;
}
