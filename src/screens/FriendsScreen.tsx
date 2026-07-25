import { useEffect, useState } from "react";
import { Sabu } from "../components/Sabu";
import { Char } from "../components/Char";
import { getStore, type FriendView } from "../data/store";
import { fx } from "../game/feedback";
import { CHARS, type CharKey } from "../art/chars";
import type { SaveData } from "../data/types";

interface Props {
  data: SaveData;
}

const K_CHEER = "panda.cheers"; // 오늘 누구를 응원했는지 (로컬)

export function FriendsScreen({ data }: Props) {
  const store = getStore();
  const me = data.user.nickname;
  const [friends, setFriends] = useState<FriendView[] | null>(null);
  const [cheered, setCheered] = useState<Set<string>>(loadCheers());

  useEffect(() => {
    store.friends(me).then(setFriends);
  }, [store, me]);

  if (!friends) {
    return <div style={{ maxWidth: 460, margin: "0 auto" }}><Sabu>동문들을 불러오는 중…</Sabu></div>;
  }

  const others = friends.filter((f) => !f.isMe);
  const groupTotal = friends.reduce((s, f) => s + f.totalDays, 0);

  const cheer = (nick: string) => {
    if (cheered.has(nick)) return;
    const next = new Set(cheered); next.add(nick);
    setCheered(next); saveCheers(next);
    fx.select();
  };

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
      <Sabu>
        함께 수련하는 동문들이다. <b>경쟁이 아니라 서로 응원</b>하는 것이 대숲의 법도지.
      </Sabu>

      <div style={groupBanner}>
        🏔️ 우리 모두 함께 <b>{groupTotal}걸음</b>을 올랐다
      </div>

      {others.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: "var(--ink-2)", fontSize: 13.5, lineHeight: 1.7 }}>
          아직 동문이 없구나.<br />
          친구도 이 앱에 들어오면 여기에서 만날 수 있단다.<br />
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>(친구와 함께 쓰려면 서버 연결이 필요해요)</span>
        </div>
      ) : (
        others.map((f) => (
          <div key={f.nickname} style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 46, flexShrink: 0 }}>
              <Char charKey={(f.character as CharKey) in CHARS ? (f.character as CharKey) : "panda"} grade={gradeOf(f.totalDays)} noGround />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{f.nickname}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
                {CHARS[(f.character as CharKey) in CHARS ? (f.character as CharKey) : "panda"].short} 검객 · 🔥{f.streak}일 연속
              </div>
            </div>
            <button
              onClick={() => cheer(f.nickname)}
              disabled={cheered.has(f.nickname)}
              style={cheerBtn(cheered.has(f.nickname))}
            >
              {cheered.has(f.nickname) ? "응원 완료 💚" : "응원 보내기"}
            </button>
          </div>
        ))
      )}

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, margin: 0 }}>
        순위가 아니라 <b style={{ color: "var(--ink-2)" }}>함께 걷는 길</b>이다.
      </p>
    </div>
  );
}

function gradeOf(t: number): number {
  return t >= 30 ? 4 : t >= 20 ? 3 : t >= 12 ? 2 : t >= 5 ? 1 : 0;
}
function loadCheers(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(K_CHEER) || "{}");
    if (raw.date === todayStr()) return new Set(raw.nicks || []);
  } catch { /* 무시 */ }
  return new Set();
}
function saveCheers(s: Set<string>) {
  localStorage.setItem(K_CHEER, JSON.stringify({ date: todayStr(), nicks: [...s] }));
}
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const card: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--edge)",
  borderRadius: "var(--r-lg)", padding: "var(--s4)",
};
const groupBanner: React.CSSProperties = {
  background: "rgba(95,179,124,0.10)", border: "1px solid var(--edge)",
  borderRadius: "var(--r-md)", padding: "12px 14px", textAlign: "center",
  fontSize: 14, color: "var(--ink)",
};
function cheerBtn(done: boolean): React.CSSProperties {
  return {
    flexShrink: 0, padding: "9px 14px", borderRadius: "var(--r-pill)",
    border: `1px solid ${done ? "var(--edge)" : "var(--bamboo)"}`,
    background: done ? "transparent" : "rgba(95,179,124,0.12)",
    color: done ? "var(--ink-3)" : "var(--bamboo)",
    fontSize: 12.5, fontWeight: 700, cursor: done ? "default" : "pointer",
  };
}
