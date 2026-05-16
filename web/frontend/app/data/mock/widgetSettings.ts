import type { WidgetSettingsState } from "../../types";

export const defaultWidgetSettings: WidgetSettingsState = {
  enabled: true,
  fomoMode: "last_24_hours",
  customText: "{{count}} people bought this in the last 24 hours",
  showEmoji: true,
  animationEnabled: true,
  accentColor: "#008060",
  desktopVisible: true,
};

export const fomoModeOptions = [
  { label: "Last 24 hours", value: "last_24_hours" },
  { label: "Total sold", value: "total_sold" },
  { label: "Hybrid randomized", value: "hybrid_randomized" },
] as const;

export const accentColors = [
  "#008060",
  "#2C6ECB",
  "#B98900",
  "#D82C0D",
  "#5C5F62",
  "#9C6ADE",
];
