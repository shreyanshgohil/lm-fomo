import { BlockStack, Box, Text } from "@shopify/polaris";
import type { StatMetric } from "../../types";

interface StatsCardProps {
  metric: StatMetric;
}

export function StatsCard({ metric }: StatsCardProps) {
  return (
    <Box
      background="bg-surface"
      borderColor="border"
      borderWidth="025"
      borderRadius="300"
      padding="500"
      minHeight="120px"
    >
      <BlockStack gap="300">
        <Text as="p" variant="bodySm" tone="subdued">
          {metric.label}
        </Text>
        <Text as="p" variant="headingXl" fontWeight="semibold">
          {metric.value}
        </Text>
        {metric.trend && (
          <Text as="p" variant="bodySm" tone="subdued">
            {metric.trend}
          </Text>
        )}
      </BlockStack>
    </Box>
  );
}
