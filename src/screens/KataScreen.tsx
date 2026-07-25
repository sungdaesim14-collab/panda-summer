import { Sabu } from "../components/Sabu";
import { computeKata, type KataProgress } from "../game/kata";
import type { SaveData } from "../data/types";

interface Props {
  data: SaveData;
}

export function KataScreen({ data }: Props) {
  const list = computeKata(data.logs);
  const learned = list.filter((k) => k.done).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s5)" }}>
      <Sabu>
        <b>대나무의 호흡</b>, 열 개의 형이다. 돈으로 사는 게 아니라 <b>오직 네 노력으로만</b> 익힌다.
        하나씩 익혀 가거라.
      </Sabu>

      <div style={{ ...note, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 800 }}>익힌 형</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: learned > 0 ? "var(--kin)" : "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>
          {learned} / {list.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((k) => <KataRow key={k.kata.key} k={k} />)}
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, margin: 0 }}>
        아직 밝혀지지 않은 형은 <b style={{ color: "var(--ink-2)" }}>앞의 형을 익히면</b> 모습을 드러낸다.
      </p>
    </div>
  );
}

function KataRow({ k }: { k: KataProgress }) {
  const { kata, cur, need, done, revealed } = k;
  const pct = Math.min(100, (cur / need) * 100);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 13,
      padding: "13px 14px", borderRadius: "var(--r-md)",
      border: `1px solid ${done ? "var(--kin)" : "var(--edge)"}`,
      background: done ? "rgba(224,172,72,0.08)" : "var(--surface)",
      opacity: revealed ? 1 : 0.62,
    }}>
      {/* 한자 번호 원판 */}
      <span style={{
        width: 38, height: 38, flexShrink: 0, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "ui-serif, Georgia, serif", fontSize: 17, fontWeight: 700,
        border: `1.5px solid ${done ? "var(--kin)" : "var(--edge)"}`,
        color: done ? "var(--kin)" : "var(--ink-2)",
        background: done ? "rgba(224,172,72,0.10)" : "transparent",
      }}>
        {kata.no}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
          {revealed ? kata.name : "???"}
          {done && <span style={{ fontSize: 11, color: "var(--kin)", fontWeight: 800, letterSpacing: ".08em" }}>익힘</span>}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 1 }}>
          {revealed ? kata.desc : "아직 밝혀지지 않았다"}
        </div>
        {revealed && !done && (
          <div style={{ height: 4, background: "var(--edge)", borderRadius: 2, overflow: "hidden", marginTop: 7 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "var(--kin)", borderRadius: 2, transition: "width .4s ease" }} />
          </div>
        )}
      </div>

      {revealed && (
        <span style={{
          fontSize: 12, fontWeight: 800, minWidth: 40, textAlign: "right",
          color: done ? "var(--bamboo)" : "var(--ink-2)", fontVariantNumeric: "tabular-nums",
        }}>
          {done ? "✓" : `${cur}/${need}`}
        </span>
      )}
    </div>
  );
}

const note: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--edge)",
  borderRadius: "var(--r-md)", padding: "var(--s4) var(--s5)",
};
