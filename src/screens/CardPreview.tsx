import { useState } from "react";
import { Card } from "../components/Card";
import { drawItem } from "../art/drawItem";
import { TREASURES, SPECIALS, LEGS, type Leg } from "../game/treasures";
import type { CardData, CardRecord } from "../game/cards";

/** 미리보기용 가짜 기록 — 실제로는 그날 아이가 쓴 것이 들어간다 */
const SAMPLE: Record<number, CardRecord> = {
  1:  { date: "2026-07-25", missions: ["책 30분 읽기"], beatObstacle: "", selfPraise: "첫날부터 해냈다" },
  3:  { date: "2026-07-27", missions: ["줄넘기", "방 정리"], beatObstacle: "귀찮아서", selfPraise: "" },
  7:  { date: "2026-07-31", missions: ["책 30분 읽기", "휴대폰 정한 만큼", "명상 1분"], beatObstacle: "유튜브 보고 싶어져", selfPraise: "일주일 채운 나, 칭찬해" },
  13: { date: "2026-08-06", missions: ["공부 분량 끝내기", "줄넘기"], beatObstacle: "졸려서", selfPraise: "" },
  16: { date: "2026-08-09", missions: ["책 30분 읽기", "집안일 돕기"], beatObstacle: "동생이 자꾸 불러서", selfPraise: "방문 닫고 한 게 통했다" },
  21: { date: "2026-08-14", missions: ["휴대폰 정한 만큼", "명상 1분"], beatObstacle: "유튜브 보고 싶어져", selfPraise: "" },
  32: { date: "2026-08-25", missions: ["책 30분 읽기", "줄넘기", "공부 분량 끝내기"], beatObstacle: "유튜브 보고 싶어져", selfPraise: "서른두 밤을 지킨 나" },
};

export function CardPreview() {
  // 미리보기: 오늘까지 몇 장 열렸는지
  const [owned, setOwned] = useState(16);

  const shelves: { leg: Leg; items: typeof TREASURES }[] = (
    ["bamboo", "mist", "ridge", "summit"] as Leg[]
  ).map((leg) => ({ leg, items: TREASURES.filter((t) => t.leg === leg) }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s5)" }}>
      <div style={note}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>여름의 32일</div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65 }}>
          하루에 한 장씩, <b style={{ color: "var(--ink)" }}>순서대로</b> 열립니다. 운은 없습니다.
          1번은 산 입구의 죽순, 32번은 정상의 깃발 — 다 모으면 <b style={{ color: "var(--ink)" }}>여름 여정의 지도</b>가 됩니다.
          얻은 카드를 눌러 뒤집으면 <b style={{ color: "var(--ink)" }}>그날의 기록</b>이 있습니다.
        </p>
      </div>

      <div style={{ ...note, borderLeftColor: "var(--ink-3)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <span style={{ color: "var(--ink-2)", whiteSpace: "nowrap" }}>미리보기 · 수련한 날</span>
          <input
            type="range" min={0} max={32} value={owned}
            onChange={(e) => setOwned(Number(e.target.value))}
            style={{ flex: 1, accentColor: "var(--kin)" }}
          />
          <b style={{ width: 58, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{owned} / 32</b>
        </label>
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
              <span style={{ fontSize: 12, color: got === items.length ? "var(--bamboo)" : "var(--ink-2)", fontWeight: 700 }}>
                {got} / {items.length}
              </span>
            </div>
            <div style={grid}>
              {items.map((t) => {
                const has = t.day <= owned;
                const card: CardData = {
                  id: t.key, kind: "treasure", name: t.name, sub: t.sub,
                  rarity: t.rarity, no: `${String(t.day).padStart(2, "0")} / 32`,
                  record: has ? (SAMPLE[t.day] ?? {
                    date: dayToDate(t.day), missions: ["책 30분 읽기", "줄넘기"],
                    beatObstacle: "", selfPraise: "",
                  }) : undefined,
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
          <span><b style={{ fontSize: 14 }}>특별</b>
            <span style={{ fontSize: 11.5, color: "var(--ink-3)", marginLeft: 8 }}>날수가 아니라 용기로</span>
          </span>
        </div>
        <div style={grid}>
          {SPECIALS.map((s) => (
            <Card
              key={s.key}
              width={122}
              card={{
                id: s.key, kind: "treasure", name: s.name, sub: s.how,
                rarity: "special", no: "特 / 壹",
                record: owned >= 10 ? {
                  date: "2026-08-03", missions: ["책 30분 읽기"], beatObstacle: "",
                  selfPraise: "솔직하게 말하는 게 더 어려웠다",
                } : undefined,
              }}
              art={<span style={{ display: "block", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: drawItem(s.key) }} />}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function dayToDate(day: number): string {
  const d = new Date(2026, 6, 24 + day, 12);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
