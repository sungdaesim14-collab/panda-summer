import { useMemo } from "react";
import { drawChar, type DrawOpts } from "../art/drawChar";
import type { CharKey } from "../art/chars";

interface Props extends DrawOpts {
  charKey: CharKey;
  grade: number;
  /** 픽셀 너비. 없으면 부모 너비를 채운다 */
  size?: number;
  className?: string;
}

/**
 * 캐릭터를 화면에 그린다.
 * SVG 문자열은 전부 코드가 만든 것이라 외부 입력이 섞이지 않는다.
 */
export function Char({ charKey, grade, size, className, ...opts }: Props) {
  const svg = useMemo(
    () => drawChar(charKey, grade, opts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [charKey, grade, opts.anim, opts.noGround, opts.label]
  );

  return (
    <span
      className={className}
      style={{ display: "inline-block", width: size ? `${size}px` : "100%", lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
