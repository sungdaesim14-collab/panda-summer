import { useState } from "react";
import { Sabu } from "../components/Sabu";
import { drawCaveItem, drawCaveBackground, caveSpots } from "../art/drawCave";
import { CAVE_ITEMS, CAVE_TOTAL, RARITY_META, myCaveItems, caveItem } from "../game/cave";
import { CHARS, type CharKey } from "../art/chars";
import { fx } from "../game/feedback";
import type { SaveData } from "../data/types";

interface Props {
  data: SaveData;
  setCavePos: (key: string, pos: number) => Promise<void>;
}

export function CaveScreen({ data, setCavePos }: Props) {
  const [tab, setTab] = useState<"decorate" | "dex">("decorate");
  const [picked, setPicked] = useState<string | null>(null);

  const charKey = (data.user.character || "panda") as CharKey;
  const c = CHARS[charKey];
  const mine = myCaveItems(data.cards);
  const owned = new Set(mine.map((x) => x.key));
  const placed = mine.filter((x) => x.pos >= 0);
  const bagged = mine.filter((x) => x.pos < 0);
  const spots = caveSpots();
  const bg = drawCaveBackground(c.accent);

  const placeAt = (spotIdx: number) => {
    if (picked == null) return;
    fx.select();
    setCavePos(picked, spotIdx);
    setPicked(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
      <Sabu>
        스도쿠를 풀며 모은 보물로 <b>너만의 동굴</b>을 꾸며보거라. 동문들도 네 동굴을 구경할 수 있단다.
      </Sabu>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setTab("decorate")} aria-pressed={tab === "decorate"} style={seg(tab === "decorate")}>꾸미기</button>
        <button onClick={() => setTab("dex")} aria-pressed={tab === "dex"} style={seg(tab === "dex")}>
          보물 도감 {owned.size}/{CAVE_TOTAL}
        </button>
      </div>

      {tab === "decorate" ? (
        <>
          {/* 동굴 무대 */}
          <div style={{ position: "relative", maxWidth: 380, width: "100%", margin: "0 auto", lineHeight: 0 }}>
            <div dangerouslySetInnerHTML={{ __html: bg }} />
            {/* 빈 스팟 (놓을 것 골랐을 때만 보임) */}
            {picked != null && spots.map((s, i) => {
              const taken = placed.find((p) => p.pos === i);
              if (taken) return null;
              return (
                <button key={i} onClick={() => placeAt(i)} aria-label="여기 놓기"
                  style={{
                    position: "absolute", left: `${(s.x / 380) * 100}%`, top: `${(s.y / 400) * 100}%`,
                    transform: "translate(-50%,-50%)", width: 30, height: 30, borderRadius: "50%",
                    border: "2px dashed var(--kin)", background: "rgba(224,172,72,0.18)", cursor: "pointer",
                  }} />
              );
            })}
            {/* 배치된 아이템 */}
            {placed.map((p) => {
              const s = spots[p.pos] ?? spots[0];
              return (
                <button key={p.key} onClick={() => { fx.tap(); setCavePos(p.key, -1); }}
                  aria-label={`${caveItem(p.key)?.name} 치우기`}
                  style={{
                    position: "absolute", left: `${(s.x / 380) * 100}%`, top: `${(s.y / 400) * 100}%`,
                    transform: "translate(-50%,-70%)", width: 46, height: 46, border: "none",
                    background: "none", cursor: "pointer", lineHeight: 0,
                  }}
                  dangerouslySetInnerHTML={{ __html: drawCaveItem(p.key) }} />
              );
            })}
          </div>

          {/* 보관함 */}
          <div style={{ ...panel }}>
            <div style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--ink-2)", fontWeight: 800, marginBottom: 10 }}>
              보관함 {bagged.length > 0 ? `· 놓을 보물을 고르고 동굴 속 자리를 눌러라` : ""}
            </div>
            {mine.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--ink-2)", textAlign: "center", lineHeight: 1.7, margin: "8px 0" }}>
                아직 보물이 없구나.<br />두뇌 수련(스도쿠)을 풀면 동굴 보물을 받는단다.
              </p>
            ) : bagged.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--ink-2)", textAlign: "center", margin: "8px 0" }}>
                가진 보물을 모두 동굴에 놓았구나.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(58px,1fr))", gap: 8 }}>
                {bagged.map((b) => {
                  const info = caveItem(b.key)!;
                  const meta = RARITY_META[info.rarity];
                  const on = picked === b.key;
                  return (
                    <button key={b.key} onClick={() => { setPicked(on ? null : b.key); fx.tap(); }}
                      aria-pressed={on}
                      style={{
                        aspectRatio: "1/1", borderRadius: 10, cursor: "pointer", padding: 6, lineHeight: 0,
                        border: `2px solid ${on ? "var(--kin)" : meta.edge}`,
                        background: on ? "rgba(224,172,72,0.16)" : "var(--ground-2)",
                      }}
                      dangerouslySetInnerHTML={{ __html: drawCaveItem(b.key) }} />
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <CaveDex owned={owned} />
      )}
    </div>
  );
}

function CaveDex({ owned }: { owned: Set<string> }) {
  const groups: { r: "common" | "rare" | "legend"; label: string }[] = [
    { r: "legend", label: "전설" }, { r: "rare", label: "희귀" }, { r: "common", label: "일반" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
      {groups.map(({ r, label }) => {
        const items = CAVE_ITEMS.filter((i) => i.rarity === r);
        const got = items.filter((i) => owned.has(i.key)).length;
        const meta = RARITY_META[r];
        return (
          <section key={r}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 2px 8px", borderBottom: "1px solid var(--edge)", marginBottom: 10 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: meta.edge }}>{label}</span>
              <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 700 }}>{got}/{items.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px,1fr))", gap: 8 }}>
              {items.map((i) => {
                const has = owned.has(i.key);
                return (
                  <div key={i.key} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    padding: "8px 4px", borderRadius: 10,
                    border: `1px solid ${has ? meta.edge : "var(--edge)"}`,
                    background: has ? "var(--surface)" : "var(--ground-2)",
                    boxShadow: has && meta.glow ? `0 0 12px -4px ${meta.edge}` : "none",
                  }}>
                    <span style={{ width: "70%", lineHeight: 0, filter: has ? "none" : "brightness(0) opacity(0.25)" }}
                      dangerouslySetInnerHTML={{ __html: drawCaveItem(i.key) }} />
                    <span style={{ fontSize: 9.5, color: has ? "var(--ink)" : "var(--ink-3)", textAlign: "center", lineHeight: 1.2 }}>
                      {has ? i.name : "???"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

const panel: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--edge)",
  borderRadius: "var(--r-lg)", padding: "var(--s4)",
};
function seg(on: boolean): React.CSSProperties {
  return {
    flex: 1, padding: "10px", borderRadius: "var(--r-md)", cursor: "pointer",
    border: `1px solid ${on ? "var(--kin)" : "var(--edge)"}`,
    background: on ? "var(--kin)" : "transparent",
    color: on ? "var(--on-kin)" : "var(--ink)", fontSize: 13.5, fontWeight: 700,
  };
}
