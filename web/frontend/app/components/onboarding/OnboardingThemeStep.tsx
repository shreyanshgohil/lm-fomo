import {
  Banner,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Icon,
  InlineStack,
  Text,
} from "@shopify/polaris";
import {
  AppsIcon,
  SaveIcon,
  ThemeEditIcon,
} from "@shopify/polaris-icons";
import { FOMO_THEME_BLOCK_NAME } from "../../constants/onboarding";
import { OnboardingLayout } from "./OnboardingLayout";

interface OnboardingThemeStepProps {
  onBack: () => void;
  onOpenThemeEditor: () => void;
  onComplete: () => void;
  isCompleting: boolean;
}

const SETUP_STEPS = [
  {
    icon: ThemeEditIcon,
    title: "Open the product template",
    description:
      'Click "Open product template" to launch the theme editor on your product page.',
  },
  {
    icon: AppsIcon,
    title: "Find the Fomo block",
    description: `In the left sidebar, open Apps and select ${FOMO_THEME_BLOCK_NAME}.`,
  },
  {
    icon: SaveIcon,
    title: "Add the section and save",
    description: `Place the ${FOMO_THEME_BLOCK_NAME} section on the template (for example, below the title or near the buy button), then save your theme.`,
  },
] as const;

export function OnboardingThemeStep({
  onBack,
  onOpenThemeEditor,
  onComplete,
  isCompleting,
}: OnboardingThemeStepProps) {
  return (
    <OnboardingLayout
      stepIndex={1}
      title="Add Fomo to your theme"
      subtitle="Enable the theme extension on your product page"
      footer={
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <Button onClick={onBack}>Back</Button>
          <ButtonGroup>
            <Button icon={ThemeEditIcon} onClick={onOpenThemeEditor}>
              Open product template
            </Button>
            <Button
              variant="primary"
              loading={isCompleting}
              onClick={onComplete}
            >
              Continue to settings
            </Button>
          </ButtonGroup>
        </InlineStack>
      }
    >
      <BlockStack gap="500">
        <Banner tone="info">
          <Text as="p" variant="bodyMd">
            The widget is delivered as a theme app extension. You only need to
            add it once on your product template.
          </Text>
        </Banner>

        <BlockStack gap="400">
          <Text as="h3" variant="headingSm">
            Setup guide
          </Text>
          <BlockStack gap="0">
            {SETUP_STEPS.map((step, index) => (
              <SetupGuideRow
                key={step.title}
                stepNumber={index + 1}
                icon={step.icon}
                title={step.title}
                description={step.description}
                isLast={index === SETUP_STEPS.length - 1}
              />
            ))}
          </BlockStack>
        </BlockStack>

        <Banner tone="warning">
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Theme editor tip
            </Text>
            <Text as="p" variant="bodySm">
              If the editor opens blank, refresh the page once. After adding the
              section, click Save in the theme editor before continuing here.
            </Text>
          </BlockStack>
        </Banner>
      </BlockStack>
    </OnboardingLayout>
  );
}

function SetupGuideRow({
  stepNumber,
  icon,
  title,
  description,
  isLast,
}: {
  stepNumber: number;
  icon: typeof ThemeEditIcon;
  title: string;
  description: string;
  isLast: boolean;
}) {
  return (
    <InlineStack gap="400" wrap={false} blockAlign="start">
      <BlockStack gap="0" inlineAlign="center">
        <Box
          background="bg-fill-brand"
          borderRadius="full"
          minWidth="28px"
          minHeight="28px"
        >
          <div
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text as="span" variant="bodySm" fontWeight="semibold">
              {stepNumber}
            </Text>
          </div>
        </Box>
        {!isLast && (
          <Box
            minHeight="32px"
            borderInlineStartWidth="025"
            borderColor="border"
          />
        )}
      </BlockStack>

      <Box paddingBlockEnd={isLast ? "0" : "400"}>
        <InlineStack gap="300" wrap={false} blockAlign="start">
          <Box
            background="bg-surface-secondary"
            borderRadius="200"
            padding="200"
          >
            <Icon source={icon} tone="base" />
          </Box>
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              {title}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {description}
            </Text>
          </BlockStack>
        </InlineStack>
      </Box>
    </InlineStack>
  );
}
