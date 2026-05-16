import type { ReactNode } from "react";

interface AppFrameProps {
  children: ReactNode;
}

export function AppFrame({ children }: AppFrameProps) {
  return <>{children}</>;
}
