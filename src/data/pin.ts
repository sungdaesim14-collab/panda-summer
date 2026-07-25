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

export function isValidNickname(nick: string): boolean {
  const t = nick.trim();
  return t.length >= 2 && t.length <= 10;
}
