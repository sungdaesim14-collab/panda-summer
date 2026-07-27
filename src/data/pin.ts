/**
 * PIN 해시
 *
 * 예전 앱은 아이들 비밀번호를 시트에 평문으로 저장했다(50명분이 그대로 보였다).
 * 여기서는 절대 평문을 저장하지 않는다. SHA-256으로 해시해서만 보관하고,
 * 로그인 때 입력값을 같은 방식으로 해시해 비교한다.
 *
 * 주의: 이건 '유출 시 원문 보호'용이지 강력한 인증은 아니다.
 * 초등학생 여름 습관 앱 규모에 맞는 수준이다. 진짜 보안이 필요하면
 * Supabase Auth로 옮긴다.
 */

const SALT = "panda-summer-2026::";

export async function hashPin(nickname: string, pin: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + nickname.trim() + "::" + pin.trim());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin.trim());
}

/**
 * 닉네임 규칙 — 아이들이 ♡ ★ 같은 특수기호나 이모지를 쓰고 싶어한다.
 * 그래서 최대한 관대하게 둔다: 길이만 제한하고, 화면을 실제로 깨뜨리는
 * '제어문자'만 막는다. 하트·별·이모지·따옴표 모두 허용(React·Supabase가 안전하게 처리).
 */
export function isValidNickname(nick: string): boolean {
  const t = nick.trim();
  // 이모지·기호도 한 글자로 세도록 코드포인트 기준 길이
  const len = [...t].length;
  if (len < 2 || len > 12) return false;
  // 보이지 않는 제어문자만 금지
  for (const ch of t) {
    const code = ch.codePointAt(0)!;
    if (code < 0x20 || code === 0x7f) return false;
  }
  return true;
}
