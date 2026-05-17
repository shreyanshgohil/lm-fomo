import type { WidgetSettingsState } from "../types";

/** Settings persisted to the backend (excludes admin-only preview UI state). */
export type PersistableWidgetSettings = Omit<
  WidgetSettingsState,
  "previewLocale"
>;

export function toPersistableSettings(
  settings: WidgetSettingsState,
): PersistableWidgetSettings {
  const { previewLocale: _previewLocale, ...persistable } = settings;
  return persistable;
}

export function validateWidgetSettings(
  settings: WidgetSettingsState,
): string | null {
  if (
    settings.productScope === "selected_products" &&
    settings.selectedProducts.length === 0
  ) {
    return "Select at least one product, or switch to all products.";
  }

  if (settings.hybridMin > settings.hybridMax) {
    return "Hybrid minimum must be less than or equal to maximum.";
  }

  if (settings.messageTranslations.length === 0) {
    return "Add at least one message translation.";
  }

  const emptyMessage = settings.messageTranslations.find(
    (entry) => !entry.text.trim(),
  );
  if (emptyMessage) {
    return "Each language needs message text.";
  }

  return null;
}

export function settingsAreEqual(
  a: WidgetSettingsState,
  b: WidgetSettingsState,
): boolean {
  return (
    JSON.stringify(toPersistableSettings(a)) ===
    JSON.stringify(toPersistableSettings(b))
  );
}
