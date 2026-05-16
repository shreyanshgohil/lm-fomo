import { Badge } from "@shopify/polaris";

type BadgeTone =
  | "success"
  | "info"
  | "warning"
  | "critical"
  | "attention"
  | "enabled"
  | "new";

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function StatusBadge({ label, tone = "info" }: StatusBadgeProps) {
  return <Badge tone={tone}>{label}</Badge>;
}
