export type FomoMode = "last_24_hours" | "total_sold" | "hybrid_randomized";

export interface WidgetSettingsState {
  fomoMode: FomoMode;
  customText: string;
  accentColor: string;
}
