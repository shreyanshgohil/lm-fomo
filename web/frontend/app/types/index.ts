export type FomoMode = "last_24_hours" | "total_sold" | "hybrid_randomized";

export type ProductScope = "all_products" | "selected_products";

export interface SelectedProduct {
  id: string;
  title: string;
  imageUrl?: string;
  handle?: string;
}

export interface MessageTranslation {
  locale: string;
  text: string;
}

export interface WidgetSettingsState {
  fomoMode: FomoMode;
  messageTranslations: MessageTranslation[];
  /** Locale shown in the admin preview */
  previewLocale: string;
  pulseColor: string;
  productScope: ProductScope;
  selectedProducts: SelectedProduct[];
  hybridMin: number;
  hybridMax: number;
  /** Minutes before the randomized count refreshes */
  hybridTtl: number;
}
