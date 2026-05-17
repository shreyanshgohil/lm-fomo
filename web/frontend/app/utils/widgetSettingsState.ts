import { defaultWidgetSettings } from "../data/mock/widgetSettings";
import type { WidgetSettingsState } from "../types";
import type { PersistableWidgetSettings } from "./widgetSettings";

export function toWidgetSettingsState(
  settings: PersistableWidgetSettings,
): WidgetSettingsState {
  const previewLocale =
    settings.messageTranslations[0]?.locale ??
    defaultWidgetSettings.previewLocale;

  return {
    ...defaultWidgetSettings,
    ...settings,
    previewLocale,
  };
}
