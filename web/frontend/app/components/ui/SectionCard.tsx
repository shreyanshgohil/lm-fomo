import { BlockStack, Box, Text } from "@shopify/polaris";
import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
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
  const hasHeader = title || description || action;

  return (
    <Box
      background="bg-surface"
      borderColor="border"
      borderWidth="025"
      borderRadius="300"
      padding="500"
    >
      <BlockStack gap="400">
        {hasHeader && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <BlockStack gap="100">
              {title && (
                <Text as="h2" variant="headingMd">
                  {title}
                </Text>
              )}
              {description && (
                <Text as="p" variant="bodySm" tone="subdued">
                  {description}
                </Text>
              )}
            </BlockStack>
            {action}
          </div>
        )}
        {children}
      </BlockStack>
    </Box>
  );
}
