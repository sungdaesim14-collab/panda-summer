import { drawCaveItem, drawCaveBackground, caveSpots } from "../art/drawCave";
import { myCaveItems, CAVE_TOTAL } from "../game/cave";
import { CHARS, type CharKey } from "../art/chars";
import type { SaveData } from "../data/types";

interface Props {
  data: SaveData;
  onBack?: () => void;
}

/** 친구 동굴 구경 — 읽기전용. 배치된 보물만 보인다 */
export function CaveView({ data, onBack }: Props) {
  const charKey = (data.user.character || "panda") as CharKey;
  const c = CHARS[charKey];
  const mine = myCaveItems(data.cards);
  const placed = mine.filter((x) => x.pos >= 0);
  const spots = caveSpots();
  const bg = drawCaveBackground(c.accent);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>
          {data.user.nickname}의 동굴
          <span style={{ fontSize: 12, color: "var(--ink-2)", marginLeft: 8, fontWeight: 600 }}>
            보물 {mine.length}/{CAVE_TOTAL}
          </span>
        </div>
        {onBack && (
          <button onClick={onBack} style={{
            padding: "7px 14px", borderRadius: "var(--r-pill)", border: "1px solid var(--edge)",
            background: "transparent", color: "var(--ink)", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>← 동문으로</button>
        )}
      </div>

      <div style={{ position: "relative", maxWidth: 380, width: "100%", margin: "0 auto", lineHeight: 0 }}>
        <div dangerouslySetInnerHTML={{ __html: bg }} />
        {placed.map((p) => {
          const s = spots[p.pos] ?? spots[0];
          return (
            <span key={p.key} style={{
              position: "absolute", left: `${(s.x / 380) * 100}%`, top: `${(s.y / 400) * 100}%`,
              transform: "translate(-50%,-70%)", width: 46, height: 46, lineHeight: 0,
            }} dangerouslySetInnerHTML={{ __html: drawCaveItem(p.key) }} />
          );
        })}
      </div>

      {placed.length === 0 && (
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7 }}>
          아직 동굴을 꾸미지 않았구나.<br />두뇌 수련으로 보물을 모으면 여기가 채워진단다.
        </p>
      )}
    </div>
  );
}
