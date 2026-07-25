import { useState } from "react";
import { Char } from "./components/Char";
import { CHAR_LIST, GRADES, type CharKey } from "./art/chars";
import { BossPreview } from "./screens/BossPreview";
import { CardPreview } from "./screens/CardPreview";
import { TrainScreen } from "./screens/TrainScreen";
import { MountainScreen } from "./screens/MountainScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { CharSelectScreen } from "./screens/CharSelectScreen";
import { useGame, totalDaysOf, streakDaysOf } from "./data/useGame";
import { hasServer } from "./data/store";
import { FxToggle } from "./components/FxToggle";

export function App() {
  const game = useGame();

  if (game.auth.phase === "loading") {
    return <Splash />;
  }
  if (game.auth.phase === "login") {
    return <LoginScreen onLogin={game.login} onRegister={game.register} />;
  }
  if (game.auth.phase === "chooseChar") {
    return <CharSelectScreen nickname={game.auth.nickname} onChoose={game.chooseCharacter} />;
  }

  // phase === "ready"
  return <Home game={game} />;
}

function Home({ game }: { game: ReturnType<typeof useGame> }) {
  const [tab, setTab] = useState<"train" | "mountain" | "cards" | "boss" | "chars" | "lab">("train");
  const data = game.auth.phase === "ready" ? game.auth.data : null;
  if (!data) return null;

  const total = totalDaysOf(data);
  const streak = streakDaysOf(data);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "16px 14px 40px" }}>
      <header style={headerBar}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: ".3em", color: "var(--kin)" }}>竹 の 剣 士</div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.02em" }}>{data.user.nickname}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <FxToggle />
          <Stat n={total} label="수련일" />
          <Stat n={streak} label="연속" />
          <span style={{ width: 40 }}><Char charKey={(data.user.character || "panda") as CharKey} grade={gradeOf(total)} noGround /></span>
        </div>
      </header>

      {!hasServer() && (
        <div style={localBanner}>
          지금은 <b>이 기기에만</b> 저장돼요. 친구와 함께 쓰려면 서버 연결이 필요해요 (아빠가 준비 중).
        </div>
      )}

      <nav style={navBar}>
        {([
          ["train", "수련"], ["mountain", "약속의 산"], ["cards", "도감"], ["boss", "보스"],
          ["chars", "캐릭터"], ["lab", "실험실"],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k} style={pill(tab === k)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "train" && <TrainScreen data={data} onSaveLog={game.saveLog} />}
      {tab === "mountain" && <MountainScreen data={data} />}
      {tab === "cards" && <CardPreview />}
      {tab === "boss" && <BossPreview />}
      {tab === "chars" && <CharGallery />}
      {tab === "lab" && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: 16 }}>
            아직 만드는 중인 화면들이 여기 모여요.
          </p>
          <button onClick={game.logout} style={{ ...pill(false), padding: "10px 20px" }}>로그아웃</button>
        </div>
      )}
    </div>
  );
}

function gradeOf(total: number): number {
  return total >= 30 ? 4 : total >= 20 ? 3 : total >= 12 ? 2 : total >= 5 ? 1 : 0;
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 40 }}>
      <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{n}</div>
      <div style={{ fontSize: 9.5, color: "var(--ink-2)" }}>{label}</div>
    </div>
  );
}

function Splash() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 }}>
      <span style={{ width: 90 }}><Char charKey="panda" grade={2} anim noGround /></span>
      <span style={{ color: "var(--ink-2)", fontSize: 13 }}>불러오는 중…</span>
    </div>
  );
}

/* ---- 캐릭터 도감 (기존 부품 확인용) ---- */
function CharGallery() {
  const [key, setKey] = useState<CharKey>("panda");
  const [grade, setGrade] = useState(2);
  const cur = CHAR_LIST.find((c) => c.key === key)!;
  return (
    <div>
      <section style={{ background: "var(--surface)", border: "1px solid var(--edge)", borderRadius: "var(--r-lg)", padding: 20, display: "grid", gridTemplateColumns: "minmax(0,1fr) 200px", gap: 20, alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Char charKey={key} grade={grade} size={220} anim /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{cur.name}</div>
            <div style={{ fontSize: 12, color: "var(--kin)", fontWeight: 700 }}>{GRADES[grade].name} · {GRADES[grade].need}일</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CHAR_LIST.map((c) => (
              <button key={c.key} onClick={() => setKey(c.key)} aria-pressed={c.key === key} style={pill(c.key === key)}>{c.short}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {GRADES.map((g) => (
              <button key={g.idx} onClick={() => setGrade(g.idx)} aria-pressed={g.idx === grade} style={pill(g.idx === grade)}>{g.name}</button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---- 스타일 ---- */
const headerBar: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "0 4px 14px", marginBottom: 14, borderBottom: "1px solid var(--edge)",
};
const navBar: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" };
const localBanner: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--edge)", borderLeft: "3px solid var(--kin)",
  borderRadius: "var(--r-sm)", padding: "10px 13px", fontSize: 12.5, color: "var(--ink-2)",
  lineHeight: 1.55, marginBottom: 16,
};

function pill(on: boolean): React.CSSProperties {
  return {
    padding: "8px 15px", borderRadius: "var(--r-pill)",
    border: `1px solid ${on ? "var(--bamboo)" : "var(--edge)"}`,
    background: on ? "var(--bamboo)" : "transparent",
    color: on ? "var(--ground)" : "var(--ink)",
    fontSize: 13.5, fontWeight: 700, cursor: "pointer",
  };
}
