import { Card } from "../components/Card";
import { drawItem } from "../art/drawItem";
import { TREASURES, SPECIALS, LEGS, type Leg } from "../game/treasures";
import type { CardData } from "../game/cards";
import type { SaveData } from "../data/types";

interface Props {
  data: SaveData;
}

const LEG_ORDER = ["bamboo", "mist", "ridge", "summit"] as const;

/**
 * 도감 — 실제 내 기록으로 채워진다.
 * N일째 카드는 'N번째로 완료한 날'에 열린다. 그 카드 뒷면 기록 = 그날의 로그.
 * (카드를 따로 저장하지 않고 로그에서 파생 — 항상 기록과 일치한다)
 */
export function DexScreen({ data }: Props) {
  // 완료한 날을 날짜순으로 — i번째(0-based)가 (i+1)번 카드를 연다
  const completed = data.logs
    .filter((l) => l.completed)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const owned = completed.length;

  // 특별 카드(정직의 보석)를 얻었는지
  const hasHonest = data.cards.some((c) => c.key === "honest");

  const shelves: { leg: Leg; items: typeof TREASURES }[] = LEG_ORDER.map((leg) => ({
    leg,
    items: TREASURES.filter((t) => t.leg === leg),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s5)" }}>
      <div style={note}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>여름의 32일</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: owned >= 32 ? "var(--bamboo)" : "var(--kin)", fontVariantNumeric: "tabular-nums" }}>
            {owned} / 32
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
          하루에 한 장씩 <b style={{ color: "var(--ink)" }}>순서대로</b> 열린다. 얻은 카드를 누르면 <b style={{ color: "var(--ink)" }}>그날의 기록</b>이 보인다.
          {owned >= 32 && " 서른두 장을 모두 모았구나. 정상의 깃발까지 — 훌륭하다."}
        </p>
      </div>

      {shelves.map(({ leg, items }) => {
        const got = items.filter((t) => t.day <= owned).length;
        return (
          <section key={leg}>
            <div style={shelfHead}>
              <span>
                <b style={{ fontSize: 14 }}>{LEGS[leg].name}</b>
                <span style={{ fontSize: 11.5, color: "var(--ink-3)", marginLeft: 8 }}>{LEGS[leg].range}</span>
              </span>
              <span style={{ fontSize: 12, color: got === items.length ? "var(--bamboo)" : "var(--ink-2)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {got} / {items.length}
              </span>
            </div>
            <div style={grid}>
              {items.map((t) => {
                const has = t.day <= owned;
                const dayLog = has ? completed[t.day - 1] : undefined;
                const card: CardData = {
                  id: t.key, kind: "treasure", name: t.name, sub: t.sub,
                  rarity: t.rarity, no: `${String(t.day).padStart(2, "0")} / 32`,
                  record: dayLog
                    ? {
                        date: dayLog.date,
                        missions: dayLog.done,
                        beatObstacle: dayLog.win === "win" ? dayLog.obstacle : "",
                        selfPraise: dayLog.selfPraise,
                      }
                    : undefined,
                };
                return (
                  <Card
                    key={t.key}
                    card={card}
                    width={122}
                    art={<span style={{ display: "block", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: drawItem(t.key) }} />}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      <section>
        <div style={shelfHead}>
          <span>
            <b style={{ fontSize: 14 }}>특별</b>
            <span style={{ fontSize: 11.5, color: "var(--ink-3)", marginLeft: 8 }}>날수가 아니라 용기로</span>
          </span>
        </div>
        <div style={grid}>
          {SPECIALS.map((s) => {
            const gem = data.cards.find((c) => c.key === s.key);
            // 고백한 날의 기록을 뒷면에
            const confessLog = data.logs.find((l) => l.confessed);
            return (
              <Card
                key={s.key}
                width={122}
                card={{
                  id: s.key, kind: "treasure", name: s.name, sub: s.how,
                  rarity: "special", no: "特 / 壹",
                  record: hasHonest && gem
                    ? {
                        date: gem.gotDate,
                        missions: confessLog ? confessLog.missions : [],
                        beatObstacle: "",
                        selfPraise: confessLog?.selfPraise || "솔직하게 말한 나",
                      }
                    : undefined,
                }}
                art={<span style={{ display: "block", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: drawItem(s.key) }} />}
              />
            );
          })}
        </div>
      </section>

      {owned === 0 && (
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7 }}>
          아직 비어 있구나.<br />오늘 첫 수련을 마치면 첫 카드가 열린단다.
        </p>
      )}
    </div>
  );
}

const note: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--edge)",
  borderLeft: "3px solid var(--kin)", borderRadius: "var(--r-md)",
  padding: "var(--s4) var(--s5)",
};
const shelfHead: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "baseline",
  padding: "0 2px var(--s3)", borderBottom: "1px solid var(--edge)", marginBottom: "var(--s4)",
};
const grid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
  gap: "var(--s3)", justifyItems: "center",
};
