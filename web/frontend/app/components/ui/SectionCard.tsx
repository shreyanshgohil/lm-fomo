import { BlockStack, Box, Text } from "@shopify/polaris";
import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function SectionCard({
  title,
  description,
  children,
  action,
}: SectionCardProps) {
  return (
    <Box
      background="bg-surface"
      borderColor="border"
      borderWidth="025"
      borderRadius="300"
      padding="500"
    >
      <BlockStack gap="400">
        <BlockStack gap="100">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">
                {title}
              </Text>
              {description && (
                <Text as="p" variant="bodySm" tone="subdued">
                  {description}
                </Text>
              )}
            </BlockStack>
            {action}
          </div>
        </BlockStack>
        {children}
      </BlockStack>
    </Box>
  );
}
