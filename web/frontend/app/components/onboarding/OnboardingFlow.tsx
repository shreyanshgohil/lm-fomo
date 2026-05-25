import { useCallback, useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  InlineStack,
  List,
  Text,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation } from "react-query";
import { PageContainer } from "../layout";
import { SectionCard } from "../ui";
import { APP_NAME } from "../../constants/navigation";
import { FOMO_THEME_BLOCK_NAME } from "../../constants/onboarding";
import { completeOnboarding } from "../../api/onboarding";

type OnboardingStep = "welcome" | "theme";

interface OnboardingFlowProps {
  themeEditorUrl: string;
  onComplete: () => void;
}

export function OnboardingFlow({
  themeEditorUrl,
  onComplete,
}: OnboardingFlowProps) {
  const shopify = useAppBridge();
  const [step, setStep] = useState<OnboardingStep>("welcome");

  const completeMutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      shopify.toast.show("You're all set");
      onComplete();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not finish onboarding";
      shopify.toast.show(message, { isError: true });
    },
  });

  const openThemeEditor = useCallback(() => {
    window.open(themeEditorUrl, "_top");
  }, [themeEditorUrl]);

  const handleFinish = useCallback(() => {
    completeMutation.mutate();
  }, [completeMutation]);

  if (step === "welcome") {
    return (
      <PageContainer
        title={`Welcome to ${APP_NAME}`}
        subtitle="Show real purchase activity on your product pages"
      >
        <Box maxWidth="720px">
          <SectionCard>
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">
                  {APP_NAME} adds a live social-proof message to product pages
                  so shoppers see how many people recently bought an item.
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  You can customize the message, colors, and which products show
                  the widget from settings after setup.
                </Text>
              </BlockStack>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    What you get
                  </Text>
                  <List type="bullet">
                    <List.Item>Last 24 hours, total sold, or hybrid counts</List.Item>
                    <List.Item>Translations for each storefront language</List.Item>
                    <List.Item>Custom pulse, background, and border styling</List.Item>
                    <List.Item>All-products or selected-products visibility</List.Item>
                  </List>
                </BlockStack>
              </Card>

              <InlineStack align="end">
                <Button variant="primary" onClick={() => setStep("theme")}>
                  Get started
                </Button>
              </InlineStack>
            </BlockStack>
          </SectionCard>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Add Fomo to your theme"
      subtitle="Enable the theme extension and add the block to your product page"
    >
      <Box maxWidth="720px">
        <BlockStack gap="400">
          <SectionCard>
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                The Fomo widget is delivered as a theme app extension. You will
                open the product template in the theme editor, then add the{" "}
                <Text as="span" fontWeight="semibold">
                  {FOMO_THEME_BLOCK_NAME}
                </Text>{" "}
                section where you want it to appear.
              </Text>

              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">
                    Setup steps
                  </Text>
                  <List type="number">
                    <List.Item>
                      Click <Text as="span" fontWeight="semibold">Open product template</Text>{" "}
                      to launch the theme editor on your product page.
                    </List.Item>
                    <List.Item>
                      In the left sidebar, open <Text as="span" fontWeight="semibold">Apps</Text>{" "}
                      and find <Text as="span" fontWeight="semibold">{FOMO_THEME_BLOCK_NAME}</Text>.
                    </List.Item>
                    <List.Item>
                      Add the <Text as="span" fontWeight="semibold">{FOMO_THEME_BLOCK_NAME}</Text>{" "}
                      section to the product template (for example, below the product title or
                      near the buy button).
                    </List.Item>
                    <List.Item>
                      Save the theme, then return here and continue to widget settings.
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>

              <BannerNote />

              <InlineStack gap="200" align="space-between" blockAlign="center" wrap>
                <Button onClick={() => setStep("welcome")}>Back</Button>
                <InlineStack gap="200">
                  <Button onClick={openThemeEditor}>
                    Open product template
                  </Button>
                  <Button
                    variant="primary"
                    loading={completeMutation.isLoading}
                    onClick={handleFinish}
                  >
                    Continue to settings
                  </Button>
                </InlineStack>
              </InlineStack>
            </BlockStack>
          </SectionCard>
        </BlockStack>
      </Box>
    </PageContainer>
  );
}

function BannerNote() {
  return (
    <Box
      padding="300"
      background="bg-surface-secondary"
      borderRadius="200"
    >
      <Text as="p" variant="bodySm" tone="subdued">
        If the theme editor opens blank, refresh the page once. After adding the
        section, click <Text as="span" fontWeight="semibold">Save</Text> in the
        theme editor before continuing.
      </Text>
    </Box>
  );
}
