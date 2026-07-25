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

/** 이 화면이 거치는 단계 */
type Phase = "pick" | "woop" | "today" | "complete" | "reveal";

interface Props {
  data: SaveData;
  onSaveLog: (log: DayLog) => Promise<void>;
}

export function TrainScreen({ data, onSaveLog }: Props) {
  const TODAY = todayISO();
  const seed = daySeed(TODAY);
  const existing = todayLogOf(data);
  // 오늘이 며칠째 수련인가.
  // 오늘 이미 완료했으면 그 완료가 카운트에 포함돼 있으니 그대로,
  // 아직이면 +1 (오늘 완료하면 될 번호).
  const completedCount = totalDaysOf(data);
  const DAY_NO = Math.min(32, existing?.completed ? completedCount : completedCount + 1);

  // 오늘 이미 마무리했으면 완료 화면을 보여줄 수도 있지만,
  // 미리보기 단계이므로 항상 처음부터 시작할 수 있게 둔다.
  const [phase, setPhase] = useState<Phase>(existing?.completed ? "reveal" : "pick");
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  const [woopStep, setWoopStep] = useState(0);
  const [woop, setWoop] = useState({ outcome: "", obstacle: "", plan: "" });
  const [woopCustom, setWoopCustom] = useState("");

  const [done, setDone] = useState<string[]>([]);
  const [stars, setStars] = useState(0);
  const [win, setWin] = useState<WinKey | "">("");
  const [praise, setPraise] = useState("");
  const [note, setNote] = useState("");
  const [pledged, setPledged] = useState(false);
  const [saving, setSaving] = useState(false);

  const treasure = treasureOfDay(DAY_NO)!;
  const notePrompt = NOTE_PROMPTS[Math.abs(seed) % NOTE_PROMPTS.length];

  /* ---------------- 1. 수련 고르기 ---------------- */
  if (phase === "pick") {
    const toggle = (m: string) => {
      fx.tap();
      setPicked((p) => (p.includes(m) ? p.filter((x) => x !== m) : p.length >= MAX_MISSIONS ? p : [...p, m]));
    };

    return (
      <Wrap>
        <Sabu>{pickLine(SABU.pick, seed)}</Sabu>

        <Panel title="오늘의 수련 고르기">
          <p style={hint}>여러 개 골라도 되고, 하나만 골라도 된다.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {DEFAULT_MISSIONS.concat(picked.filter((p) => !DEFAULT_MISSIONS.includes(p))).map((m) => {
              const on = picked.includes(m);
              return (
                <button key={m} onClick={() => toggle(m)} aria-pressed={on} style={chip(on)}>
                  {m}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && custom.trim()) {
                  toggle(custom.trim()); setCustom("");
                }
              }}
              placeholder="직접 쓰기 (예: 일기 쓰기)"
              maxLength={30}
              style={{ ...input, minWidth: 0 }}
            />
            <button
              onClick={() => { if (custom.trim()) { toggle(custom.trim()); setCustom(""); } }}
              style={{ ...btn(false), width: "auto", flexShrink: 0, padding: "0 18px" }}
            >
              추가
            </button>
          </div>

          <p style={{ ...hint, marginTop: 12, color: "var(--kin)" }}>
            하루 {MAX_MISSIONS}개까지 · 지금 {picked.length}개
          </p>
        </Panel>

        <button
          disabled={picked.length === 0}
          onClick={() => { fx.select(); setPhase("woop"); }}
          style={btn(true, picked.length === 0)}
        >
          {picked.length === 0 ? "수련을 하나 이상 고르자" : `이 ${picked.length}개로 약속할래`}
        </button>
      </Wrap>
    );
  }

  /* ---------------- 2. WOOP 작전 짜기 ---------------- */
  if (phase === "woop") {
    const s = WOOP[woopStep];
    const cur = woop[s.key];
    const set = (v: string) => setWoop((w) => ({ ...w, [s.key]: v }));

    const next = () => {
      fx.next();
      if (woopStep < WOOP.length - 1) { setWoopStep(woopStep + 1); setWoopCustom(""); }
      else setPhase("today");
    };

    return (
      <Wrap>
        <div style={{ display: "flex", gap: 6, marginBottom: -6 }}>
          {WOOP.map((_, i) => (
            <span key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= woopStep ? "var(--kin)" : "var(--edge)",
            }} />
          ))}
        </div>

        <Panel title={`작전 ${s.step}`}>
          <h3 style={{ margin: "2px 0 6px", fontSize: 17, letterSpacing: "-.02em", lineHeight: 1.4 }}>
            {s.question}
          </h3>
          <p style={{ ...hint, marginBottom: 14 }}>{s.hint}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {s.options.map((o) => (
              <button key={o} onClick={() => { set(o); setWoopCustom(""); }} aria-pressed={cur === o} style={opt(cur === o)}>
                {o}
              </button>
            ))}
          </div>

          <input
            value={woopCustom}
            onChange={(e) => { setWoopCustom(e.target.value); set(e.target.value); }}
            placeholder={s.placeholder}
            maxLength={40}
            style={{ ...input, marginTop: 10 }}
          />
        </Panel>

        <button disabled={!cur.trim()} onClick={next} style={btn(true, !cur.trim())}>
          {woopStep < WOOP.length - 1 ? "다음" : "작전 완성"}
        </button>
      </Wrap>
    );
  }

  /* ---------------- 3. 오늘 (실행 중) ---------------- */
  if (phase === "today") {
    const toggleDone = (m: string) => {
      const adding = !done.includes(m);
      if (adding) fx.select(); else fx.tap();
      setDone((d) => (d.includes(m) ? d.filter((x) => x !== m) : [...d, m]));
    };

    return (
      <Wrap>
        <Sabu>{pickLine(SABU.planDone, seed)}</Sabu>

        <Panel title="오늘의 작전">
          <PlanRow k="결과" v={woop.outcome} />
          <PlanRow k="방해물" v={woop.obstacle} />
          <PlanRow k="작전" v={woop.plan} accent />
        </Panel>

        <Panel title="해낸 만큼 체크">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {picked.map((m) => {
              const on = done.includes(m);
              return (
                <button key={m} onClick={() => toggleDone(m)} aria-pressed={on} style={check(on)}>
                  <span style={box(on)}>{on ? "✓" : ""}</span>
                  <span style={{ textDecoration: on ? "none" : "none", opacity: on ? 1 : 0.75 }}>{m}</span>
                </button>
              );
            })}
          </div>
        </Panel>

        <button disabled={done.length === 0} onClick={() => setPhase("complete")} style={btn(true, done.length === 0)}>
          {done.length === 0 ? "해낸 수련을 체크하자" : "오늘 수련 마무리하기"}
        </button>
        <button onClick={() => { setPhase("pick"); setDone([]); }} style={ghost}>
          수련 다시 고르기
        </button>
      </Wrap>
    );
  }

  /* ---------------- 4. 마무리 ---------------- */
  if (phase === "complete") {
    const ready = stars > 0 && pledged;
    return (
      <Wrap>
        <Panel title="오늘 수련의 난이도는?">
          <p style={hint}>보상과는 아무 상관이 없다. 오늘의 나를 솔직하게 매겨보자.</p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "10px 0 4px" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)} aria-label={`${n}점`} style={starBtn(n <= stars)}>
                ★
              </button>
            ))}
          </div>
          {stars > 0 && (
            <p style={{ ...hint, textAlign: "center", color: "var(--kin)" }}>
              {["", "가뿐했어", "할 만했어", "조금 힘들었어", "힘들었지만 해냈어", "정말 힘들었는데 해냈어"][stars]}
            </p>
          )}
        </Panel>

        <Panel title="세운 작전, 통했니?">
          <p style={{ ...hint, marginBottom: 10 }}>작전: {woop.plan}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {WIN_OPTIONS.map((w) => (
              <button key={w.key} onClick={() => setWin(w.key)} aria-pressed={win === w.key} style={opt(win === w.key)}>
                {w.label}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="나에게 한마디 (안 써도 돼)">
          <input value={praise} onChange={(e) => setPraise(e.target.value)}
            placeholder="예: 끝까지 해낸 내가 자랑스러워" maxLength={40} style={input} />
          <input value={note} onChange={(e) => setNote(e.target.value)}
            placeholder={notePrompt} maxLength={60} style={{ ...input, marginTop: 8 }} />
        </Panel>

        <button onClick={() => setPledged((p) => !p)} aria-pressed={pledged} style={pledge(pledged)}>
          <span style={box(pledged)}>{pledged ? "✓" : ""}</span>
          <span style={{ textAlign: "left", lineHeight: 1.5 }}>
            <b>판다 사부와의 양심 약속</b><br />
            <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
              나는 체크한 수련을 정말로 해냈어요. 보상보다 나의 양심이 더 소중해요.
            </span>
          </span>
        </button>

        <button
          disabled={!ready || saving}
          onClick={async () => {
            setSaving(true);
            const log: DayLog = {
              date: TODAY, missions: picked, done, completed: true, stars,
              outcome: woop.outcome, obstacle: woop.obstacle, plan: woop.plan,
              win, selfPraise: praise, note, pledged: true, confessed: false,
              savedAt: new Date().toISOString(),
            };
            await onSaveLog(log);
            setSaving(false);
            fx.complete();
            setPhase("reveal");
            // 카드 종소리는 화면이 뜬 직후에 (등급에 따라 다르게)
            setTimeout(() => (treasure.rarity === "legend" ? fx.legend() : fx.reveal()), 340);
          }}
          style={btn(true, !ready || saving)}
        >
          {saving ? "저장하는 중…" : !stars ? "별점을 매겨줘" : !pledged ? "양심 약속에 체크해줘" : "오늘 수련 마무리!"}
        </button>
      </Wrap>
    );
  }

  /* ---------------- 5. 카드 해금 ---------------- */
  // 이미 오늘 마무리했다면 저장된 기록을, 방금 마무리했다면 방금 값을 쓴다.
  const src = existing?.completed ? existing : { done, win, obstacle: woop.obstacle, selfPraise: praise, missions: picked };
  const card: CardData = {
    id: treasure.key, kind: "treasure", name: treasure.name, sub: treasure.sub,
    rarity: treasure.rarity, no: `${String(treasure.day).padStart(2, "0")} / 32`,
    record: {
      date: TODAY,
      missions: src.done,
      beatObstacle: src.win === "win" ? src.obstacle : "",
      selfPraise: src.selfPraise,
    },
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

        <Card
          card={card}
          width={172}
          art={<span style={{ display: "block", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: drawItem(treasure.key) }} />}
        />

        <p style={{ ...hint, maxWidth: 260 }}>
          카드를 눌러 뒤집으면 <b style={{ color: "var(--ink)" }}>오늘 네가 남긴 기록</b>이 있다.
        </p>
      </div>

      <button onClick={() => {
        setPhase("pick"); setPicked([]); setDone([]); setStars(0);
        setWin(""); setPraise(""); setNote(""); setPledged(false);
        setWoop({ outcome: "", obstacle: "", plan: "" }); setWoopStep(0);
      }} style={ghost}>
        처음부터 다시 (미리보기용)
      </button>
    </Wrap>
  );
}

/* ---------------- 조각 ---------------- */

function Wrap({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "var(--s4)", maxWidth: 460, margin: "0 auto" }}>{children}</div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={panelBase}>
      <div style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", fontWeight: 800, marginBottom: 8 }}>
        {title}
      </div>
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
  background: "var(--surface)", border: "1px solid var(--edge)",
  borderRadius: "var(--r-lg)", padding: "var(--s4) var(--s5)",
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
    background: on ? "var(--bamboo)" : "transparent",
    color: on ? "var(--ground)" : "var(--ink)", cursor: "pointer", lineHeight: 1.3,
  };
}
function opt(on: boolean): React.CSSProperties {
  return {
    padding: "13px 14px", borderRadius: "var(--r-md)", fontSize: 14.5, fontWeight: 600, textAlign: "left",
    border: `1px solid ${on ? "var(--kin)" : "var(--edge)"}`,
    background: on ? "rgba(224,172,72,0.14)" : "transparent",
    color: "var(--ink)", cursor: "pointer",
  };
}
function check(on: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: 11, padding: "13px 14px",
    borderRadius: "var(--r-md)", fontSize: 14.5, fontWeight: 600, textAlign: "left",
    border: `1px solid ${on ? "var(--bamboo)" : "var(--edge)"}`,
    background: on ? "rgba(95,179,124,0.13)" : "transparent",
    color: "var(--ink)", cursor: "pointer",
  };
}
function box(on: boolean): React.CSSProperties {
  return {
    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
    border: `2px solid ${on ? "var(--bamboo)" : "var(--edge)"}`,
    background: on ? "var(--bamboo)" : "transparent",
    color: "var(--ground)", fontSize: 14, fontWeight: 900,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}
function pledge(on: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "flex-start", gap: 11, padding: "14px 16px",
    borderRadius: "var(--r-md)", cursor: "pointer", fontSize: 14,
    border: `1px solid ${on ? "var(--kin)" : "var(--edge)"}`,
    background: on ? "rgba(224,172,72,0.10)" : "var(--surface)",
    color: "var(--ink)",
  };
}
function starBtn(on: boolean): React.CSSProperties {
  return {
    background: "none", border: "none", cursor: "pointer", padding: 2,
    fontSize: 34, lineHeight: 1, color: on ? "var(--kin)" : "var(--edge)",
    transition: "color .15s, transform .12s", transform: on ? "scale(1.05)" : "none",
  };
}
function btn(primary: boolean, disabled = false): React.CSSProperties {
  return {
    width: "100%", padding: "15px", borderRadius: "var(--r-md)", border: "none",
    fontSize: 15, fontWeight: 800, letterSpacing: "-.01em",
    background: disabled ? "var(--edge)" : primary ? "var(--kin)" : "var(--surface)",
    color: disabled ? "var(--ink-3)" : primary ? "var(--on-kin)" : "var(--ink)",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
const ghost: React.CSSProperties = {
  width: "100%", padding: "10px", background: "none", border: "none",
  color: "var(--ink-3)", fontSize: 13, textDecoration: "underline", cursor: "pointer",
};
