import { useMemo } from "react";
import {
  BlockStack,
  Box,
  InlineStack,
  Tabs,
  Text,
} from "@shopify/polaris";
import { localeOptions } from "../../data/mock/widgetSettings";
import type { FomoMode, WidgetSettingsState } from "../../types";
import { getMessageForLocale } from "../../utils/messageTranslations";
import { applyCountToMessage } from "../../utils/richTextMessage";
import "./RichTextMessageEditor.css";
import { LiveActivityDot } from "./LiveActivityDot";

interface PreviewWidgetProps {
  settings: Pick<
    WidgetSettingsState,
    | "messageTranslations"
    | "previewLocale"
    | "pulseColor"
    | "backgroundColor"
    | "borderEnabled"
    | "borderColor"
    | "borderRadius"
    | "fomoMode"
    | "productScope"
    | "selectedProducts"
    | "hybridMin"
    | "hybridMax"
    | "hybridTtl"
  >;
  onPreviewLocaleChange: (locale: string) => void;
}

function getLocaleLabel(locale: string): string {
  return localeOptions.find((opt) => opt.value === locale)?.label ?? locale;
}

function formatTtl(minutes: number): string {
  if (minutes % 60 === 0 && minutes >= 60) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function resolvePreviewCount(
  fomoMode: FomoMode,
  hybridMin: number,
  hybridMax: number,
): string {
  if (fomoMode === "total_sold") return "847";
  if (fomoMode === "hybrid_randomized") {
    const low = Math.min(hybridMin, hybridMax);
    const high = Math.max(hybridMin, hybridMax);
    return String(Math.floor((low + high) / 2));
  }
  return "12";
}

function resolvePreviewHtml(
  template: string,
  fomoMode: FomoMode,
  hybridMin: number,
  hybridMax: number,
): string {
  const count = resolvePreviewCount(fomoMode, hybridMin, hybridMax);
  return applyCountToMessage(template, count);
}

export function PreviewWidget({
  settings,
  onPreviewLocaleChange,
}: PreviewWidgetProps) {
  const { messageTranslations, previewLocale } = settings;

  const selectedTabIndex = useMemo(() => {
    const index = messageTranslations.findIndex(
      (entry) => entry.locale === previewLocale,
    );
    return index >= 0 ? index : 0;
  }, [messageTranslations, previewLocale]);

  const previewTabs = useMemo(
    () =>
      messageTranslations.map((entry) => ({
        id: entry.locale,
        content: getLocaleLabel(entry.locale),
        panelID: `preview-panel-${entry.locale}`,
      })),
    [messageTranslations],
  );

  const template = getMessageForLocale(messageTranslations, previewLocale);
  const messageHtml = resolvePreviewHtml(
    template,
    settings.fomoMode,
    settings.hybridMin,
    settings.hybridMax,
  );

  const hybridRangeLabel =
    settings.fomoMode === "hybrid_randomized"
      ? `Randomizes between ${Math.min(settings.hybridMin, settings.hybridMax)} and ${Math.max(settings.hybridMin, settings.hybridMax)} · refreshes every ${formatTtl(settings.hybridTtl)}`
      : null;

  return (
    <BlockStack gap="400">
      {previewTabs.length > 1 && (
        <Tabs
          tabs={previewTabs}
          selected={selectedTabIndex}
          onSelect={(index) =>
            onPreviewLocaleChange(messageTranslations[index].locale)
          }
          fitted
        />
      )}

      <Box
        background="bg-surface-secondary"
        borderColor="border"
        borderWidth="025"
        borderRadius="300"
        padding="600"
        minHeight="200px"
      >
        <BlockStack gap="300" inlineAlign="center">
          <BlockStack gap="100" inlineAlign="center">
            <Text as="p" variant="bodySm" tone="subdued">
              Live preview
              {previewTabs.length === 1 &&
                ` · ${getLocaleLabel(previewLocale)}`}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {settings.productScope === "all_products"
                ? "Shown on all product pages"
                : settings.selectedProducts.length > 0
                  ? `Shown on ${settings.selectedProducts.length} selected product${settings.selectedProducts.length === 1 ? "" : "s"}`
                  : "No products selected yet"}
            </Text>
            {hybridRangeLabel && (
              <Text as="p" variant="bodySm" tone="subdued">
                {hybridRangeLabel}
              </Text>
            )}
          </BlockStack>
          <Box
            padding="300"
            borderRadius="200"
            minWidth="280px"
            style={{
              backgroundColor: settings.backgroundColor,
              borderRadius: `${settings.borderRadius}px`,
              ...(settings.borderEnabled
                ? {
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: settings.borderColor,
                  }
                : { border: "none" }),
            }}
          >
            <InlineStack gap="200" blockAlign="center" wrap={false}>
              <LiveActivityDot color={settings.pulseColor} />
              <span
                className="fomo-message-html"
                dangerouslySetInnerHTML={{ __html: messageHtml }}
              />
            </InlineStack>
          </Box>
        </BlockStack>
      </Box>
    </BlockStack>
  );
}
