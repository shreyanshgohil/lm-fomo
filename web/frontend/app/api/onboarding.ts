export type OnboardingStatus = {
  completed: boolean;
  themeEditorUrl: string;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : "Request failed. Please try again.";
    throw new Error(message);
  }
  return data as T;
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatus> {
  const response = await fetch("/api/onboarding");
  return parseJsonResponse<OnboardingStatus>(response);
}

export async function completeOnboarding(): Promise<{ completed: boolean }> {
  const response = await fetch("/api/onboarding/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return parseJsonResponse<{ completed: boolean }>(response);
}
