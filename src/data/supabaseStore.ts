/**
 * SupabaseStore — 진짜 서버 저장소
 *
 * 로컬 우선(local-first)을 유지한다: 쓰기는 항상 이 기기(localStorage)에 먼저 하고,
 * 그다음 서버로 밀어 올린다. 그래서 네트워크가 끊겨도 입력이 사라지지 않는다.
 * 읽기는 서버에서 가져와 로컬에 캐시하되, 서버가 안 되면 로컬 것을 쓴다.
 *
 * 여러 기기·친구 공유는 서버가 담당한다.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { LocalStore, type Store, type FriendView, type AdminMember } from "./store";
import { emptySave, type SaveData, type User, type DayLog, type OwnedCard, type BossClear } from "./types";

export class SupabaseStore implements Store {
  private sb: SupabaseClient;
  private local = new LocalStore(); // 이 기기 캐시 + 오프라인 대비

  constructor(url: string, anonKey: string) {
    this.sb = createClient(url, anonKey, { auth: { persistSession: false } });
  }

  currentNickname(): string | null { return this.local.currentNickname(); }
  remember(nickname: string): void { this.local.remember(nickname); }
  forget(): void { this.local.forget(); }

  async register(user: User): Promise<{ ok: boolean; msg?: string }> {
    // 이미 있는 닉네임인지 서버에서 먼저 확인
    const { data: exists } = await this.sb.from("players").select("nickname").eq("nickname", user.nickname).maybeSingle();
    if (exists) return { ok: false, msg: "이미 있는 이름이에요. 로그인해 주세요." };

    const { error } = await this.sb.from("players").insert({
      nickname: user.nickname, pin_hash: user.pinHash, character: user.character,
      join_date: user.joinDate, honesty_given: user.honestyGiven,
    });
    if (error) {
      // 서버가 안 되면 로컬에라도 등록 (나중에 동기화)
      return this.local.register(user);
    }
    await this.local.register(user);
    return { ok: true };
  }

  async findUser(nickname: string): Promise<User | null> {
    const { data, error } = await this.sb.from("players").select("*").eq("nickname", nickname).maybeSingle();
    if (error || !data) return this.local.findUser(nickname);
    const user: User = {
      nickname: data.nickname, pinHash: data.pin_hash, character: data.character,
      joinDate: data.join_date, honestyGiven: data.honesty_given,
    };
    return user;
  }

  async load(nickname: string): Promise<SaveData | null> {
    try {
      const [pRes, lRes, cRes, bRes] = await Promise.all([
        this.sb.from("players").select("*").eq("nickname", nickname).maybeSingle(),
        this.sb.from("day_logs").select("*").eq("nickname", nickname),
        this.sb.from("cards").select("*").eq("nickname", nickname),
        this.sb.from("boss_clears").select("*").eq("nickname", nickname),
      ]);
      if (!pRes.data) return this.local.load(nickname);

      const user: User = {
        nickname: pRes.data.nickname, pinHash: pRes.data.pin_hash, character: pRes.data.character,
        joinDate: pRes.data.join_date, honestyGiven: pRes.data.honesty_given,
      };
      const data: SaveData = {
        version: 1,
        user,
        logs: (lRes.data ?? []).map(rowToLog),
        cards: (cRes.data ?? []).map(rowToCard),
        bosses: (bRes.data ?? []).map(rowToBoss),
        syncedAt: new Date().toISOString(),
      };
      await this.local.save(data); // 캐시
      return data;
    } catch {
      return this.local.load(nickname);
    }
  }

  async save(data: SaveData): Promise<void> {
    await this.local.save(data); // 항상 로컬 먼저
    try {
      await this.sb.from("players").upsert({
        nickname: data.user.nickname, pin_hash: data.user.pinHash, character: data.user.character,
        join_date: data.user.joinDate, honesty_given: data.user.honestyGiven,
      });
      if (data.logs.length) await this.sb.from("day_logs").upsert(data.logs.map((l) => logToRow(data.user.nickname, l)));
      if (data.cards.length) await this.sb.from("cards").upsert(data.cards.map((c) => cardToRow(data.user.nickname, c)));
      if (data.bosses.length) await this.sb.from("boss_clears").upsert(data.bosses.map((b) => bossToRow(data.user.nickname, b)));
    } catch {
      // 서버 실패해도 로컬엔 저장됨. 다음 load/save에서 다시 밀린다.
    }
  }

  async putLog(nickname: string, log: DayLog): Promise<void> {
    await this.local.putLog(nickname, log); // 로컬 먼저
    try {
      await this.sb.from("day_logs").upsert(logToRow(nickname, log));
    } catch { /* 오프라인이면 로컬만, 다음에 전체 save로 밀림 */ }
  }

  async friends(nickname: string): Promise<FriendView[]> {
    try {
      const [pRes, lRes] = await Promise.all([
        this.sb.from("players").select("nickname, character"),
        this.sb.from("day_logs").select("nickname, date, completed"),
      ]);
      if (!pRes.data) return this.local.friends(nickname);

      const byNick = new Map<string, { date: string }[]>();
      for (const row of lRes.data ?? []) {
        if (!row.completed) continue;
        const arr = byNick.get(row.nickname) ?? [];
        arr.push({ date: row.date });
        byNick.set(row.nickname, arr);
      }
      return pRes.data
        .map((p) => {
          const dates = (byNick.get(p.nickname) ?? []).map((x) => x.date);
          return {
            nickname: p.nickname,
            character: p.character || "panda",
            totalDays: dates.length,
            streak: streakFromDates(dates),
            isMe: p.nickname === nickname,
          };
        })
        .sort((a, b) => b.streak - a.streak || b.totalDays - a.totalDays);
    } catch {
      return this.local.friends(nickname);
    }
  }

  async touchLastSeen(nickname: string): Promise<void> {
    this.local.touchLastSeen(nickname);
    try {
      await this.sb.from("players").update({ last_seen: new Date().toISOString() }).eq("nickname", nickname);
    } catch { /* 오프라인이면 다음 접속 때 */ }
  }

  async adminListMembers(): Promise<AdminMember[]> {
    try {
      const [pRes, lRes] = await Promise.all([
        this.sb.from("players").select("nickname, character, join_date, last_seen"),
        this.sb.from("day_logs").select("nickname, completed"),
      ]);
      if (!pRes.data) return this.local.adminListMembers();
      const done = new Map<string, number>();
      for (const r of lRes.data ?? []) {
        if (r.completed) done.set(r.nickname, (done.get(r.nickname) ?? 0) + 1);
      }
      return pRes.data
        .map((p) => ({
          nickname: p.nickname,
          character: p.character || "panda",
          totalDays: done.get(p.nickname) ?? 0,
          lastSeen: p.last_seen ?? undefined,
          joinDate: p.join_date ?? undefined,
        }))
        .sort((a, b) => (b.lastSeen ?? "").localeCompare(a.lastSeen ?? ""));
    } catch {
      return this.local.adminListMembers();
    }
  }

  async adminDelete(nickname: string): Promise<{ ok: boolean; msg?: string }> {
    await this.local.adminDelete(nickname);
    try {
      // players 삭제 시 day_logs/cards/boss_clears는 on delete cascade로 함께 삭제됨
      const { error } = await this.sb.from("players").delete().eq("nickname", nickname);
      if (error) return { ok: false, msg: "서버에서 삭제하지 못했어요. 잠시 후 다시 시도해 주세요." };
      return { ok: true };
    } catch {
      return { ok: false, msg: "연결을 확인해 주세요." };
    }
  }
}

/* ---- 행 ↔ 객체 매핑 ---- */
function rowToLog(r: Record<string, unknown>): DayLog {
  return {
    date: r.date as string,
    missions: (r.missions as string[]) ?? [],
    done: (r.done as string[]) ?? [],
    completed: !!r.completed,
    stars: (r.stars as number) ?? 0,
    outcome: (r.outcome as string) ?? "",
    obstacle: (r.obstacle as string) ?? "",
    plan: (r.plan as string) ?? "",
    win: (r.win as DayLog["win"]) ?? "",
    selfPraise: (r.self_praise as string) ?? "",
    note: (r.note as string) ?? "",
    pledged: !!r.pledged,
    confessed: !!r.confessed,
    savedAt: (r.saved_at as string) ?? new Date().toISOString(),
  };
}
function logToRow(nickname: string, l: DayLog) {
  return {
    nickname, date: l.date, missions: l.missions, done: l.done, completed: l.completed,
    stars: l.stars, outcome: l.outcome, obstacle: l.obstacle, plan: l.plan, win: l.win,
    self_praise: l.selfPraise, note: l.note, pledged: l.pledged, confessed: l.confessed,
    saved_at: l.savedAt,
  };
}
function rowToCard(r: Record<string, unknown>): OwnedCard {
  return { key: r.key as string, kind: r.kind as OwnedCard["kind"], gotDate: r.got_date as string, pos: (r.pos as number) ?? -1 };
}
function cardToRow(nickname: string, c: OwnedCard) {
  return { nickname, key: c.key, kind: c.kind, got_date: c.gotDate, pos: c.pos };
}
function rowToBoss(r: Record<string, unknown>): BossClear {
  return { slotDate: r.slot_date as string, clearedDate: r.cleared_date as string, bossId: r.boss_id as string };
}
function bossToRow(nickname: string, b: BossClear) {
  return { nickname, slot_date: b.slotDate, cleared_date: b.clearedDate, boss_id: b.bossId };
}

function streakFromDates(dates: string[]): number {
  const done = new Set(dates);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const d = new Date();
  if (!done.has(iso(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (done.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// (참고용) 미래에 필요하면 emptySave를 여기서 쓸 수 있다
void emptySave;
