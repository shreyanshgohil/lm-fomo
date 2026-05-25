import { useCallback, useState } from "react";
import { Banner, BlockStack, Page, Spinner } from "@shopify/polaris";
import { useQuery, useQueryClient } from "react-query";
import { OnboardingFlow } from "../app/components/onboarding";
import { WidgetSettingsPage } from "../app/pages/WidgetSettingsPage";
import { fetchOnboardingStatus } from "../app/api/onboarding";

export default function HomePage() {
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);

  const {
    data: onboarding,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["onboarding"],
    queryFn: fetchOnboardingStatus,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const handleOnboardingComplete = useCallback(() => {
    queryClient.setQueryData(["onboarding"], {
      completed: true,
      themeEditorUrl: onboarding?.themeEditorUrl ?? "",
    });
    setShowSettings(true);
  }, [onboarding?.themeEditorUrl, queryClient]);

  if (isLoading) {
    return (
      <Page narrowWidth title="Loading">
        <BlockStack inlineAlign="center">
          <Spinner accessibilityLabel="Loading onboarding" size="large" />
        </BlockStack>
      </Page>
    );
  }

  if (isError) {
    return (
      <Banner
        tone="critical"
        action={{ content: "Retry", onAction: () => refetch() }}
      >
        {error instanceof Error
          ? error.message
          : "Could not load onboarding status."}
      </Banner>
    );
  }

  const onboardingComplete = onboarding?.completed ?? false;

  if (!onboardingComplete && !showSettings) {
    return (
      <OnboardingFlow
        themeEditorUrl={onboarding?.themeEditorUrl ?? ""}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return <WidgetSettingsPage />;
}
