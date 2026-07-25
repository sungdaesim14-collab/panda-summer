/**
 * 한국어 조사 도우미
 *
 * 아이가 적은 문장을 그대로 사부의 말에 끼워 넣기 때문에
 * "'유튜브 보고 싶어져'이었지" 같은 어색한 문장이 나오기 쉽다.
 * 받침 유무를 보고 알맞은 조사를 붙인다.
 */

/** 마지막 글자에 받침이 있는지 */
export function hasBatchim(word: string): boolean {
  const t = word.trim();
  if (!t) return false;
  const code = t.charCodeAt(t.length - 1);
  // 한글 완성형 범위가 아니면(숫자·영문·이모지 등) 받침 없는 것으로 본다
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

/** josa("유튜브", "은", "는") → "유튜브는" */
export function josa(word: string, withBatchim: string, withoutBatchim: string): string {
  return word + (hasBatchim(word) ? withBatchim : withoutBatchim);
}

export const eunNeun = (w: string) => josa(w, "은", "는");
export const iGa = (w: string) => josa(w, "이", "가");
export const eulReul = (w: string) => josa(w, "을", "를");
export const gwaWa = (w: string) => josa(w, "과", "와");
/** 서술: "~이었다 / ~였다" */
export const ieossda = (w: string) => josa(w, "이었", "였");
