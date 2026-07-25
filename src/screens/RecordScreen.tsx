import { useState } from "react";
import { Sabu } from "../components/Sabu";
import { WIN_OPTIONS } from "../game/missions";
import { fx } from "../game/feedback";
import type { SaveData, DayLog } from "../data/types";

interface Props {
  data: SaveData;
  onConfess: (date: string) => Promise<{ gotGem: boolean }>;
}

export function RecordScreen({ data, onConfess }: Props) {
  const [asking, setAsking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [gemMsg, setGemMsg] = useState(false);

  // 최근이 위로
  const logs = [...data.logs].sort((a, b) => (a.date < b.date ? 1 : -1));
  const completed = logs.filter((l) => l.completed);

  if (completed.length === 0) {
    return (
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <Sabu>아직 기록이 없구나. 오늘 첫 수련을 마치면 여기에 하나씩 쌓인단다.</Sabu>
      </div>
    );
  }

  const doConfess = async (date: string) => {
    setBusy(true);
    const { gotGem } = await onConfess(date);
    setBusy(false);
    setAsking(null);
    if (gotGem) { fx.legend(); setGemMsg(true); }
    else fx.select();
  };

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
      <Sabu>
        지난 수련이다. 혹시 사실과 다르게 적은 날이 있다면, <b>솔직하게 고백</b>해도 좋다.
        정직은 어떤 보상보다 귀하단다.
      </Sabu>

      {gemMsg && (
        <div style={gemBanner}>
          💎 <b>정직의 보석</b>을 얻었다. 안 했다고 말하는 데는 큰 용기가 필요하지. 잘했다.
        </div>
      )}

      {logs.map((l) => (
        <LogRow
          key={l.date}
          log={l}
          asking={asking === l.date}
          busy={busy}
          onAsk={() => setAsking(l.date)}
          onCancel={() => setAsking(null)}
          onConfirm={() => doConfess(l.date)}
        />
      ))}
    </div>
  );
}

function LogRow({
  log, asking, busy, onAsk, onCancel, onConfirm,
}: {
  log: DayLog; asking: boolean; busy: boolean;
  onAsk: () => void; onCancel: () => void; onConfirm: () => void;
}) {
  const win = WIN_OPTIONS.find((w) => w.key === log.win);
  const notDone = !log.completed;

  return (
    <section style={{
      background: "var(--surface)", border: "1px solid var(--edge)",
      borderRadius: "var(--r-lg)", padding: "var(--s4) var(--s5)",
      opacity: notDone ? 0.72 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".02em" }}>{log.date}</span>
        <span style={{ fontSize: 13 }}>
          {notDone ? (
            <span style={{ color: "var(--shu)", fontWeight: 700 }}>🙏 고백함</span>
          ) : (
            <span style={{ color: "var(--kin)" }}>{"★".repeat(log.stars)}<span style={{ color: "var(--edge)" }}>{"★".repeat(5 - log.stars)}</span></span>
          )}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {log.done.map((m) => (
          <div key={m} style={{ fontSize: 13.5, display: "flex", gap: 7 }}>
            <span style={{ color: notDone ? "var(--ink-3)" : "var(--bamboo)" }}>{notDone ? "·" : "✓"}</span>
            <span style={{ textDecoration: notDone ? "line-through" : "none", color: notDone ? "var(--ink-3)" : "var(--ink)" }}>{m}</span>
          </div>
        ))}
      </div>

      {!notDone && win?.key === "win" && log.obstacle && (
        <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 8 }}>
          🛡️ 작전으로 <b style={{ color: "var(--ink)" }}>{log.obstacle}</b> 이겨냄
        </div>
      )}
      {!notDone && log.selfPraise && (
        <div style={{ fontSize: 13, color: "var(--kin)", marginTop: 6, fontWeight: 600 }}>
          “{log.selfPraise}”
        </div>
      )}
      {!notDone && log.note && (
        <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 6 }}>💬 {log.note}</div>
      )}

      {/* 고백 */}
      {!notDone && !asking && (
        <button onClick={onAsk} style={confessBtn}>🙏 솔직하게 고백하기</button>
      )}
      {asking && (
        <div style={{ marginTop: 12, padding: 13, background: "var(--ground-2)", borderRadius: "var(--r-md)", border: "1px solid var(--edge)" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.6 }}>
            이 날, 사실은 안 했거나 다르게 적었니? <b>괜찮아.</b><br />
            인정하는 건 부끄러운 게 아니라 <b>가장 용감한 수련</b>이야.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={busy} onClick={onConfirm} style={confessYes}>
              {busy ? "…" : "응, 솔직하게 말할래"}
            </button>
            <button disabled={busy} onClick={onCancel} style={confessNo}>아니야, 했어</button>
          </div>
        </div>
      )}
    </section>
  );
}

const gemBanner: React.CSSProperties = {
  background: "rgba(212,96,74,0.12)", border: "1px solid var(--shu)",
  borderRadius: "var(--r-md)", padding: "12px 14px", fontSize: 13.5, lineHeight: 1.6,
};
const confessBtn: React.CSSProperties = {
  marginTop: 12, background: "none", border: "none", cursor: "pointer",
  color: "var(--ink-3)", fontSize: 12.5, textDecoration: "underline", padding: 0,
};
const confessYes: React.CSSProperties = {
  flex: 1, padding: "11px", borderRadius: "var(--r-sm)", border: "none",
  background: "var(--shu)", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
};
const confessNo: React.CSSProperties = {
  padding: "11px 16px", borderRadius: "var(--r-sm)", border: "1px solid var(--edge)",
  background: "transparent", color: "var(--ink-2)", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
};
