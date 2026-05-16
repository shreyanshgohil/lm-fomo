import type { ProductScope, WidgetSettingsState } from "../../types";

export const defaultWidgetSettings: WidgetSettingsState = {
  fomoMode: "last_24_hours",
  customText: "{{count}} people bought this in the last 24 hours",
  accentColor: "#008060",
  productScope: "all_products",
  selectedProducts: [],
  hybridMin: 5,
  hybridMax: 25,
  hybridTtl: 60,
};

export const productScopeOptions: {
  label: string;
  value: ProductScope;
  helpText?: string;
}[] = [
  {
    label: "All products",
    value: "all_products",
    helpText: "Show the widget on every product page",
  },
  {
    label: "Selected products only",
    value: "selected_products",
    helpText: "Choose which products display the widget",
  },
];

export const fomoModeOptions = [
  { label: "Last 24 hours", value: "last_24_hours" },
  { label: "Total sold", value: "total_sold" },
  {
    label: "Hybrid randomized",
    value: "hybrid_randomized",
    helpText: "Show a random count within your min–max range",
  },
] as const;
