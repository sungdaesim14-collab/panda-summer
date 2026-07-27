import { useEffect, useState } from "react";

/**
 * 홈 화면에 바로가기(앱 아이콘) 추가 버튼
 *
 *  - 안드로이드 크롬 등: beforeinstallprompt 이벤트로 네이티브 설치창을 띄운다.
 *  - 아이폰 사파리: 그 이벤트가 없으므로 "공유 → 홈 화면에 추가" 방법을 안내한다.
 *  - 이미 설치(홈 화면에서 실행 중)면 버튼을 숨긴다.
 */

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

let deferredPrompt: BIPEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BIPEvent;
  });
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function InstallButton({ subtle }: { subtle?: boolean }) {
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  if (installed) return null; // 이미 홈 화면 앱으로 실행 중

  const onClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    } else {
      // iOS 등 자동 설치가 안 되는 경우 → 방법 안내
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button onClick={onClick} style={subtle ? subtleBtn : mainBtn}>
        📲 홈 화면에 바로가기 만들기
      </button>

      {showIOSGuide && (
        <div style={overlay} onClick={() => setShowIOSGuide(false)}>
          <div style={sheet} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 30 }}>📲</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>홈 화면에 추가하기</div>
            {isIOS() ? (
              <ol style={guideList}>
                <li>아래 <b>공유 버튼</b> <span style={{ fontSize: 17 }}>􀈂</span> (네모+화살표)을 누르세요</li>
                <li><b>"홈 화면에 추가"</b>를 고르세요</li>
                <li><b>"추가"</b>를 누르면 끝!</li>
              </ol>
            ) : (
              <ol style={guideList}>
                <li>브라우저 <b>메뉴(⋮)</b>를 누르세요</li>
                <li><b>"홈 화면에 추가"</b> 또는 <b>"앱 설치"</b>를 고르세요</li>
                <li>확인을 누르면 끝!</li>
              </ol>
            )}
            <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.6 }}>
              그러면 판다 사부가 <b>홈 화면 아이콘</b>이 되어, 앱처럼 바로 열려요.
            </p>
            <button onClick={() => setShowIOSGuide(false)} style={mainBtn}>알겠어요</button>
          </div>
        </div>
      )}
    </>
  );
}

const mainBtn: React.CSSProperties = {
  width: "100%", padding: "13px", borderRadius: "var(--r-md)", border: "1px solid var(--edge)",
  background: "var(--surface)", color: "var(--ink)", fontSize: 14, fontWeight: 700, cursor: "pointer",
};
const subtleBtn: React.CSSProperties = {
  width: "100%", padding: "11px", borderRadius: "var(--r-md)", border: "1px solid var(--edge)",
  background: "transparent", color: "var(--ink-2)", fontSize: 13, fontWeight: 700, cursor: "pointer",
};
const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 70, background: "rgba(10,13,10,0.7)",
  display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0,
};
const sheet: React.CSSProperties = {
  width: "100%", maxWidth: 460, background: "var(--surface)",
  borderRadius: "var(--r-lg) var(--r-lg) 0 0", border: "1px solid var(--edge)",
  padding: "24px 22px calc(24px + env(safe-area-inset-bottom))",
  display: "flex", flexDirection: "column", gap: 12, textAlign: "center",
};
const guideList: React.CSSProperties = {
  textAlign: "left", fontSize: 14, lineHeight: 1.9, color: "var(--ink)", margin: 0, paddingLeft: 20,
};
