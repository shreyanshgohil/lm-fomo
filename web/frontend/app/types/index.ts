export type NavItemId = "dashboard" | "widget-settings";

export interface NavItem {
  id: NavItemId;
  label: string;
  url: string;
}

export interface StatMetric {
  id: string;
  label: string;
  value: string;
  trend?: string;
  tone?: "success" | "critical" | "caution" | "info";
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "info" | "warning";
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  primary?: boolean;
}

export type FomoMode = "last_24_hours" | "total_sold" | "hybrid_randomized";

export interface WidgetSettingsState {
  enabled: boolean;
  fomoMode: FomoMode;
  customText: string;
  showEmoji: boolean;
  animationEnabled: boolean;
  accentColor: string;
  desktopVisible: boolean;
}
