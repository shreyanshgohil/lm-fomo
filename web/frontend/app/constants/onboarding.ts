export const FOMO_THEME_BLOCK_NAME = "Fomo";

export const ONBOARDING_STEPS = [
  {
    id: "welcome",
    label: "Welcome",
    description: "Learn what LM Fomo does",
  },
  {
    id: "theme",
    label: "Add to theme",
    description: "Enable the storefront widget",
  },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"];
