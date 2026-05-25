import { useCallback, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation } from "react-query";
import type { OnboardingStepId } from "../../constants/onboarding";
import { completeOnboarding } from "../../api/onboarding";
import { OnboardingThemeStep } from "./OnboardingThemeStep";
import { OnboardingWelcomeStep } from "./OnboardingWelcomeStep";

interface OnboardingFlowProps {
  themeEditorUrl: string;
  onComplete: () => void;
}

export function OnboardingFlow({
  themeEditorUrl,
  onComplete,
}: OnboardingFlowProps) {
  const shopify = useAppBridge();
  const [step, setStep] = useState<OnboardingStepId>("welcome");

  const completeMutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      shopify.toast.show("Setup complete");
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

  if (step === "welcome") {
    return <OnboardingWelcomeStep onContinue={() => setStep("theme")} />;
  }

  return (
    <OnboardingThemeStep
      onBack={() => setStep("welcome")}
      onOpenThemeEditor={openThemeEditor}
      onComplete={() => completeMutation.mutate()}
      isCompleting={completeMutation.isLoading}
    />
  );
}
