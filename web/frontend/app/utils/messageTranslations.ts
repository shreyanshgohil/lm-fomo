import type { MessageTranslation } from "../types";

export const DEFAULT_MESSAGE_TEMPLATE =
  "{{count}} people bought this in the last 24 hours";

export function getMessageForLocale(
  translations: MessageTranslation[],
  locale: string,
): string {
  return (
    translations.find((entry) => entry.locale === locale)?.text ??
    translations[0]?.text ??
    DEFAULT_MESSAGE_TEMPLATE
  );
}
