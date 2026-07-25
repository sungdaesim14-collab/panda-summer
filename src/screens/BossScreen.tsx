import { Sabu } from "../components/Sabu";
import { Char } from "../components/Char";
import { drawBoss } from "../art/drawBoss";
import { buildSchedule, resolveBoss, type DayRecord, type BossSlot } from "../game/bosses";
import { SEASON } from "../game/season";
import { todayISO } from "../data/useGame";
import type { SaveData } from "../data/types";
import type { CharKey } from "../art/chars";

interface Props {
  data: SaveData;
}

/** 내 로그를 보스 판정용 기록으로 변환 */
function toRecords(data: SaveData): DayRecord[] {
  return data.logs.map((l) => ({
    date: l.date,
    completed: l.completed,
    wonAgainstObstacle: l.win === "win",
    wasHard: l.stars >= 5,
    obstacle: l.obstacle,
  }));
}

export function BossScreen({ data }: Props) {
  const today = todayISO();
  const schedule = buildSchedule(SEASON.start, SEASON.end);
  const records = toRecords(data);
  const charKey = (data.user.character || "panda") as CharKey;
  const total = data.logs.filter((l) => l.completed).length;
  const grade = total >= 30 ? 4 : total >= 20 ? 3 : total >= 12 ? 2 : total >= 5 ? 1 : 0;

  // 오늘까지 만난 보스 / 앞으로 만날 보스
  const past = schedule.filter((s) => s.date <= today);
  const upcoming = schedule.filter((s) => s.date > today);
  const nextSlot = upcoming[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s5)" }}>
      <Sabu>
        수요일과 일요일엔 <b>도깨비</b>가 찾아온다. 네가 <b>스스로 적은 방해물</b>이 모습을 갖춘 것이지.
        평소 수련을 쌓아두면, 도깨비는 네 앞에서 절로 물러난단다.
      </Sabu>

      {/* 다가오는 보스 */}
      {nextSlot && (
        <NextBoss slot={nextSlot} records={records} today={today} charKey={charKey} grade={grade} />
      )}

      {/* 지난 보스들 */}
      {past.length > 0 && (
        <section>
          <div style={sectionHead}>지금까지 만난 도깨비</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {past.slice().reverse().map((slot) => (
              <PastBoss key={slot.date} slot={slot} records={records} today={today} />
            ))}
          </div>
        </section>
      )}

      {past.length === 0 && !nextSlot && (
        <p style={{ textAlign: "center", color: "var(--ink-2)", fontSize: 13 }}>
          아직 도깨비를 만날 때가 아니구나. 수련을 쌓으며 기다리자.
        </p>
      )}

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, margin: 0 }}>
        못 넘긴 도깨비는 사라지지 않고 기다린다.<br />힘이 쌓이면 언제든 다시 넘어설 수 있다.
      </p>
    </div>
  );
}

function NextBoss({
  slot, records, today, charKey, grade,
}: { slot: BossSlot; records: DayRecord[]; today: string; charKey: CharKey; grade: number }) {
  // 지금 시점까지의 힘 미리보기 (구간 시작 ~ 오늘)
  const preview = resolveBoss({ ...slot, to: today < slot.to ? today : slot.to }, records);
  const daysLeft = daysBetween(today, slot.date);
  const kindLabel = slot.kind === "final" ? "여름의 마지막 상대" : slot.kind === "week" ? "이 주의 우두머리" : "중간 도깨비";

  return (
    <section style={{ ...panel, borderColor: "var(--kin)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span style={tinyLabel}>다음 · {kindLabel}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--kin)" }}>
          {daysLeft <= 0 ? "오늘 저녁" : `D-${daysLeft}`} · {slot.date.slice(5)}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, marginBottom: 12 }}>
        <Char charKey={charKey} grade={grade} size={78} anim noGround />
        <span style={{ width: slot.kind === "final" ? 150 : slot.kind === "week" ? 130 : 112, lineHeight: 0 }}
          dangerouslySetInnerHTML={{ __html: drawBoss(preview.boss, slot.kind, { anim: true }) }} />
      </div>

      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{preview.boss.name}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{preview.boss.intro}</div>
      </div>

      <PowerBar power={preview.power} need={preview.need} />
      <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, margin: "10px 0 0", textAlign: "center" }}>
        {preview.power >= preview.need
          ? "지금 실력이면 넉넉히 넘어선다. 이대로만 하면 된다."
          : `앞으로 남은 날 동안 수련을 ${Math.ceil((preview.need - preview.power) / 2)}번만 더 하면 넘어설 힘이 된다.`}
      </p>
    </section>
  );
}

function PastBoss({ slot, records, today }: { slot: BossSlot; records: DayRecord[]; today: string }) {
  // 오늘까지 늘려서 재판정 — 못 넘겼어도 나중에 힘이 차면 넘은 것으로
  const res = resolveBoss({ ...slot, to: today }, records);
  const kindLabel = slot.kind === "final" ? "최종" : slot.kind === "week" ? "주" : "중간";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 13px", borderRadius: "var(--r-md)",
      border: `1px solid ${res.cleared ? "var(--edge)" : "var(--kin)"}`,
      background: "var(--surface)",
    }}>
      <span style={{ width: 46, flexShrink: 0, lineHeight: 0 }}
        dangerouslySetInnerHTML={{ __html: drawBoss(res.boss, "mid", { defeated: res.cleared }) }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800 }}>
          {res.boss.name}
          <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 6, fontWeight: 600 }}>{slot.date.slice(5)} · {kindLabel}</span>
        </div>
        <div style={{ fontSize: 11.5, color: res.cleared ? "var(--bamboo)" : "var(--ink-2)", marginTop: 2 }}>
          {res.cleared ? "넘어섰다" : `아직 ${res.remaining}만큼 남음 — 기다리는 중`}
        </div>
      </div>
      <span style={{ fontSize: 20 }}>{res.cleared ? "✓" : "…"}</span>
    </div>
  );
}

function PowerBar({ power, need }: { power: number; need: number }) {
  const cleared = power >= need;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
        <span style={{ color: "var(--ink-2)" }}>내가 쌓은 힘</span>
        <span style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
          <b style={{ color: cleared ? "var(--bamboo)" : "var(--kin)" }}>{power}</b>
          <span style={{ color: "var(--ink-3)" }}> / {need}</span>
        </span>
      </div>
      <div style={{ height: 8, background: "var(--edge)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${Math.min(100, (power / need) * 100)}%`,
          background: cleared ? "var(--bamboo)" : "var(--kin)", borderRadius: 4, transition: "width .4s ease",
        }} />
      </div>
    </div>
  );
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from + "T12:00:00").getTime();
  const b = new Date(to + "T12:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

const panel: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--edge)",
  borderRadius: "var(--r-lg)", padding: "var(--s5)",
};
const sectionHead: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, color: "var(--ink-2)", letterSpacing: ".08em",
  padding: "0 2px 10px",
};
const tinyLabel: React.CSSProperties = {
  fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase",
  color: "var(--ink-2)", fontWeight: 800,
};
