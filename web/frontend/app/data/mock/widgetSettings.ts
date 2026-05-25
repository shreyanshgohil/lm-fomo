import type { ProductScope, WidgetSettingsState } from "../../types";
import { DEFAULT_MESSAGE_TEMPLATE } from "../../utils/messageTranslations";

export const localeOptions = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Italian", value: "it" },
  { label: "Portuguese (Brazil)", value: "pt-BR" },
  { label: "Dutch", value: "nl" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese (Simplified)", value: "zh-CN" },
] as const;

export const messageTextColorPresets = [
  { label: "Default", value: "#202223" },
  { label: "Shopify green", value: "#008060" },
  { label: "Blue", value: "#2C6ECB" },
  { label: "Teal", value: "#00A0AC" },
  { label: "Gold", value: "#B98900" },
  { label: "Orange", value: "#E85D04" },
  { label: "Red", value: "#D82C0D" },
  { label: "Pink", value: "#E60096" },
  { label: "Purple", value: "#9C6ADE" },
  { label: "Indigo", value: "#5856D6" },
  { label: "Charcoal", value: "#5C5F62" },
  { label: "White", value: "#FFFFFF" },
] as const;

export const defaultWidgetSettings: WidgetSettingsState = {
  fomoMode: "last_24_hours",
  messageTranslations: [
    { locale: "en", text: DEFAULT_MESSAGE_TEMPLATE },
  ],
  previewLocale: "en",
  pulseColor: "#008060",
  backgroundColor: "#FFFFFF",
  borderEnabled: false,
  borderColor: "#E1E3E5",
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
