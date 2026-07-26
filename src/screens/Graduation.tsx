import { Char } from "../components/Char";
import { computeStats } from "../game/kata";
import { myCaveItems } from "../game/cave";
import { computeKata } from "../game/kata";
import { SEASON } from "../game/season";
import type { SaveData } from "../data/types";
import type { CharKey } from "../art/chars";
import { CHARS } from "../art/chars";

interface Props {
  data: SaveData;
  onClose: () => void;
}

/**
 * 졸업 — 32일 여정의 마무리.
 * 완주(32일)했든 못 했든 여름을 돌아보고 격려한다.
 * (완주가 목표지만, 못 해도 '다시 시작한 용기'와 '최고 기록'을 기린다 — 회복탄력성)
 */
export function Graduation({ data, onClose }: Props) {
  const stats = computeStats(data.logs);
  const charKey = (data.user.character || "panda") as CharKey;
  const char = CHARS[charKey];
  const grade = stats.total >= 30 ? 4 : stats.total >= 20 ? 3 : stats.total >= 12 ? 2 : stats.total >= 5 ? 1 : 0;
  const finished = stats.total >= 32;

  const cards = data.cards.filter((c) => c.kind === "treasure").length;
  const cave = myCaveItems(data.cards).length;
  const kata = computeKata(data.logs).filter((k) => k.done).length;

  // 가장 자주 이긴 방해물
  const obsCount = new Map<string, number>();
  for (const l of data.logs) {
    if (l.completed && l.win === "win" && l.obstacle) obsCount.set(l.obstacle, (obsCount.get(l.obstacle) ?? 0) + 1);
  }
  let topObs = "", topN = 0;
  for (const [k, n] of obsCount) if (n > topN) { topN = n; topObs = k; }

  return (
    <div style={overlay} role="dialog" aria-label="여름 수련 수료증">
      <div style={{ maxWidth: 400, width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={cert}>
          {/* 머리 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 30 }}>🎓</div>
            <div style={{ fontSize: 11, letterSpacing: ".3em", color: "var(--kin)", fontWeight: 800, marginTop: 4 }}>
              竹 の 剣 士
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", marginTop: 6 }}>
              여름 수련 수료증
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 3 }}>
              {SEASON.start} — {SEASON.end}
            </div>
          </div>

          {/* 캐릭터 */}
          <div style={{ width: 150, margin: "6px auto" }}>
            <Char charKey={charKey} grade={grade} anim noGround />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{data.user.nickname}</div>
            <div style={{ fontSize: 12.5, color: "var(--kin)", fontWeight: 700 }}>
              {char.name} · {["아기", "수련생", "검객", "달인", "전설"][grade]}
            </div>
          </div>

          {/* 판다 사부의 말 */}
          <p style={{ fontSize: 14, lineHeight: 1.75, textAlign: "center", color: "var(--ink)", margin: "4px 0" }}>
            {finished
              ? "서른두 밤을 걸어 정상에 섰구나. 네가 이긴 것은 도깨비가 아니라, 매일 아침의 너 자신이었다. 이 여름을 잊지 말거라."
              : `${stats.total}일을 스스로 걸었다. 완주는 못 했어도, 스스로 마음먹고 해낸 그 하루하루는 사라지지 않는다. 정말 잘했다.`}
          </p>

          {/* 통계 */}
          <div style={grid}>
            <Stat n={stats.total} unit="일" label="수련한 날" hi />
            <Stat n={stats.maxStreak} unit="일" label="최고 연속" />
            <Stat n={stats.winCount} unit="번" label="이긴 방해물" />
            <Stat n={stats.hardCount} unit="번" label="넘은 고비" />
            <Stat n={cards} unit={`/32`} label="여정의 카드" />
            <Stat n={kata} unit="형" label="익힌 호흡법" />
          </div>

          {topObs && (
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", textAlign: "center", lineHeight: 1.6 }}>
              이 여름 네가 가장 많이 이겨낸 것은<br /><b style={{ color: "var(--ink)" }}>'{topObs}'</b> 이었다.
            </div>
          )}

          {finished && (
            <div style={{
              textAlign: "center", padding: "12px", borderRadius: "var(--r-md)",
              background: "rgba(224,172,72,0.12)", border: "1px solid var(--kin)",
              fontSize: 13, fontWeight: 700, color: "var(--kin)",
            }}>
              🏔️ 약속의 산 정상 · 완주 검객
            </div>
          )}

          {cave > 0 && (
            <div style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
              동굴 보물 {cave}/31 · 두뇌 수련도 게을리하지 않았구나
            </div>
          )}
        </div>

        <button onClick={onClose} style={btn}>간직하기</button>
      </div>
    </div>
  );
}

function Stat({ n, unit, label, hi }: { n: number; unit: string; label: string; hi?: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 4px", borderRadius: "var(--r-sm)", background: "var(--ground-2)" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: hi ? "var(--kin)" : "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
        {n}<span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 700 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--ink-2)", marginTop: 1 }}>{label}</div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 60,
  background: "rgba(10,13,10,0.86)", backdropFilter: "blur(3px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};
const cert: React.CSSProperties = {
  background: "var(--surface)", border: "2px solid var(--kin)", borderRadius: "var(--r-lg)",
  padding: "22px 20px", display: "flex", flexDirection: "column", gap: 12,
  boxShadow: "0 0 40px -8px rgba(224,172,72,0.4)",
};
const grid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
};
const btn: React.CSSProperties = {
  width: "100%", marginTop: 12, padding: "14px", borderRadius: "var(--r-md)", border: "none",
  background: "var(--kin)", color: "var(--on-kin)", fontSize: 15, fontWeight: 800, cursor: "pointer",
};
