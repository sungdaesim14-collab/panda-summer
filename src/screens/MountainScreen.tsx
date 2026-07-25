import { drawMountain } from "../art/drawMountain";
import { LEGS, legOf } from "../game/treasures";
import type { SaveData } from "../data/types";
import { totalDaysOf } from "../data/useGame";
import type { CharKey } from "../art/chars";

interface Props {
  data: SaveData;
}

const LEG_ORDER = ["bamboo", "mist", "ridge", "summit"] as const;

export function MountainScreen({ data }: Props) {
  const total = totalDaysOf(data);
  const charKey = (data.user.character || "panda") as CharKey;
  const grade = total >= 30 ? 4 : total >= 20 ? 3 : total >= 12 ? 2 : total >= 5 ? 1 : 0;
  const remain = Math.max(0, 32 - total);
  const curLeg = total >= 1 ? legOf(Math.min(32, total)) : "bamboo";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: ".2em", color: "var(--kin)", fontWeight: 800 }}>
          약속의 산
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", marginTop: 2 }}>
          {total === 0 ? "이제 오르기 시작한다" : total >= 32 ? "정상에 섰다" : `${LEGS[curLeg].name}을 오르는 중`}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
          {total >= 32 ? "서른두 밤의 약속을 지켰다" : `정상까지 ${remain}일`}
        </div>
      </div>

      <div
        style={{
          borderRadius: "var(--r-lg)", overflow: "hidden",
          border: "1px solid var(--edge)", lineHeight: 0,
          maxWidth: 360, width: "100%", margin: "0 auto",
        }}
        dangerouslySetInnerHTML={{
          __html: drawMountain({ charKey, totalDays: total, grade }),
        }}
      />

      {/* 네 구간 진행 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LEG_ORDER.map((leg) => {
          const info = LEGS[leg];
          const [lo, hi] = rangeOf(leg);
          const got = Math.max(0, Math.min(8, total - (lo - 1)));
          const done = got >= 8;
          const active = total >= lo - 0 && total <= hi;
          return (
            <div key={leg} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 13px", borderRadius: "var(--r-md)",
              border: `1px solid ${active ? "var(--kin)" : "var(--edge)"}`,
              background: "var(--surface)",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800 }}>
                  {info.name}
                  <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 8, fontWeight: 600 }}>{info.range}</span>
                </div>
                <div style={{ height: 5, background: "var(--edge)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
                  <div style={{
                    height: "100%", width: `${(got / 8) * 100}%`,
                    background: done ? "var(--bamboo)" : "var(--kin)", borderRadius: 3,
                    transition: "width .4s ease",
                  }} />
                </div>
              </div>
              <div style={{
                fontSize: 12, fontWeight: 800, minWidth: 34, textAlign: "right",
                color: done ? "var(--bamboo)" : "var(--ink-2)", fontVariantNumeric: "tabular-nums",
              }}>
                {got}/8
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, margin: 0 }}>
        경쟁이 아니라 <b style={{ color: "var(--ink-2)" }}>어제의 나</b>와의 거리다.<br />
        하루에 한 걸음, 반짝이는 다음 지점이 오늘의 목표다.
      </p>
    </div>
  );
}

function rangeOf(leg: (typeof LEG_ORDER)[number]): [number, number] {
  switch (leg) {
    case "bamboo": return [1, 8];
    case "mist": return [9, 16];
    case "ridge": return [17, 24];
    case "summit": return [25, 32];
  }
}
