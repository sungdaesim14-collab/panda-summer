/**
 * 저장소 — 로컬 우선(local-first) 구조
 *
 * 두 가지 어댑터가 같은 Store 인터페이스를 구현한다:
 *   - LocalStore    : 브라우저 localStorage. 계정 없이도 지금 당장 동작한다.
 *   - SupabaseStore : 진짜 서버. 여러 기기·친구 공유. 환경변수가 있을 때만 켜진다.
 *
 * 앱은 항상 이 인터페이스만 본다. 그래서 서버를 나중에 붙여도 화면 코드는 안 바뀐다.
 * SupabaseStore도 내부에서 로컬에 먼저 쓰고 서버로 밀기 때문에, 네트워크가 끊겨도
 * 입력이 사라지지 않는다(엘리베이터·지하철 대비).
 */

import { emptySave, type SaveData, type User, type DayLog } from "./types";

export interface Store {
  /** 이 기기에 자동로그인 토큰이 있으면 그 닉네임을 돌려준다 */
  currentNickname(): string | null;
  /** 신규 등록. 이미 있으면 실패 */
  register(user: User): Promise<{ ok: boolean; msg?: string }>;
  /** 로그인 (해시된 pin 비교는 호출부에서 하고, 여기선 유저를 찾아준다) */
  findUser(nickname: string): Promise<User | null>;
  /** 자동로그인 기억 / 해제 */
  remember(nickname: string): void;
  forget(): void;
  /** 한 아이의 전체 데이터 */
  load(nickname: string): Promise<SaveData | null>;
  /** 통째로 저장 (로컬은 즉시, 서버는 뒤에서 밀기) */
  save(data: SaveData): Promise<void>;
  /** 하루치만 갱신 — 매일의 흐름에서 가장 자주 부른다 */
  putLog(nickname: string, log: DayLog): Promise<void>;
  /** 함께 수련하는 친구들 (있으면) */
  friends(nickname: string): Promise<FriendView[]>;
  /** 접속 시각 갱신 (관리자가 최종 접속 확인) */
  touchLastSeen(nickname: string): Promise<void>;
  /** 관리자용 — 전체 회원 목록 + 최종 접속 */
  adminListMembers(): Promise<AdminMember[]>;
  /** 관리자용 — 회원 삭제 (관련 데이터 함께) */
  adminDelete(nickname: string): Promise<{ ok: boolean; msg?: string }>;
}

export interface FriendView {
  nickname: string;
  character: string;
  totalDays: number;
  streak: number;
  isMe: boolean;
}

export interface AdminMember {
  nickname: string;
  character: string;
  totalDays: number;
  lastSeen?: string;
  joinDate?: string;
}

/** 관리자 닉네임 */
export const ADMIN_NICK = "뽀귀";

/* ============================================================
   LocalStore — localStorage
   ============================================================ */

const K_TOKEN = "panda.token";
const K_USERS = "panda.users";
const prefixData = (nick: string) => `panda.save.${nick}`;

export class LocalStore implements Store {
  currentNickname(): string | null {
    try { return localStorage.getItem(K_TOKEN); } catch { return null; }
  }

  private readUsers(): Record<string, User> {
    try { return JSON.parse(localStorage.getItem(K_USERS) || "{}"); } catch { return {}; }
  }
  private writeUsers(u: Record<string, User>): void {
    localStorage.setItem(K_USERS, JSON.stringify(u));
  }

  async register(user: User): Promise<{ ok: boolean; msg?: string }> {
    const users = this.readUsers();
    if (users[user.nickname]) return { ok: false, msg: "이미 있는 닉네임이에요. 로그인해 주세요." };
    users[user.nickname] = user;
    this.writeUsers(users);
    localStorage.setItem(prefixData(user.nickname), JSON.stringify(emptySave(user)));
    return { ok: true };
  }

  async findUser(nickname: string): Promise<User | null> {
    return this.readUsers()[nickname] ?? null;
  }

  remember(nickname: string): void { localStorage.setItem(K_TOKEN, nickname); }
  forget(): void { localStorage.removeItem(K_TOKEN); }

  async load(nickname: string): Promise<SaveData | null> {
    try {
      const raw = localStorage.getItem(prefixData(nickname));
      return raw ? (JSON.parse(raw) as SaveData) : null;
    } catch { return null; }
  }

  async save(data: SaveData): Promise<void> {
    // 유저 정보도 최신으로 반영 (캐릭터 선택 등)
    const users = this.readUsers();
    users[data.user.nickname] = data.user;
    this.writeUsers(users);
    localStorage.setItem(prefixData(data.user.nickname), JSON.stringify(data));
  }

  async putLog(nickname: string, log: DayLog): Promise<void> {
    const data = (await this.load(nickname)) ?? emptySave((await this.findUser(nickname))!);
    const i = data.logs.findIndex((l) => l.date === log.date);
    if (i >= 0) data.logs[i] = log; else data.logs.push(log);
    await this.save(data);
  }

  async friends(nickname: string): Promise<FriendView[]> {
    const users = this.readUsers();
    const out: FriendView[] = [];
    for (const nick of Object.keys(users)) {
      const d = await this.load(nick);
      const total = d ? d.logs.filter((l) => l.completed).length : 0;
      out.push({
        nickname: nick,
        character: users[nick].character || "panda",
        totalDays: total,
        streak: d ? streakOf(d.logs) : 0,
        isMe: nick === nickname,
      });
    }
    return out.sort((a, b) => b.streak - a.streak || b.totalDays - a.totalDays);
  }

  async touchLastSeen(nickname: string): Promise<void> {
    const users = this.readUsers();
    if (users[nickname]) {
      users[nickname].lastSeen = new Date().toISOString();
      this.writeUsers(users);
    }
  }

  async adminListMembers(): Promise<AdminMember[]> {
    const users = this.readUsers();
    const out: AdminMember[] = [];
    for (const nick of Object.keys(users)) {
      const d = await this.load(nick);
      out.push({
        nickname: nick,
        character: users[nick].character || "panda",
        totalDays: d ? d.logs.filter((l) => l.completed).length : 0,
        lastSeen: users[nick].lastSeen,
        joinDate: users[nick].joinDate,
      });
    }
    return out.sort((a, b) => (b.lastSeen ?? "").localeCompare(a.lastSeen ?? ""));
  }

  async adminDelete(nickname: string): Promise<{ ok: boolean; msg?: string }> {
    const users = this.readUsers();
    delete users[nickname];
    this.writeUsers(users);
    try { localStorage.removeItem(prefixData(nickname)); } catch { /* 무시 */ }
    return { ok: true };
  }
}

/** 연속 수련일 계산 (오늘 또는 어제부터 거꾸로) */
export function streakOf(logs: DayLog[]): number {
  const done = new Set(logs.filter((l) => l.completed).map((l) => l.date));
  const d = new Date();
  const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  if (!done.has(iso(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (done.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ============================================================
   저장소 선택 — 환경변수가 있으면 Supabase, 없으면 로컬
   ============================================================ */

let _store: Store | null = null;

export function getStore(): Store {
  if (_store) return _store;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    // 서버 자격증명이 있으면 Supabase. 실패하면 아래 로컬로 폴백.
    try {
      // 정적 import를 피하려고 require 대신 동기 팩토리 사용
      // (번들러가 supabaseStore를 포함하지만, env 없으면 인스턴스는 안 만든다)
      _store = makeSupabaseStore(url, key);
      return _store;
    } catch {
      // 폴백
    }
  }
  _store = new LocalStore();
  return _store;
}

/** supabaseStore를 지연 생성 (순환 import 방지용 주입점) */
let _supabaseFactory: ((url: string, key: string) => Store) | null = null;
export function registerSupabaseFactory(f: (url: string, key: string) => Store) {
  _supabaseFactory = f;
}
function makeSupabaseStore(url: string, key: string): Store {
  if (!_supabaseFactory) throw new Error("supabase factory not registered");
  return _supabaseFactory(url, key);
}

export function hasServer(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}
