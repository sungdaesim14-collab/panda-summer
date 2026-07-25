import { useState } from "react";
import { Char } from "../components/Char";
import { isValidNickname, isValidPin } from "../data/pin";

interface Props {
  onLogin: (nick: string, pin: string) => Promise<{ ok: boolean; msg?: string }>;
  onRegister: (nick: string, pin: string) => Promise<{ ok: boolean; msg?: string }>;
}

export function LoginScreen({ onLogin, onRegister }: Props) {
  const [nick, setNick] = useState("");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async (mode: "login" | "register") => {
    if (!isValidNickname(nick)) return setMsg("이름은 2~10글자로 해주세요.");
    if (!isValidPin(pin)) return setMsg("비밀번호는 숫자 4자리예요.");
    setBusy(true); setMsg("");
    const res = mode === "login" ? await onLogin(nick, pin) : await onRegister(nick, pin);
    setBusy(false);
    if (!res.ok) setMsg(res.msg || "다시 시도해 주세요.");
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto", padding: "56px 24px", textAlign: "center" }}>
      <div style={{ width: 120, margin: "0 auto 8px" }}>
        <Char charKey="panda" grade={4} anim noGround />
      </div>
      <div style={{ fontSize: 11, letterSpacing: ".4em", color: "var(--kin)", fontWeight: 600, marginBottom: 6 }}>
        竹 の 剣 士
      </div>
      <h1 style={{ margin: "0 0 4px", fontSize: 24, letterSpacing: "-.03em" }}>판다 사부의 여름 수련</h1>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "var(--ink-2)" }}>
        내가 나에게 한 약속을 지키며 산을 오르자
      </p>

      <input
        value={nick}
        onChange={(e) => setNick(e.target.value)}
        placeholder="이름 (2~10글자)"
        maxLength={10}
        style={field}
      />
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        placeholder="비밀번호 (숫자 4자리)"
        inputMode="numeric"
        maxLength={4}
        style={field}
        onKeyDown={(e) => e.key === "Enter" && go("login")}
      />

      <div style={{ minHeight: 20, fontSize: 13, color: "var(--shu)", margin: "4px 0 14px" }}>{msg}</div>

      <button disabled={busy} onClick={() => go("login")} style={primary}>
        수련장 들어가기
      </button>
      <button disabled={busy} onClick={() => go("register")} style={secondary}>
        처음 왔어요 · 새 수련생 등록
      </button>

      <p style={{ marginTop: 22, fontSize: 11.5, color: "var(--ink-3)" }}>
        비밀번호는 이 기기에 안전하게 보관돼요 (평문으로 저장하지 않아요)
      </p>
    </div>
  );
}

const field: React.CSSProperties = {
  width: "100%", background: "var(--surface)", color: "var(--ink)",
  border: "1px solid var(--edge)", borderRadius: "var(--r-md)",
  padding: "13px 14px", fontSize: 16, fontFamily: "inherit", outline: "none",
  marginBottom: 10, textAlign: "center",
};
const primary: React.CSSProperties = {
  width: "100%", padding: "15px", borderRadius: "var(--r-md)", border: "none",
  background: "var(--kin)", color: "var(--on-kin)", fontSize: 15, fontWeight: 800, cursor: "pointer",
  marginBottom: 10,
};
const secondary: React.CSSProperties = {
  width: "100%", padding: "14px", borderRadius: "var(--r-md)",
  border: "1px solid var(--edge)", background: "transparent",
  color: "var(--ink)", fontSize: 14, fontWeight: 700, cursor: "pointer",
};
