import { useState } from "react";
import { sound, haptic, fx } from "../game/feedback";

/** 소리·진동 켜고 끄기 — 헤더 구석에 작게 */
export function FxToggle() {
  const [snd, setSnd] = useState(sound.on());
  const [hap, setHap] = useState(haptic.on());

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button
        onClick={() => { const v = !snd; sound.set(v); setSnd(v); if (v) fx.tap(); }}
        aria-pressed={snd}
        aria-label={snd ? "소리 끄기" : "소리 켜기"}
        title={snd ? "소리 켜짐" : "소리 꺼짐"}
        style={btn(snd)}
      >
        {snd ? "🔊" : "🔇"}
      </button>
      <button
        onClick={() => { const v = !hap; haptic.set(v); setHap(v); if (v) fx.tap(); }}
        aria-pressed={hap}
        aria-label={hap ? "진동 끄기" : "진동 켜기"}
        title={hap ? "진동 켜짐" : "진동 꺼짐"}
        style={btn(hap)}
      >
        📳
      </button>
    </div>
  );
}

function btn(on: boolean): React.CSSProperties {
  return {
    width: 32, height: 32, borderRadius: 8, cursor: "pointer",
    border: `1px solid ${on ? "var(--edge)" : "var(--edge)"}`,
    background: "transparent", fontSize: 15,
    opacity: on ? 1 : 0.4, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}
