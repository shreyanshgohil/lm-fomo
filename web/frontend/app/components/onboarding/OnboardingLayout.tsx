import {
  BlockStack,
  Box,
  Page,
  ProgressBar,
  Text,
} from "@shopify/polaris";
import type { ReactNode } from "react";
import { ONBOARDING_STEPS } from "../../constants/onboarding";
import { OnboardingStepIndicator } from "./OnboardingStepIndicator";

interface OnboardingLayoutProps {
  stepIndex: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function OnboardingLayout({
  stepIndex,
  title,
  subtitle,
  children,
  footer,
}: OnboardingLayoutProps) {
  const progress =
    ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <Page narrowWidth title={title} subtitle={subtitle}>
      <BlockStack gap="500">
        <BlockStack gap="300">
          <Text as="p" variant="bodySm" tone="subdued">
            Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
          </Text>
          <ProgressBar progress={progress} size="small" tone="primary" />
          <OnboardingStepIndicator activeStepIndex={stepIndex} />
        </BlockStack>

        <Box
          background="bg-surface"
          borderWidth="025"
          borderColor="border"
          borderRadius="300"
          padding="500"
          shadow="100"
        >
          <BlockStack gap="500">
            {children}
            <Box
              paddingBlockStart="400"
              borderBlockStartWidth="025"
              borderColor="border"
            >
              {footer}
            </Box>
          </BlockStack>
        </Box>
      </BlockStack>
    </Page>
  );
}
