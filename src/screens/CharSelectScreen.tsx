import { useState } from "react";
import { Char } from "../components/Char";
import { CHAR_LIST, type CharKey } from "../art/chars";

interface Props {
  nickname: string;
  onChoose: (nick: string, key: CharKey) => void;
}

export function CharSelectScreen({ nickname, onChoose }: Props) {
  const [sel, setSel] = useState<CharKey | null>(null);

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 22, textAlign: "center", letterSpacing: "-.03em" }}>
        {nickname}의 검객을 골라줘
      </h1>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--ink-2)", textAlign: "center" }}>
        한 번 정하면 바꿀 수 없어. 32일을 함께할 친구야.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
        {CHAR_LIST.map((c) => {
          const on = sel === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setSel(c.key)}
              aria-pressed={on}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "14px 8px 12px", cursor: "pointer",
                borderRadius: "var(--r-lg)",
                border: `2px solid ${on ? "var(--kin)" : "var(--edge)"}`,
                background: on ? "rgba(224,172,72,0.10)" : "var(--surface)",
              }}
            >
              <span style={{ width: "72%" }}><Char charKey={c.key} grade={1} anim={on} /></span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>{c.short}</span>
              <span style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.4, minHeight: 30 }}>{c.desc}</span>
            </button>
          );
        })}
      </div>

      <button
        disabled={!sel}
        onClick={() => sel && onChoose(nickname, sel)}
        style={{
          width: "100%", marginTop: 18, padding: "15px", borderRadius: "var(--r-md)", border: "none",
          fontSize: 15, fontWeight: 800, cursor: sel ? "pointer" : "not-allowed",
          background: sel ? "var(--kin)" : "var(--edge)",
          color: sel ? "var(--on-kin)" : "var(--ink-3)",
        }}
      >
        {sel ? "이 검객으로 정할래" : "검객을 골라줘"}
      </button>
    </div>
  );
}
