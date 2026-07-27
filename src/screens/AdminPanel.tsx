import { useEffect, useState } from "react";
import { Char } from "../components/Char";
import { getStore, type AdminMember } from "../data/store";
import { CHARS, type CharKey } from "../art/chars";

/** 관리자(뽀귀) 전용 — 회원 최종 접속 확인 + 삭제 */
export function AdminPanel({ me }: { me: string }) {
  const store = getStore();
  const [members, setMembers] = useState<AdminMember[] | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => { setMembers(null); store.adminListMembers().then(setMembers); };
  useEffect(load, [store]);

  const doDelete = async (nick: string) => {
    setBusy(true);
    const res = await store.adminDelete(nick);
    setBusy(false);
    setConfirm(null);
    if (res.ok) { setMsg(`'${nick}' 삭제 완료`); load(); }
    else setMsg(res.msg || "삭제 실패");
  };

  return (
    <section style={panel}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>👑 관리자 · 회원 관리</div>
        <button onClick={load} aria-label="새로고침" style={{
          width: 34, height: 34, borderRadius: 8, border: "1px solid var(--edge)",
          background: "transparent", cursor: "pointer", fontSize: 15,
        }}>↻</button>
      </div>

      {msg && <div style={{ fontSize: 12.5, color: "var(--kin)", marginBottom: 10 }}>{msg}</div>}

      {members === null ? (
        <div style={{ fontSize: 13, color: "var(--ink-2)", textAlign: "center", padding: 16 }}>불러오는 중…</div>
      ) : members.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--ink-2)", textAlign: "center", padding: 16 }}>아직 회원이 없어요.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {members.map((m) => {
            const ck = (m.character as CharKey) in CHARS ? (m.character as CharKey) : "panda";
            const isMe = m.nickname === me;
            return (
              <div key={m.nickname} style={row}>
                <span style={{ width: 34, flexShrink: 0 }}>
                  <Char charKey={ck} grade={gradeOf(m.totalDays)} noGround />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.nickname}{isMe && <span style={{ color: "var(--kin)", fontSize: 11 }}> (나)</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-2)" }}>
                    수련 {m.totalDays}일 · 최종접속 {relTime(m.lastSeen)}
                  </div>
                </div>
                {!isMe && (
                  confirm === m.nickname ? (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button disabled={busy} onClick={() => doDelete(m.nickname)} style={delYes}>삭제</button>
                      <button disabled={busy} onClick={() => setConfirm(null)} style={delNo}>취소</button>
                    </div>
                  ) : (
                    <button onClick={() => { setConfirm(m.nickname); setMsg(""); }} style={delBtn}>삭제</button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 12, lineHeight: 1.6 }}>
        삭제하면 그 아이의 수련 기록·카드가 모두 지워지고 되돌릴 수 없어요. 신중히.
      </p>
    </section>
  );
}

function gradeOf(t: number): number {
  return t >= 30 ? 4 : t >= 20 ? 3 : t >= 12 ? 2 : t >= 5 ? 1 : 0;
}

/** 상대 시간 ("3분 전", "2시간 전", "어제", "3일 전") */
function relTime(iso?: string): string {
  if (!iso) return "기록 없음";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "기록 없음";
  const min = Math.floor((Date.now() - then) / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "어제";
  if (day < 30) return `${day}일 전`;
  return iso.slice(0, 10);
}

const panel: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--kin)", borderRadius: "var(--r-lg)",
  padding: "var(--s5)", width: "100%",
};
const row: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
  borderBottom: "1px solid var(--edge)",
};
const delBtn: React.CSSProperties = {
  flexShrink: 0, padding: "7px 12px", borderRadius: "var(--r-pill)", border: "1px solid var(--edge)",
  background: "transparent", color: "var(--ink-3)", fontSize: 12, fontWeight: 700, cursor: "pointer",
};
const delYes: React.CSSProperties = {
  padding: "7px 12px", borderRadius: "var(--r-pill)", border: "none",
  background: "var(--shu)", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer",
};
const delNo: React.CSSProperties = {
  padding: "7px 12px", borderRadius: "var(--r-pill)", border: "1px solid var(--edge)",
  background: "transparent", color: "var(--ink-2)", fontSize: 12, fontWeight: 700, cursor: "pointer",
};
