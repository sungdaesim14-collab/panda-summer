import type { ReactNode } from "react";
import { Char } from "./Char";

/** 판다 사부가 말을 건다 */
export function Sabu({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ width: 52, flexShrink: 0, marginTop: -4 }}>
        <Char charKey="panda" grade={4} anim noGround />
      </span>
      <div
        style={{
          flex: 1,
          background: "var(--surface)",
          border: "1px solid var(--edge)",
          borderRadius: "4px 14px 14px 14px",
          padding: "11px 13px",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </div>
  );
}
