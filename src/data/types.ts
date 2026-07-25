/**
 * 저장되는 데이터의 모양
 *
 * 예전 Apps Script는 시트 열 순서에 데이터가 묶여 있어서,
 * 열을 하나 바꾸면 전체가 밀렸다(PROJECT_CONTEXT 7장의 함정).
 * 여기서는 이름표(키)가 붙은 객체라 순서가 상관없고, 필드를 더해도 옛 데이터가 안 깨진다.
 */

import type { CharKey } from "../art/chars";
import type { WinKey } from "../game/missions";

/** 스키마 버전 — 나중에 구조가 바뀌면 올리고 migrate에서 옛 데이터를 손본다 */
export const SCHEMA_VERSION = 1;

export interface User {
  nickname: string;
  /** 4자리. 로컬 저장에서는 평문이 아니라 해시로 둔다 */
  pinHash: string;
  character: CharKey | "";
  joinDate: string;
  /** 정직의 보석을 이미 받았는지 */
  honestyGiven: boolean;
}

/** 하루치 수련 기록 */
export interface DayLog {
  date: string;
  missions: string[];
  done: string[];
  completed: boolean;
  /** 난이도 별점 1~5 (보상과 무관, 자기성찰용) */
  stars: number;
  outcome: string;
  obstacle: string;
  plan: string;
  win: WinKey | "";
  selfPraise: string;
  note: string;
  /** 양심 서약 체크 */
  pledged: boolean;
  /** 솔직하게 고백한 날인지 — 전용 필드 (예전엔 note 첫 글자로 판단해 버그였다) */
  confessed: boolean;
  /** 마지막으로 저장된 시각(ISO) — 동기화 충돌 해결용 */
  savedAt: string;
}

/** 얻은 카드 한 장 */
export interface OwnedCard {
  /** 32일 카드면 treasure key, 특별/보스/호흡법이면 각자의 key */
  key: string;
  kind: "treasure" | "special" | "boss" | "kata" | "char" | "cave";
  gotDate: string;
  /** 숲/동굴에 배치된 자리(-1이면 보관함) */
  pos: number;
}

/** 넘어선 보스 기록 */
export interface BossClear {
  slotDate: string;
  clearedDate: string;
  bossId: string;
}

/** 한 아이의 전체 저장 데이터 */
export interface SaveData {
  version: number;
  user: User;
  logs: DayLog[];
  cards: OwnedCard[];
  bosses: BossClear[];
  /** 서버와 마지막으로 맞춘 시각 */
  syncedAt?: string;
}

export function emptySave(user: User): SaveData {
  return { version: SCHEMA_VERSION, user, logs: [], cards: [], bosses: [] };
}
