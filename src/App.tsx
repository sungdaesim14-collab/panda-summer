import { useState } from "react";
import { Char } from "./components/Char";
import { CHAR_LIST, type CharKey } from "./art/chars";
import { BossScreen } from "./screens/BossScreen";
import { DexScreen } from "./screens/DexScreen";
import { TrainScreen } from "./screens/TrainScreen";
import { MountainScreen } from "./screens/MountainScreen";
import { RecordScreen } from "./screens/RecordScreen";
import { FriendsScreen } from "./screens/FriendsScreen";
import { KataScreen } from "./screens/KataScreen";
import { SudokuScreen } from "./screens/SudokuScreen";
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
  const [tab, setTab] = useState<"train" | "mountain" | "cards" | "kata" | "sudoku" | "friends" | "record" | "boss" | "lab">("train");
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
          ["train", "수련"], ["mountain", "약속의 산"], ["boss", "보스"], ["cards", "도감"],
          ["kata", "호흡법"], ["sudoku", "두뇌 수련"], ["friends", "동문"], ["record", "기록"], ["lab", "설정"],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k} style={pill(tab === k)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "train" && <TrainScreen data={data} onSaveLog={game.saveLog} />}
      {tab === "mountain" && <MountainScreen data={data} />}
      {tab === "cards" && <DexScreen data={data} />}
      {tab === "friends" && <FriendsScreen data={data} />}
      {tab === "record" && <RecordScreen data={data} onConfess={game.confess} />}
      {tab === "boss" && <BossScreen data={data} />}
      {tab === "kata" && <KataScreen data={data} />}
      {tab === "sudoku" && <SudokuScreen data={data} />}
      {tab === "lab" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 8px", maxWidth: 380, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ width: 84, display: "inline-block" }}>
              <Char charKey={(data.user.character || "panda") as CharKey} grade={gradeOf(total)} anim noGround />
            </span>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 6 }}>{data.user.nickname}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
              {CHAR_LIST.find((c) => c.key === data.user.character)?.name ?? ""} · 수련 {total}일
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", textAlign: "center", lineHeight: 1.7 }}>
            {hasServer()
              ? "친구와 함께 쓰는 중이에요 (서버 연결됨)."
              : "지금은 이 기기에만 저장돼요. 항상 같은 기기·브라우저로 들어와 주세요."}
          </div>
          <button onClick={game.logout} style={{ ...pill(false), padding: "12px 20px" }}>로그아웃</button>
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
