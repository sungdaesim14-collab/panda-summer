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

  return { auth, register, login, chooseCharacter, logout, saveLog };
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
