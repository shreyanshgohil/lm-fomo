import { BlockStack, Box, InlineStack, Text } from "@shopify/polaris";
import type { FomoMode, WidgetSettingsState } from "../../types";

interface PreviewWidgetProps {
  settings: Pick<WidgetSettingsState, "customText" | "accentColor" | "fomoMode">;
}

function resolvePreviewMessage(
  customText: string,
  fomoMode: FomoMode,
): string {
  const count = fomoMode === "total_sold" ? "847" : "12";
  return customText.replace(/\{\{count\}\}/g, count);
}

export function PreviewWidget({ settings }: PreviewWidgetProps) {
  const message = resolvePreviewMessage(
    settings.customText,
    settings.fomoMode,
  );

  return (
    <Box
      background="bg-surface-secondary"
      borderColor="border"
      borderWidth="025"
      borderRadius="300"
      padding="600"
      minHeight="200px"
    >
      <BlockStack gap="300" inlineAlign="center">
        <Text as="p" variant="bodySm" tone="subdued">
          Live preview
        </Text>
        <Box
          padding="300"
          borderRadius="200"
          minWidth="280px"
          background="bg-surface"
        >
          <InlineStack gap="200" blockAlign="center">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: settings.accentColor,
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            <Text as="p" variant="bodyMd" fontWeight="medium">
              {message}
            </Text>
          </InlineStack>
        </Box>
      </BlockStack>
    </Box>
  );
}
