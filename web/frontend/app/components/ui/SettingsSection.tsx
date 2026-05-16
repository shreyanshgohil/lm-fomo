import { BlockStack, Box, Divider, Text } from "@shopify/polaris";
import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <Box paddingBlockEnd="400">
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text as="h3" variant="headingSm">
            {title}
          </Text>
          {description && (
            <Text as="p" variant="bodySm" tone="subdued">
              {description}
            </Text>
          )}
        </BlockStack>
        {children}
        <Divider />
      </BlockStack>
    </Box>
  );
}
