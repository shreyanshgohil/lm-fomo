import type { CSSProperties } from "react";
import "./LiveActivityDot.css";

interface LiveActivityDotProps {
  color: string;
  size?: number;
}

export function LiveActivityDot({ color, size = 8 }: LiveActivityDotProps) {
  const style = {
    "--dot-color": color,
    "--dot-size": `${size}px`,
  } as CSSProperties;

  return (
    <span className="live-activity-dot" style={style} aria-hidden>
      <span className="live-activity-dot__pulse" />
      <span className="live-activity-dot__core" />
    </span>
  );
}
