import { useState, type ReactNode } from "react";
import { RARITY, type CardData } from "../game/cards";

interface Props {
  card: CardData;
  /** 카드 가운데 들어가는 그림 */
  art: ReactNode;
  width?: number;
  /** 눌러서 뒤집기 */
  flippable?: boolean;
}

/**
 * 카드 한 장.
 * 앞면 = 그림과 등급, 뒷면 = 그날의 기록.
 * 아직 못 얻은 카드는 실루엣으로만 보이고 조건 힌트가 뜬다.
 */
export function Card({ card, art, width = 168, flippable = true }: Props) {
  const [back, setBack] = useState(false);
  const r = RARITY[card.rarity];
  const owned = !!card.record;
  const canFlip = flippable && owned;

  return (
    <div style={{ width, perspective: 900 }}>
      <button
        onClick={() => canFlip && setBack((b) => !b)}
        aria-label={owned ? `${card.name} 카드${back ? " 뒷면" : ""}` : "아직 얻지 못한 카드"}
        disabled={!canFlip}
        style={{
          width: "100%",
          aspectRatio: "3 / 4.2",
          border: "none",
          background: "none",
          padding: 0,
          cursor: canFlip ? "pointer" : "default",
          transformStyle: "preserve-3d",
          transition: "transform .5s cubic-bezier(.2,.8,.25,1)",
          transform: back ? "rotateY(180deg)" : "none",
          position: "relative",
        }}
      >
        {/* 앞면 */}
        <span style={{ ...face, ...frame(r.edge, owned), background: owned ? `linear-gradient(${r.tint}, ${r.tint}), var(--surface)` : "var(--ground-2)" }}>
          {owned && r.glow && <span style={glowLayer(r.edge)} />}
          {owned && r.ornament && <Ornaments color={r.edge} />}

          <span style={{ ...rarityTag, color: owned ? r.ink : "var(--ink-3)" }}>
            {owned ? r.label : "? ? ?"}
          </span>

          <span style={{
            position: "relative", zIndex: 1, width: "62%", flexShrink: 0,
            filter: owned ? "none" : "brightness(0) opacity(0.22)",
            lineHeight: 0,
          }}>
            {art}
          </span>

          <span style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", padding: "0 7px" }}>
            <span style={{
              display: "block", fontSize: 12.5, fontWeight: 800, letterSpacing: "-.02em",
              color: owned ? "var(--ink)" : "var(--ink-3)",
              lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {owned ? card.name : "아직 만나지 못했다"}
            </span>
            <span style={{
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden", fontSize: 10, color: "var(--ink-2)",
              marginTop: 2, lineHeight: 1.3, minHeight: "2.6em",
            }}>
              {card.sub}
            </span>
          </span>

          {card.no && (
            <span style={{ position: "absolute", bottom: 7, left: 0, right: 0, textAlign: "center", fontSize: 9.5, color: "var(--ink-3)", fontFamily: "ui-serif, Georgia, serif" }}>
              {card.no}
            </span>
          )}
        </span>

        {/* 뒷면 — 그날의 기록 */}
        <span style={{
          ...face, ...frame(r.edge, true),
          background: "var(--surface)",
          transform: "rotateY(180deg)",
          justifyContent: "flex-start",
          padding: "12px 11px",
          gap: 6,
          overflowY: "auto",
          textAlign: "left",
          alignItems: "stretch",
        }}>
          {card.record && (
            <>
              <span style={{ fontSize: 9.5, letterSpacing: ".16em", color: r.ink, fontWeight: 800 }}>
                {card.record.date}
              </span>
              <span style={{ height: 1, background: "var(--edge)" }} />

              <Block label="그날 해낸 수련">
                {card.record.missions.map((m) => (
                  <span key={m} style={{ display: "block" }}>· {m}</span>
                ))}
              </Block>

              {card.record.beatObstacle && (
                <Block label="이겨낸 방해물">{card.record.beatObstacle}</Block>
              )}

              {card.record.selfPraise && (
                <Block label="그날 나에게 한 말">
                  <span style={{ color: r.ink, fontWeight: 700 }}>“{card.record.selfPraise}”</span>
                </Block>
              )}
            </>
          )}
        </span>
      </button>
    </div>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 8.5, letterSpacing: ".12em", color: "var(--ink-3)", fontWeight: 800, marginBottom: 2 }}>
        {label}
      </span>
      <span style={{ display: "block", fontSize: 10.5, lineHeight: 1.5, color: "var(--ink)" }}>
        {children}
      </span>
    </span>
  );
}

function Ornaments({ color }: { color: string }) {
  const c: React.CSSProperties = { position: "absolute", width: 13, height: 13, borderColor: color, borderStyle: "solid", borderWidth: 0 };
  return (
    <>
      <span style={{ ...c, top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 5 }} />
      <span style={{ ...c, top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 5 }} />
      <span style={{ ...c, bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 5 }} />
      <span style={{ ...c, bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 5 }} />
    </>
  );
}

const face: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  // 위는 등급표, 아래는 도감번호 자리를 비워둔다 (글자가 겹치지 않게)
  padding: "24px 0 20px",
  borderRadius: 13,
  overflow: "hidden",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

function frame(edge: string, owned: boolean): React.CSSProperties {
  return {
    border: `2px solid ${owned ? edge : "var(--edge)"}`,
    boxShadow: owned ? `0 8px 20px -14px ${edge}` : "none",
  };
}

function glowLayer(edge: string): React.CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse at 50% 36%, ${edge}38, transparent 66%)`,
    pointerEvents: "none",
  };
}

const rarityTag: React.CSSProperties = {
  position: "absolute",
  top: 9,
  left: 0,
  right: 0,
  textAlign: "center",
  fontSize: 9,
  letterSpacing: ".3em",
  marginRight: "-.3em",
  fontWeight: 800,
  zIndex: 1,
};
