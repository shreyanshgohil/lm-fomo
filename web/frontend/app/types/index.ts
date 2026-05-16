export type FomoMode = "last_24_hours" | "total_sold" | "hybrid_randomized";

export type ProductScope = "all_products" | "selected_products";

export interface SelectedProduct {
  id: string;
  title: string;
  imageUrl?: string;
  handle?: string;
}

export interface WidgetSettingsState {
  fomoMode: FomoMode;
  customText: string;
  accentColor: string;
  productScope: ProductScope;
  selectedProducts: SelectedProduct[];
  hybridMin: number;
  hybridMax: number;
  /** Minutes before the randomized count refreshes */
  hybridTtl: number;
}
