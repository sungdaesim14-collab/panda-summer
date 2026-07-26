/**
 * 오늘의 황금 목표 — 매일 하나씩 주어지는 특별한 도전
 *
 *  - 그날 날짜로 정해진다 (친구끼리 같은 목표).
 *  - 좋은 수련 습관을 여러 방향으로 유도한다 (다 지키기 / 작전 승리 / 고비 넘기 …).
 *  - 그날의 수련 기록으로 자동 판정한다. 조작·별도 입력 없음.
 *  - 달성하면 약간의 보상: 동굴 보물 하나 (가챠는 이 체계 안에서만).
 *
 * 도깨비(보스)와는 무관하다. 메인 수련 힘에 영향을 주지 않는다.
 */
import type { DayLog } from "../data/types";

export interface DailyGoal {
  key: string;
  title: string;
  hint: string;
  /** 그날의 완료 로그로 달성 여부를 판정 */
  achieved: (log: DayLog) => boolean;
}

export const GOALS: DailyGoal[] = [
  {
    key: "keepAll",
    title: "약속한 걸 전부 지키기",
    hint: "오늘 고른 수련을 하나도 빠짐없이 해내면 성공.",
    achieved: (l) => l.done.length >= 1 && l.done.length === l.missions.length,
  },
  {
    key: "win",
    title: "작전으로 방해물 이기기",
    hint: "미리 세운 작전으로 유혹을 밀어내면 성공.",
    achieved: (l) => l.win === "win",
  },
  {
    key: "hard",
    title: "가장 힘든 수련에 도전",
    hint: "정말 힘든 수련(난이도 ⭐5) 하나를 해내면 성공.",
    achieved: (l) => l.stars >= 5,
  },
  {
    key: "three",
    title: "세 가지 수련 약속하기",
    hint: "오늘 수련을 3개 이상 약속하고 지키면 성공.",
    achieved: (l) => l.missions.length >= 3 && l.done.length >= 3,
  },
  {
    key: "praise",
    title: "나에게 칭찬 남기기",
    hint: "마무리에 자기 자신에게 칭찬 한마디를 남기면 성공.",
    achieved: (l) => l.selfPraise.trim().length > 0,
  },
  {
    key: "book",
    title: "책과 함께하는 하루",
    hint: "책 읽기 수련을 해내면 성공.",
    achieved: (l) => l.done.some((m) => m.includes("책")),
  },
  {
    key: "note",
    title: "오늘을 기록으로 남기기",
    hint: "마무리에 오늘의 한 줄 기록을 남기면 성공.",
    achieved: (l) => l.note.trim().length > 0,
  },
];

/** 날짜로 오늘의 목표를 고른다 (매일 회전, 같은 날 같은 목표) */
export function goalForDate(dateISO: string): DailyGoal {
  let h = 0;
  for (let i = 0; i < dateISO.length; i++) h = (h * 31 + dateISO.charCodeAt(i)) | 0;
  return GOALS[Math.abs(h) % GOALS.length];
}
