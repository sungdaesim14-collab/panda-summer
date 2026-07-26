import { useState } from "react";
import { Sabu } from "../components/Sabu";
import { Card } from "../components/Card";
import { drawItem } from "../art/drawItem";
import { treasureOfDay } from "../game/treasures";
import type { CardData } from "../game/cards";
import type { SaveData, DayLog } from "../data/types";
import { totalDaysOf, todayLogOf, todayISO } from "../data/useGame";
import {
  DEFAULT_MISSIONS, MAX_MISSIONS, WOOP, WIN_OPTIONS, NOTE_PROMPTS,
  SABU, pickLine, daySeed, type WinKey,
} from "../game/missions";
import { fx } from "../game/feedback";
import { goalForDate } from "../game/dailyGoal";
import { rollCaveItem, caveItem, myCaveItems, RARITY_META, type CaveItem } from "../game/cave";
import { drawCaveItem } from "../art/drawCave";

/**
 * 매일의 흐름 — 계획과 결과를 정오(12시)로 나눈다.
 *   오전(~12시): 계획만  (수련 선택 + 작전). 결과는 못 누른다.
 *   오후(12시~): 결과만  (해낸 것 확인).
 * 이렇게 시간을 벌려 '저녁에 몰아서 한 것만 계획한 척'을 막는다.
 * (WOOP 기법의 핵심 = 미리 계획하고, 실행하고, 나중에 돌아본다)
 */

const NOON = 12; // 계획 마감 = 결과 시작

/** 현재 시각(시). 개발/확인용으로 URL ?hour=15 로 덮어쓸 수 있다 */
function currentHour(): number {
  try {
    const h = new URLSearchParams(location.search).get("hour");
    if (h != null && h !== "") return Number(h);
  } catch { /* 무시 */ }
  return new Date().getHours();
}

type Phase = "pick" | "woop" | "wait" | "today" | "complete" | "reveal";

interface Props {
  data: SaveData;
  onSaveLog: (log: DayLog) => Promise<void>;
  /** 동굴 보물 획득 (황금 목표 보상) */
  onAwardCave: (key: string) => Promise<void>;
}

export function TrainScreen({ data, onSaveLog, onAwardCave }: Props) {
  const TODAY = todayISO();
  const seed = daySeed(TODAY);
  const existing = todayLogOf(data);
  const beforeNoon = currentHour() < NOON;
  const goal = goalForDate(TODAY);
  const [goalReward, setGoalReward] = useState<CaveItem | null>(null);

  const completedCount = totalDaysOf(data);
  const DAY_NO = Math.min(32, existing?.completed ? completedCount : completedCount + 1);
  const treasure = treasureOfDay(DAY_NO)!;
  const notePrompt = NOTE_PROMPTS[Math.abs(seed) % NOTE_PROMPTS.length];

  const missed = !existing && !beforeNoon; // 계획 없이 정오 지남

  // 첫 화면 결정 (missed면 아래에서 따로 처리하므로 값은 무관)
  const initial: Phase =
    existing?.completed ? "reveal"
    : existing ? (beforeNoon ? "wait" : "today")
    : "pick";

  const [phase, setPhase] = useState<Phase>(initial);

  // 계획 단계 (오전)
  const [picked, setPicked] = useState<string[]>(existing?.missions ?? []);
  const [custom, setCustom] = useState("");
  const [woopStep, setWoopStep] = useState(0);
  const [woop, setWoop] = useState({
    outcome: existing?.outcome ?? "", obstacle: existing?.obstacle ?? "", plan: existing?.plan ?? "",
  });
  const [woopCustom, setWoopCustom] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);

  // 결과 단계 (오후)
  const [done, setDone] = useState<string[]>([]);
  const [stars, setStars] = useState(0);
  const [win, setWin] = useState<WinKey | "">("");
  const [praise, setPraise] = useState("");
  const [note, setNote] = useState("");
  const [pledged, setPledged] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ============ 계획 시간이 지났는데 계획을 안 함 ============ */
  if (missed) {
    return (
      <Wrap>
        <Sabu>{pickLine(SABU.comeback, seed)}</Sabu>
        <div style={{ ...panelBase, textAlign: "center", padding: "34px 20px" }}>
          <div style={{ fontSize: 34 }}>🌙</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 8 }}>오늘의 계획 시간은 지났구나</div>
          <p style={{ ...hint, marginTop: 8, lineHeight: 1.7 }}>
            수련의 약속은 <b style={{ color: "var(--ink)" }}>낮 12시 전에 미리</b> 세우는 것이란다.
            먼저 정하고, 하루 동안 해내고, 저녁에 돌아보는 것이지.<br /><br />
            오늘은 쉬어가도 좋다. <b style={{ color: "var(--kin)" }}>내일 아침</b>, 다시 만나자.
          </p>
        </div>
      </Wrap>
    );
  }

  /* ============ 1. 수련 고르기 (오전) ============ */
  if (phase === "pick") {
    const toggle = (m: string) => {
      fx.tap();
      setPicked((p) => (p.includes(m) ? p.filter((x) => x !== m) : p.length >= MAX_MISSIONS ? p : [...p, m]));
    };
    return (
      <Wrap>
        <NoonBadge beforeNoon />
        <GoalBanner goal={goal} />
        <Sabu>{pickLine(SABU.pick, seed)}</Sabu>
        <Panel title="오늘의 수련 고르기">
          <p style={hint}>여러 개 골라도 되고, 하나만 골라도 된다.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {DEFAULT_MISSIONS.concat(picked.filter((p) => !DEFAULT_MISSIONS.includes(p))).map((m) => {
              const on = picked.includes(m);
              return <button key={m} onClick={() => toggle(m)} aria-pressed={on} style={chip(on)}>{m}</button>;
            })}
          </div>
          <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
            <input value={custom} onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && custom.trim()) { toggle(custom.trim()); setCustom(""); } }}
              placeholder="직접 쓰기 (예: 일기 쓰기)" maxLength={30} style={{ ...input, minWidth: 0 }} />
            <button onClick={() => { if (custom.trim()) { toggle(custom.trim()); setCustom(""); } }}
              style={{ ...btn(false), width: "auto", flexShrink: 0, padding: "0 18px" }}>추가</button>
          </div>
          <p style={{ ...hint, marginTop: 12, color: "var(--kin)" }}>하루 {MAX_MISSIONS}개까지 · 지금 {picked.length}개</p>
        </Panel>
        <button disabled={picked.length === 0} onClick={() => { fx.select(); setPhase("woop"); }} style={btn(true, picked.length === 0)}>
          {picked.length === 0 ? "수련을 하나 이상 고르자" : `이 ${picked.length}개로 약속할래`}
        </button>
      </Wrap>
    );
  }

  /* ============ 2. WOOP 작전 (오전) ============ */
  if (phase === "woop") {
    const s = WOOP[woopStep];
    const cur = woop[s.key];
    const set = (v: string) => setWoop((w) => ({ ...w, [s.key]: v }));
    const next = async () => {
      if (woopStep < WOOP.length - 1) { fx.next(); setWoopStep(woopStep + 1); setWoopCustom(""); return; }
      // 작전 완성 → 계획을 저장한다 (미완료 상태)
      setSavingPlan(true);
      const planLog: DayLog = {
        date: TODAY, missions: picked, done: [], completed: false, stars: 0,
        outcome: woop.outcome, obstacle: woop.obstacle, plan: woop.plan,
        win: "", selfPraise: "", note: "", pledged: false, confessed: false,
        savedAt: new Date().toISOString(),
      };
      await onSaveLog(planLog);
      setSavingPlan(false);
      fx.select();
      setPhase("wait");
    };
    return (
      <Wrap>
        <div style={{ display: "flex", gap: 6, marginBottom: -6 }}>
          {WOOP.map((_, i) => (
            <span key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= woopStep ? "var(--kin)" : "var(--edge)" }} />
          ))}
        </div>
        <Panel title={`작전 ${s.step}`}>
          <h3 style={{ margin: "2px 0 6px", fontSize: 17, letterSpacing: "-.02em", lineHeight: 1.4 }}>{s.question}</h3>
          <p style={{ ...hint, marginBottom: 14 }}>{s.hint}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {s.options.map((o) => (
              <button key={o} onClick={() => { set(o); setWoopCustom(""); }} aria-pressed={cur === o} style={opt(cur === o)}>{o}</button>
            ))}
          </div>
          <input value={woopCustom} onChange={(e) => { setWoopCustom(e.target.value); set(e.target.value); }}
            placeholder={s.placeholder} maxLength={40} style={{ ...input, marginTop: 10 }} />
        </Panel>
        <button disabled={!cur.trim() || savingPlan} onClick={next} style={btn(true, !cur.trim() || savingPlan)}>
          {savingPlan ? "약속하는 중…" : woopStep < WOOP.length - 1 ? "다음" : "작전 완성 · 약속하기"}
        </button>
      </Wrap>
    );
  }

  /* ============ 계획 완료, 정오 전 대기 ============ */
  if (phase === "wait") {
    return (
      <Wrap>
        <NoonBadge beforeNoon />
        <Sabu>{pickLine(SABU.planDone, seed)}</Sabu>
        <PlanCard woop={{ outcome: existing?.outcome ?? woop.outcome, obstacle: existing?.obstacle ?? woop.obstacle, plan: existing?.plan ?? woop.plan }} />
        <Panel title="오늘 약속한 수련">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(existing?.missions ?? picked).map((m) => (
              <div key={m} style={{ fontSize: 14.5, color: "var(--ink)", padding: "2px 0" }}>· {m}</div>
            ))}
          </div>
        </Panel>
        <div style={{ ...panelBase, textAlign: "center", background: "rgba(224,172,72,0.08)", borderColor: "var(--kin)" }}>
          <div style={{ fontSize: 22 }}>☀️</div>
          <p style={{ ...hint, marginTop: 4, lineHeight: 1.7 }}>
            약속을 세웠구나. 이제 <b style={{ color: "var(--ink)" }}>하루 동안 해내면 된다.</b><br />
            <b style={{ color: "var(--kin)" }}>낮 12시가 지나면</b> 다시 와서 '해냈어요'를 확인하자.
          </p>
        </div>
        <button onClick={() => { setPhase("pick"); }} style={ghost}>계획 다시 짜기</button>
      </Wrap>
    );
  }

  /* ============ 3. 결과 체크 (오후) ============ */
  if (phase === "today") {
    const missions = existing?.missions ?? picked;
    const w = { outcome: existing?.outcome ?? "", obstacle: existing?.obstacle ?? "", plan: existing?.plan ?? "" };
    const toggleDone = (m: string) => {
      const adding = !done.includes(m);
      if (adding) fx.select(); else fx.tap();
      setDone((d) => (d.includes(m) ? d.filter((x) => x !== m) : [...d, m]));
    };
    return (
      <Wrap>
        <NoonBadge beforeNoon={false} />
        <GoalBanner goal={goal} />
        <Sabu>{pickLine(SABU.checking, seed)}</Sabu>
        <PlanCard woop={w} />
        <Panel title="해낸 만큼 체크">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {missions.map((m) => {
              const on = done.includes(m);
              return (
                <button key={m} onClick={() => toggleDone(m)} aria-pressed={on} style={check(on)}>
                  <span style={box(on)}>{on ? "✓" : ""}</span>
                  <span style={{ opacity: on ? 1 : 0.75 }}>{m}</span>
                </button>
              );
            })}
          </div>
        </Panel>
        <button disabled={done.length === 0} onClick={() => setPhase("complete")} style={btn(true, done.length === 0)}>
          {done.length === 0 ? "해낸 수련을 체크하자" : "오늘 수련 마무리하기"}
        </button>
      </Wrap>
    );
  }

  /* ============ 4. 마무리 (오후) ============ */
  if (phase === "complete") {
    const ready = stars > 0 && pledged;
    const w = { outcome: existing?.outcome ?? "", obstacle: existing?.obstacle ?? "", plan: existing?.plan ?? "" };
    return (
      <Wrap>
        <Panel title="오늘 수련의 난이도는?">
          <p style={hint}>보상과는 아무 상관이 없다. 오늘의 나를 솔직하게 매겨보자.</p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "10px 0 4px" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)} aria-label={`${n}점`} style={starBtn(n <= stars)}>★</button>
            ))}
          </div>
          {stars > 0 && (
            <p style={{ ...hint, textAlign: "center", color: "var(--kin)" }}>
              {["", "가뿐했어", "할 만했어", "조금 힘들었어", "힘들었지만 해냈어", "정말 힘들었는데 해냈어"][stars]}
            </p>
          )}
        </Panel>
        <Panel title="세운 작전, 통했니?">
          <p style={{ ...hint, marginBottom: 10 }}>작전: {w.plan}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {WIN_OPTIONS.map((wo) => (
              <button key={wo.key} onClick={() => setWin(wo.key)} aria-pressed={win === wo.key} style={opt(win === wo.key)}>{wo.label}</button>
            ))}
          </div>
        </Panel>
        <Panel title="나에게 한마디 (안 써도 돼)">
          <input value={praise} onChange={(e) => setPraise(e.target.value)} placeholder="예: 끝까지 해낸 내가 자랑스러워" maxLength={40} style={input} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={notePrompt} maxLength={60} style={{ ...input, marginTop: 8 }} />
        </Panel>
        <button onClick={() => setPledged((p) => !p)} aria-pressed={pledged} style={pledge(pledged)}>
          <span style={box(pledged)}>{pledged ? "✓" : ""}</span>
          <span style={{ textAlign: "left", lineHeight: 1.5 }}>
            <b>판다 사부와의 양심 약속</b><br />
            <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>나는 체크한 수련을 정말로 해냈어요. 보상보다 나의 양심이 더 소중해요.</span>
          </span>
        </button>
        <button disabled={!ready || saving}
          onClick={async () => {
            setSaving(true);
            const base = existing ?? { missions: picked, outcome: woop.outcome, obstacle: woop.obstacle, plan: woop.plan };
            const log: DayLog = {
              date: TODAY, missions: base.missions, done, completed: true, stars,
              outcome: base.outcome, obstacle: base.obstacle, plan: base.plan,
              win, selfPraise: praise, note, pledged: true, confessed: false,
              savedAt: new Date().toISOString(),
            };
            await onSaveLog(log);
            // 오늘의 황금 목표 판정 → 달성이면 동굴 보물 하나 (중복 없이)
            if (goal.achieved(log)) {
              const owned = new Set(myCaveItems(data.cards).map((x) => x.key));
              const won = rollCaveItem(owned);
              if (won) { await onAwardCave(won.key); setGoalReward(won); }
            }
            setSaving(false);
            fx.complete();
            setPhase("reveal");
            setTimeout(() => (treasure.rarity === "legend" ? fx.legend() : fx.reveal()), 340);
          }}
          style={btn(true, !ready || saving)}>
          {saving ? "저장하는 중…" : !stars ? "별점을 매겨줘" : !pledged ? "양심 약속에 체크해줘" : "오늘 수련 마무리!"}
        </button>
      </Wrap>
    );
  }

  /* ============ 5. 카드 해금 ============ */
  const src = existing?.completed
    ? existing
    : { done, win, obstacle: woop.obstacle, selfPraise: praise, missions: existing?.missions ?? picked };
  const card: CardData = {
    id: treasure.key, kind: "treasure", name: treasure.name, sub: treasure.sub,
    rarity: treasure.rarity, no: `${String(treasure.day).padStart(2, "0")} / 32`,
    record: { date: TODAY, missions: src.done, beatObstacle: src.win === "win" ? src.obstacle : "", selfPraise: src.selfPraise },
  };
  const allKept = src.done.length === src.missions.length;

  return (
    <Wrap>
      <Sabu>{pickLine(allKept ? SABU.wonAll : SABU.wonSome, seed)}</Sabu>
      <div style={{ ...panelBase, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".18em", color: "var(--kin)", fontWeight: 800 }}>
            {DAY_NO}일째 · 오늘의 노력이 하나를 열었다
          </div>
          <p style={{ ...hint, marginTop: 4 }}>운이 아니라, 네가 해낸 만큼 순서대로 열린다.</p>
        </div>
        <Card card={card} width={172}
          art={<span style={{ display: "block", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: drawItem(treasure.key) }} />} />
        <p style={{ ...hint, maxWidth: 260 }}>카드를 눌러 뒤집으면 <b style={{ color: "var(--ink)" }}>오늘 네가 남긴 기록</b>이 있다.</p>
      </div>

      {goalReward && (
        <div style={{ ...panelBase, textAlign: "center", borderColor: "var(--kin)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--kin)", fontWeight: 800 }}>
            🌟 오늘의 황금 목표 달성!
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{goal.title}</div>
          <div style={{
            width: 84, aspectRatio: "1/1", padding: 10, borderRadius: 12, lineHeight: 0,
            border: `2px solid ${RARITY_META[goalReward.rarity].edge}`, background: "var(--ground-2)",
          }} dangerouslySetInnerHTML={{ __html: drawCaveItem(goalReward.key) }} />
          <div style={{ fontSize: 13.5, fontWeight: 800 }}>
            {caveItem(goalReward.key)?.name} <span style={{ fontSize: 11, color: "var(--ink-2)" }}>· 동굴 보물</span>
          </div>
        </div>
      )}
    </Wrap>
  );
}

function GoalBanner({ goal }: { goal: { title: string; hint: string } }) {
  return (
    <div style={{
      display: "flex", gap: 11, alignItems: "flex-start",
      padding: "12px 14px", borderRadius: "var(--r-md)",
      border: "1px solid var(--kin)", background: "rgba(224,172,72,0.08)",
    }}>
      <span style={{ fontSize: 20, lineHeight: 1.2 }}>🌟</span>
      <div>
        <div style={{ fontSize: 10.5, letterSpacing: ".14em", color: "var(--kin)", fontWeight: 800 }}>오늘의 황금 목표</div>
        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{goal.title}</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.5 }}>
          {goal.hint} <span style={{ color: "var(--kin)" }}>달성하면 동굴 보물 하나!</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 조각 ---------------- */

function NoonBadge({ beforeNoon }: { beforeNoon: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7, alignSelf: "center",
      padding: "5px 13px", borderRadius: "var(--r-pill)", border: "1px solid var(--edge)",
      background: "var(--surface)", fontSize: 12, color: "var(--ink-2)", fontWeight: 700,
    }}>
      {beforeNoon ? "🌅 계획 시간 (~낮 12시)" : "🌇 확인 시간 (낮 12시~)"}
    </div>
  );
}

function PlanCard({ woop }: { woop: { outcome: string; obstacle: string; plan: string } }) {
  return (
    <Panel title="오늘의 작전">
      <PlanRow k="결과" v={woop.outcome} />
      <PlanRow k="방해물" v={woop.obstacle} />
      <PlanRow k="작전" v={woop.plan} accent />
    </Panel>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "var(--s4)", maxWidth: 460, margin: "0 auto" }}>{children}</div>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={panelBase}>
      <div style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", fontWeight: 800, marginBottom: 8 }}>{title}</div>
      {children}
    </section>
  );
}
function PlanRow({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: 8, padding: "4px 0", fontSize: 13.5 }}>
      <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 800, letterSpacing: ".06em", paddingTop: 2 }}>{k}</span>
      <span style={{ fontWeight: 600, color: accent ? "var(--kin)" : "var(--ink)" }}>{v}</span>
    </div>
  );
}

const panelBase: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--edge)", borderRadius: "var(--r-lg)", padding: "var(--s4) var(--s5)",
};
const hint: React.CSSProperties = { margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 };
const input: React.CSSProperties = {
  flex: 1, width: "100%", background: "var(--ground-2)", color: "var(--ink)",
  border: "1px solid var(--edge)", borderRadius: "var(--r-sm)", padding: "11px 12px",
  fontSize: 14, fontFamily: "inherit", outline: "none",
};
function chip(on: boolean): React.CSSProperties {
  return {
    padding: "8px 13px", borderRadius: "var(--r-sm)", fontSize: 13, fontWeight: 600,
    border: `1px solid ${on ? "var(--bamboo)" : "var(--edge)"}`,
    background: on ? "var(--bamboo)" : "transparent", color: on ? "var(--ground)" : "var(--ink)", cursor: "pointer", lineHeight: 1.3,
  };
}
function opt(on: boolean): React.CSSProperties {
  return {
    padding: "13px 14px", borderRadius: "var(--r-md)", fontSize: 14.5, fontWeight: 600, textAlign: "left",
    border: `1px solid ${on ? "var(--kin)" : "var(--edge)"}`,
    background: on ? "rgba(224,172,72,0.14)" : "transparent", color: "var(--ink)", cursor: "pointer",
  };
}
function check(on: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: 11, padding: "13px 14px",
    borderRadius: "var(--r-md)", fontSize: 14.5, fontWeight: 600, textAlign: "left",
    border: `1px solid ${on ? "var(--bamboo)" : "var(--edge)"}`,
    background: on ? "rgba(95,179,124,0.13)" : "transparent", color: "var(--ink)", cursor: "pointer",
  };
}
function box(on: boolean): React.CSSProperties {
  return {
    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
    border: `2px solid ${on ? "var(--bamboo)" : "var(--edge)"}`, background: on ? "var(--bamboo)" : "transparent",
    color: "var(--ground)", fontSize: 14, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center",
  };
}
function pledge(on: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "flex-start", gap: 11, padding: "14px 16px", borderRadius: "var(--r-md)", cursor: "pointer", fontSize: 14,
    border: `1px solid ${on ? "var(--kin)" : "var(--edge)"}`, background: on ? "rgba(224,172,72,0.10)" : "var(--surface)", color: "var(--ink)",
  };
}
function starBtn(on: boolean): React.CSSProperties {
  return {
    background: "none", border: "none", cursor: "pointer", padding: 2, fontSize: 34, lineHeight: 1,
    color: on ? "var(--kin)" : "var(--edge)", transition: "color .15s, transform .12s", transform: on ? "scale(1.05)" : "none",
  };
}
function btn(primary: boolean, disabled = false): React.CSSProperties {
  return {
    width: "100%", padding: "15px", borderRadius: "var(--r-md)", border: "none", fontSize: 15, fontWeight: 800, letterSpacing: "-.01em",
    background: disabled ? "var(--edge)" : primary ? "var(--kin)" : "var(--surface)",
    color: disabled ? "var(--ink-3)" : primary ? "var(--on-kin)" : "var(--ink)",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
const ghost: React.CSSProperties = {
  width: "100%", padding: "10px", background: "none", border: "none", color: "var(--ink-3)", fontSize: 13, textDecoration: "underline", cursor: "pointer",
};
