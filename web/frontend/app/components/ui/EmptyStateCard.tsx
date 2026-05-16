import { BlockStack, Box, Button, Text } from "@shopify/polaris";

interface EmptyStateCardProps {
  heading: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyStateCard({
  heading,
  description,
  actionLabel,
  onAction,
}: EmptyStateCardProps) {
  return (
    <Box
      background="bg-surface-secondary"
      borderColor="border"
      borderWidth="025"
      borderRadius="300"
      padding="800"
    >
      <BlockStack gap="400" inlineAlign="center">
        <BlockStack gap="200" inlineAlign="center">
          <Text as="h3" variant="headingMd" alignment="center">
            {heading}
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
            {description}
          </Text>
        </BlockStack>
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </BlockStack>
    </Box>
  );
}
