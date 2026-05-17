import type { ReactNode } from "react";

interface StickyColumnProps {
  children: ReactNode;
}

export function StickyColumn({ children }: StickyColumnProps) {
  return (
    <div
      style={{
        position: "sticky",
        top: "var(--p-space-400)",
        height: "max-content",
        alignSelf: "start",
      }}
    >
      {children}
    </div>
  );
}
