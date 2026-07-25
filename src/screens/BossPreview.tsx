import { useMemo, useState, useEffect, useRef } from "react";
import { drawBoss } from "../art/drawBoss";
import { fx } from "../game/feedback";
import { Char } from "../components/Char";
import {
  buildSchedule, resolveBoss, type DayRecord, type BossKind,
} from "../game/bosses";

const START = "2026-07-25";
const END = "2026-08-25";

/** 얼마나 수련했는지에 따라 가짜 기록을 만든다 (미리보기용) */
function makeLogs(days: number, winRate: number, from: string, to: string): DayRecord[] {
  const out: DayRecord[] = [];
  const s = new Date(from + "T12:00:00");
  const e = new Date(to + "T12:00:00");
  const span = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  const obstacles = ["유튜브 보고 싶어져", "졸려서", "동생이 자꾸 불러서", "귀찮아서"];
  for (let i = 0; i < span; i++) {
    const d = new Date(s.getTime() + i * 86400000);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const did = i < days;
    out.push({
      date: iso,
      completed: did,
      wonAgainstObstacle: did && i % Math.max(1, Math.round(1 / winRate)) === 0,
      wasHard: did && i % 4 === 0,
      obstacle: obstacles[i % obstacles.length],
    });
  }
  return out;
}

export function BossPreview() {
  const schedule = useMemo(() => buildSchedule(START, END), []);
  const [slotIdx, setSlotIdx] = useState(0);
  const [days, setDays] = useState(4);

  const slot = schedule[slotIdx] ?? schedule[0];
  const span = Math.round(
    (new Date(slot.to + "T12:00:00").getTime() - new Date(slot.from + "T12:00:00").getTime()) / 86400000
  ) + 1;
  const capped = Math.min(days, span);
  const logs = useMemo(() => makeLogs(capped, 0.5, slot.from, slot.to), [capped, slot]);
  const res = useMemo(() => resolveBoss(slot, logs), [slot, logs]);

  // 넘어서는 순간에만 소리 (미달 → 클리어로 바뀔 때)
  const wasCleared = useRef(res.cleared);
  useEffect(() => {
    if (res.cleared && !wasCleared.current) fx.bossWin();
    wasCleared.current = res.cleared;
  }, [res.cleared]);

  const kindName: Record<BossKind, string> = {
    mid: "수요일 · 중간 도깨비",
    week: "일요일 · 이 주의 우두머리",
    final: "마지막 날 · 여름의 상대",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s5)" }}>
      {/* 조작 (미리보기 전용) */}
      <div style={panel}>
        <div style={{ ...tiny, marginBottom: 8 }}>미리보기 조작 · 실제 앱엔 없습니다</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {schedule.map((s, i) => (
            <button key={s.date} onClick={() => setSlotIdx(i)} aria-pressed={i === slotIdx} style={chip(i === slotIdx)}>
              {s.date.slice(5)} {s.kind === "mid" ? "중간" : s.kind === "week" ? "주" : "최종"}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <span style={{ color: "var(--ink-2)", whiteSpace: "nowrap" }}>수련한 날</span>
          <input
            type="range" min={0} max={span} value={capped}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ flex: 1, accentColor: "var(--kin)" }}
          />
          <b style={{ width: 46, textAlign: "right" }}>{capped} / {span}일</b>
        </label>
      </div>

      {/* 보스 등장 */}
      <div style={{ ...panel, alignItems: "center", textAlign: "center", display: "flex", flexDirection: "column", gap: "var(--s3)" }}>
        <div style={tiny}>{kindName[slot.kind]}</div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, width: "100%" }}>
          <Char charKey="panda" grade={2} size={92} anim />
          <span
            style={{ width: slot.kind === "final" ? 190 : slot.kind === "week" ? 165 : 140, lineHeight: 0 }}
            dangerouslySetInnerHTML={{ __html: drawBoss(res.boss, slot.kind, { anim: true, defeated: res.cleared }) }}
          />
        </div>

        <div>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.03em" }}>{res.boss.name}</div>
          <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{res.boss.intro}</div>
        </div>
      </div>

      {/* 힘 계산 — 왜 이런 결과인지 아이가 그대로 볼 수 있게 */}
      <div style={panel}>
        <div style={{ ...tiny, marginBottom: 10 }}>이번에 내가 쌓은 힘</div>
        {res.lines.map((l) => (
          <div key={l.label} style={lineRow}>
            <span style={{ flex: 1 }}>
              {l.label}
              <span style={{ display: "block", fontSize: 11, color: "var(--ink-3)" }}>{l.note}</span>
            </span>
            <span style={{ color: "var(--ink-2)", fontSize: 12, width: 62, textAlign: "right" }}>
              {l.count} × {l.per}
            </span>
            <b style={{ width: 34, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{l.total}</b>
          </div>
        ))}

        <div style={{ ...lineRow, borderBottom: "none", paddingTop: 12, marginTop: 4, borderTop: "1px solid var(--edge)" }}>
          <span style={{ flex: 1, fontWeight: 800 }}>합계</span>
          <b style={{ fontSize: 19, color: res.cleared ? "var(--bamboo)" : "var(--kin)", fontVariantNumeric: "tabular-nums" }}>
            {res.power}
          </b>
          <span style={{ color: "var(--ink-3)", margin: "0 6px" }}>/</span>
          <b style={{ fontSize: 19, fontVariantNumeric: "tabular-nums" }}>{res.need}</b>
        </div>

        <div style={{ height: 8, background: "var(--edge)", borderRadius: 4, overflow: "hidden", marginTop: 10 }}>
          <div style={{
            height: "100%",
            width: `${Math.min(100, (res.power / res.need) * 100)}%`,
            background: res.cleared ? "var(--bamboo)" : "var(--kin)",
            borderRadius: 4,
            transition: "width .35s ease",
          }} />
        </div>
      </div>

      {/* 결과 */}
      <div style={{
        ...panel,
        borderColor: res.cleared ? "var(--bamboo)" : "var(--kin)",
        borderLeftWidth: 3,
      }}>
        <div style={{
          fontSize: 17, fontWeight: 800, marginBottom: 6,
          color: res.cleared ? "var(--bamboo)" : "var(--kin)",
        }}>
          {res.cleared ? "넘어섰다" : `아직 ${res.remaining}만큼 남았다`}
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "var(--ink)" }}>{res.message}</p>
        {!res.cleared && (
          <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            다음 보스는 <b style={{ color: "var(--ink)" }}>그대로 열립니다.</b> 막히지 않습니다.
            그리고 여기서 쌓은 {res.power}은 사라지지 않고, 나중에 힘이 차면 이 도깨비는 저절로 물러갑니다.
          </p>
        )}
      </div>
    </div>
  );
}

const panel: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--edge)",
  borderRadius: "var(--r-lg)",
  padding: "var(--s5)",
};
const tiny: React.CSSProperties = {
  fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase",
  color: "var(--ink-2)", fontWeight: 800,
};
const lineRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "9px 0", borderBottom: "1px solid var(--edge)", fontSize: 13.5,
};
function chip(on: boolean): React.CSSProperties {
  return {
    padding: "5px 10px", borderRadius: "var(--r-pill)", fontSize: 11.5, fontWeight: 700,
    border: `1px solid ${on ? "var(--kin)" : "var(--edge)"}`,
    background: on ? "var(--kin)" : "transparent",
    color: on ? "var(--on-kin)" : "var(--ink-2)",
    cursor: "pointer", whiteSpace: "nowrap",
  };
}
