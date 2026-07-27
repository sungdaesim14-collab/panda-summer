/**
 * 새 버전 자동 감지
 *
 * 배포가 새로 되면 자산 파일명(index-XXXX.js)이 바뀐다.
 * 앱을 다시 볼 때마다(포커스) 현재 배포의 index.html을 확인해서,
 * 내가 로드한 JS와 최신 JS가 다르면 조용히 새로고침한다.
 *
 * → 아이가 옛 버전(예: 서버 연결 전 로컬 모드)에 갇히지 않는다.
 *   캐시 문제의 근본 해결.
 */

function loadedBundle(): string | null {
  const m = performance
    .getEntriesByType("resource")
    .map((e) => e.name)
    .map((n) => n.match(/assets\/index-[\w-]+\.js/)?.[0])
    .find(Boolean);
  return m ?? null;
}

async function latestBundle(): Promise<string | null> {
  try {
    const html = await fetch("/?_=" + Date.now(), { cache: "no-store" }).then((r) => r.text());
    return html.match(/assets\/index-[\w-]+\.js/)?.[0] ?? null;
  } catch {
    return null;
  }
}

let checking = false;

async function check() {
  if (checking) return;
  checking = true;
  try {
    const mine = loadedBundle();
    const latest = await latestBundle();
    if (mine && latest && mine !== latest) {
      // 새 버전 발견 → 새로고침. 로컬 우선 저장이라 데이터는 안전.
      location.reload();
    }
  } finally {
    checking = false;
  }
}

export function startAutoUpdate() {
  // 앱을 다시 볼 때(다른 앱에서 돌아올 때) 확인
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
  // 켜져 있는 동안에도 30분마다 한 번
  setInterval(check, 30 * 60 * 1000);
}
