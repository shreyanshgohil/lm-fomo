import {
  BlockStack,
  Button,
  InlineGrid,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../app/components/layout";
import {
  EmptyStateCard,
  SectionCard,
  StatsCard,
  StatusBadge,
} from "../app/components/ui";
import {
  dashboardStats,
  quickActions,
  recentActivity,
} from "../app/data/mock/dashboard";

const activityToneMap = {
  success: "success",
  info: "info",
  warning: "warning",
} as const;

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Overview of your FOMO widgets and storefront activity"
    >
      <InlineGrid columns={4} gap="400">
        {dashboardStats.map((metric) => (
          <StatsCard key={metric.id} metric={metric} />
        ))}
      </InlineGrid>

      <InlineGrid columns={2} gap="400">
        <SectionCard
          title="Recent activity"
          description="Latest events across your store"
        >
          <BlockStack gap="300">
            {recentActivity.map((item) => (
              <BoxedActivityRow
                key={item.id}
                title={item.title}
                description={item.description}
                timestamp={item.timestamp}
                tone={activityToneMap[item.status]}
              />
            ))}
          </BlockStack>
        </SectionCard>

        <SectionCard
          title="Quick actions"
          description="Common tasks to manage LM Fomo"
        >
          <BlockStack gap="300">
            {quickActions.map((action) => (
              <InlineStack
                key={action.id}
                align="space-between"
                blockAlign="center"
                gap="300"
              >
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {action.label}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {action.description}
                  </Text>
                </BlockStack>
                <Button
                  variant={action.primary ? "primary" : "secondary"}
                  onClick={() => navigate("/widget-settings")}
                >
                  Open
                </Button>
              </InlineStack>
            ))}
          </BlockStack>
        </SectionCard>
      </InlineGrid>

      <SectionCard title="Getting more from LM Fomo">
        <EmptyStateCard
          heading="No A/B tests yet"
          description="Run experiments on FOMO copy and display modes once you have steady traffic. This section uses mock data until you connect analytics."
          actionLabel="Configure widget"
          onAction={() => navigate("/widget-settings")}
        />
      </SectionCard>
    </PageContainer>
  );
}

function BoxedActivityRow({
  title,
  description,
  timestamp,
  tone,
}: {
  title: string;
  description: string;
  timestamp: string;
  tone: "success" | "info" | "warning";
}) {
  return (
    <div
      style={{
        padding: "12px 0",
        borderBottom: "1px solid var(--p-color-border-secondary)",
      }}
    >
      <InlineStack align="space-between" blockAlign="start" gap="200">
        <BlockStack gap="100">
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            {title}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {description}
          </Text>
        </BlockStack>
        <BlockStack gap="100" inlineAlign="end">
          <StatusBadge label={timestamp} tone={tone} />
        </BlockStack>
      </InlineStack>
    </div>
  );
}
