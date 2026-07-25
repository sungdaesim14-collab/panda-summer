import { useState } from "react";
import { Char } from "../components/Char";
import { fx } from "../game/feedback";

interface Props {
  nickname: string;
  onDone: () => void;
}

/**
 * 첫 환영 — 판다 사부가 3마디로 이 앱의 뜻을 전한다.
 * 짧게. 아이가 부담 없이 바로 시작하도록.
 * (PROJECT_CONTEXT 1장의 철학을 아이에게 직접 건네는 자리)
 */
const PAGES = [
  {
    line: "나는 판다 사부다. 서른두 밤 동안, 너의 수련을 함께할 것이다.",
    sub: "함께 약속의 산을 오르자.",
  },
  {
    line: "매일 '수련'에서 오늘 할 일을 스스로 고르고, 해내면 한 걸음씩 산을 오른다.",
    sub: "무엇을 할지는 어른이 아니라 네가 정한다.",
  },
  {
    line: "상을 받으려고가 아니다. 스스로 마음먹은 일을 해내는 그 즐거움을 위해서다.",
    sub: "자, 오늘의 첫 수련을 골라볼까?",
  },
];

export function Onboarding({ nickname, onDone }: Props) {
  const [i, setI] = useState(0);
  const last = i === PAGES.length - 1;
  const p = PAGES[i];

  const next = () => {
    fx.next();
    if (last) onDone();
    else setI(i + 1);
  };

  return (
    <div style={overlay} role="dialog" aria-label="첫 안내">
      <div style={card}>
        <div style={{ width: 130, margin: "0 auto" }}>
          <Char charKey="panda" grade={4} anim noGround />
        </div>

        <div style={{ minHeight: 132, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: ".2em", color: "var(--kin)", fontWeight: 700 }}>
            판다 사부
          </div>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, fontWeight: 700, letterSpacing: "-.02em" }}>
            {i === 0 ? `${nickname}아, ` : ""}{p.line}
          </p>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>{p.sub}</p>
        </div>

        {/* 점 인디케이터 */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {PAGES.map((_, k) => (
            <span key={k} style={{
              width: k === i ? 20 : 7, height: 7, borderRadius: 4,
              background: k === i ? "var(--kin)" : "var(--edge)", transition: "width .2s",
            }} />
          ))}
        </div>

        <button onClick={next} style={btn}>{last ? "수련 시작하기" : "다음"}</button>
        {!last && (
          <button onClick={onDone} style={skip}>건너뛰기</button>
        )}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 50,
  background: "rgba(10,13,10,0.82)", backdropFilter: "blur(3px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const card: React.CSSProperties = {
  width: "100%", maxWidth: 360, background: "var(--surface)",
  border: "1px solid var(--edge)", borderRadius: "var(--r-lg)",
  padding: "24px 22px", display: "flex", flexDirection: "column", gap: 16,
  textAlign: "center", boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7)",
};
const btn: React.CSSProperties = {
  width: "100%", padding: "14px", borderRadius: "var(--r-md)", border: "none",
  background: "var(--kin)", color: "var(--on-kin)", fontSize: 15, fontWeight: 800, cursor: "pointer",
};
const skip: React.CSSProperties = {
  background: "none", border: "none", color: "var(--ink-3)", fontSize: 12.5,
  textDecoration: "underline", cursor: "pointer", padding: 0, marginTop: -6,
};
