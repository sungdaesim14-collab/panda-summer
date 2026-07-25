/**
 * 앱 전체 상태 — 저장소와 화면을 잇는 하나의 훅
 *
 * 화면들은 이 훅만 쓴다. 저장이 로컬이든 서버든 신경 쓰지 않는다.
 */
import { useCallback, useEffect, useState } from "react";
import { getStore, streakOf } from "./store";
import { hashPin } from "./pin";
import { emptySave, type SaveData, type DayLog } from "./types";
import type { CharKey } from "../art/chars";

export type AuthState =
  | { phase: "loading" }
  | { phase: "login" }
  | { phase: "chooseChar"; nickname: string }
  | { phase: "ready"; data: SaveData };

export function useGame() {
  const store = getStore();
  const [auth, setAuth] = useState<AuthState>({ phase: "loading" });

  /* 자동 로그인 */
  useEffect(() => {
    (async () => {
      const nick = store.currentNickname();
      if (!nick) return setAuth({ phase: "login" });
      const data = await store.load(nick);
      const user = await store.findUser(nick);
      if (!data || !user) return setAuth({ phase: "login" });
      if (!user.character) return setAuth({ phase: "chooseChar", nickname: nick });
      setAuth({ phase: "ready", data });
    })();
  }, [store]);

  const register = useCallback(async (nickname: string, pin: string) => {
    const pinHash = await hashPin(nickname, pin);
    const user = {
      nickname: nickname.trim(), pinHash, character: "" as const,
      joinDate: todayISO(), honestyGiven: false,
    };
    const res = await store.register(user);
    if (!res.ok) return res;
    store.remember(user.nickname);
    setAuth({ phase: "chooseChar", nickname: user.nickname });
    return { ok: true };
  }, [store]);

  const login = useCallback(async (nickname: string, pin: string) => {
    const user = await store.findUser(nickname.trim());
    if (!user) return { ok: false, msg: "없는 닉네임이에요. '새 수련생 등록'을 눌러주세요." };
    const pinHash = await hashPin(nickname, pin);
    if (user.pinHash !== pinHash) return { ok: false, msg: "비밀번호가 틀렸어요." };
    store.remember(user.nickname);
    const data = (await store.load(user.nickname)) ?? emptySave(user);
    if (!user.character) { setAuth({ phase: "chooseChar", nickname: user.nickname }); return { ok: true }; }
    setAuth({ phase: "ready", data });
    return { ok: true };
  }, [store]);

  const chooseCharacter = useCallback(async (nickname: string, character: CharKey) => {
    const data = (await store.load(nickname))!;
    data.user.character = character;
    await store.save(data);
    setAuth({ phase: "ready", data });
  }, [store]);

  const logout = useCallback(() => {
    store.forget();
    setAuth({ phase: "login" });
  }, [store]);

  /** 하루치 기록 저장 후 상태 갱신 */
  const saveLog = useCallback(async (log: DayLog) => {
    if (auth.phase !== "ready") return;
    const nick = auth.data.user.nickname;
    await store.putLog(nick, log);
    const fresh = await store.load(nick);
    if (fresh) setAuth({ phase: "ready", data: fresh });
  }, [auth, store]);

  /**
   * 솔직하게 고백하기.
   * 사실 안 했다고 고백하면 그 날의 completed를 false로 되돌리고,
   * 처음 한 번은 '정직의 보석'을 준다.
   * 반환: 정직의 보석을 이번에 새로 얻었는지.
   */
  const confess = useCallback(async (date: string): Promise<{ gotGem: boolean }> => {
    if (auth.phase !== "ready") return { gotGem: false };
    const data = structuredCloneSafe(auth.data);
    const log = data.logs.find((l) => l.date === date);
    if (!log || log.confessed) return { gotGem: false };

    log.confessed = true;
    log.completed = false;          // 정직: 안 한 날은 안 한 것으로
    log.savedAt = new Date().toISOString();

    let gotGem = false;
    if (!data.user.honestyGiven) {
      data.user.honestyGiven = true;
      data.cards.push({ key: "honest", kind: "special", gotDate: todayISO(), pos: -1 });
      gotGem = true;
    }
    await store.save(data);
    setAuth({ phase: "ready", data });
    return { gotGem };
  }, [auth, store]);

  /** 동굴 보물 획득 (스도쿠 완성 보상). 이미 있으면 무시 */
  const awardCaveItem = useCallback(async (key: string) => {
    if (auth.phase !== "ready") return;
    const data = structuredCloneSafe(auth.data);
    if (data.cards.some((c) => c.kind === "cave" && c.key === key)) return;
    data.cards.push({ key, kind: "cave", gotDate: todayISO(), pos: -1 });
    await store.save(data);
    setAuth({ phase: "ready", data });
  }, [auth, store]);

  /** 동굴 아이템을 특정 자리에 놓거나 보관함으로 (pos: -1) */
  const setCavePos = useCallback(async (key: string, pos: number) => {
    if (auth.phase !== "ready") return;
    const data = structuredCloneSafe(auth.data);
    // 그 자리에 이미 다른 게 있으면 서로 자리를 비켜준다
    if (pos >= 0) {
      for (const c of data.cards) {
        if (c.kind === "cave" && c.pos === pos && c.key !== key) c.pos = -1;
      }
    }
    const target = data.cards.find((c) => c.kind === "cave" && c.key === key);
    if (target) target.pos = pos;
    await store.save(data);
    setAuth({ phase: "ready", data });
  }, [auth, store]);

  return { auth, register, login, chooseCharacter, logout, saveLog, confess, awardCaveItem, setCavePos };
}

/* 파생 값 도우미 */
export function totalDaysOf(data: SaveData): number {
  return data.logs.filter((l) => l.completed).length;
}
export function streakDaysOf(data: SaveData): number {
  return streakOf(data.logs);
}
export function todayLogOf(data: SaveData): DayLog | undefined {
  const t = todayISO();
  return data.logs.find((l) => l.date === t);
}
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** structuredClone이 없는 환경 대비 */
function structuredCloneSafe<T>(v: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(v)
    : JSON.parse(JSON.stringify(v));
}
