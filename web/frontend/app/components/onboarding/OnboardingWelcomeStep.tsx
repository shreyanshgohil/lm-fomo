import {
  BlockStack,
  Box,
  Button,
  Icon,
  InlineGrid,
  InlineStack,
  Text,
} from "@shopify/polaris";
import {
  CartIcon,
  ChartVerticalIcon,
  LanguageIcon,
  PaintBrushFlatIcon,
  ProductIcon,
} from "@shopify/polaris-icons";
import { APP_NAME } from "../../constants/navigation";
import { OnboardingLayout } from "./OnboardingLayout";

interface OnboardingWelcomeStepProps {
  onContinue: () => void;
}

const FEATURES = [
  {
    icon: ChartVerticalIcon,
    title: "Flexible FOMO counts",
    description: "Last 24 hours, lifetime sales, or a randomized hybrid range.",
  },
  {
    icon: LanguageIcon,
    title: "Storefront translations",
    description: "Match your message to each language your store supports.",
  },
  {
    icon: PaintBrushFlatIcon,
    title: "On-brand styling",
    description: "Tune pulse, background, and border colors from the app.",
  },
  {
    icon: ProductIcon,
    title: "Product targeting",
    description: "Show on all products or only the items you choose.",
  },
] as const;

export function OnboardingWelcomeStep({ onContinue }: OnboardingWelcomeStepProps) {
  return (
    <OnboardingLayout
      stepIndex={0}
      title={`Welcome to ${APP_NAME}`}
      subtitle="Show real purchase activity on your product pages"
      footer={
        <InlineStack align="end">
          <Button variant="primary" size="large" onClick={onContinue}>
            Get started
          </Button>
        </InlineStack>
      }
    >
      <InlineGrid columns={{ xs: 1, md: ["oneThird", "twoThirds"] }} gap="500">
        <Box
          background="bg-surface-success"
          borderRadius="300"
          padding="600"
        >
          <BlockStack gap="300" inlineAlign="center">
            <Box
              background="bg-fill-success"
              borderRadius="full"
              padding="300"
            >
              <Icon source={CartIcon} tone="base" />
            </Box>
            <Text as="p" variant="bodySm" alignment="center" tone="subdued">
              Social proof that updates from your order data
            </Text>
          </BlockStack>
        </Box>

        <BlockStack gap="400">
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              {APP_NAME} adds a live message on product pages so shoppers see
              how many people recently bought an item.
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Setup takes about two minutes. You will add the widget to your
              theme, then customize copy and styling in settings.
            </Text>
          </BlockStack>

          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">
              What you get
            </Text>
            <BlockStack gap="300">
              {FEATURES.map((feature) => (
                <InlineStack
                  key={feature.title}
                  gap="300"
                  wrap={false}
                  blockAlign="start"
                >
                  <Box
                    background="bg-surface-secondary"
                    borderRadius="200"
                    padding="200"
                  >
                    <Icon source={feature.icon} tone="base" />
                  </Box>
                  <BlockStack gap="050">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {feature.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {feature.description}
                    </Text>
                  </BlockStack>
                </InlineStack>
              ))}
            </BlockStack>
          </BlockStack>
        </BlockStack>
      </InlineGrid>
    </OnboardingLayout>
  );
}
