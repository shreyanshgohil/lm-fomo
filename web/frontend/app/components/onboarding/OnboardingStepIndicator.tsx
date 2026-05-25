import { BlockStack, Box, InlineStack, Text } from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import { ONBOARDING_STEPS } from "../../constants/onboarding";

interface OnboardingStepIndicatorProps {
  activeStepIndex: number;
}

export function OnboardingStepIndicator({
  activeStepIndex,
}: OnboardingStepIndicatorProps) {
  return (
    <Box
      padding="400"
      background="bg-surface-secondary"
      borderRadius="300"
    >
      <InlineStack gap="300" wrap={false} blockAlign="center">
        {ONBOARDING_STEPS.map((step, index) => {
          const isComplete = index < activeStepIndex;
          const isActive = index === activeStepIndex;
          const isUpcoming = index > activeStepIndex;

          return (
            <InlineStack
              key={step.id}
              gap="300"
              wrap={false}
              blockAlign="center"
            >
              {index > 0 && (
                <Box
                  minWidth="24px"
                  borderBlockEndWidth="025"
                  borderColor={
                    isComplete || isActive ? "border-emphasis" : "border"
                  }
                />
              )}
              <InlineStack gap="200" wrap={false} blockAlign="center">
                <StepBadge
                  complete={isComplete}
                  active={isActive}
                  upcoming={isUpcoming}
                  number={index + 1}
                />
                <BlockStack gap="050">
                  <Text
                    as="span"
                    variant="bodySm"
                    fontWeight={isActive ? "semibold" : "regular"}
                    tone={isUpcoming ? "subdued" : undefined}
                  >
                    {step.label}
                  </Text>
                  {isActive && (
                    <Text as="span" variant="bodySm" tone="subdued">
                      {step.description}
                    </Text>
                  )}
                </BlockStack>
              </InlineStack>
            </InlineStack>
          );
        })}
      </InlineStack>
    </Box>
  );
}

function StepBadge({
  complete,
  active,
  upcoming,
  number,
}: {
  complete: boolean;
  active: boolean;
  upcoming: boolean;
  number: number;
}) {
  const size = 28;

  if (complete) {
    return (
      <Box
        background="bg-fill-success"
        borderRadius="full"
        minWidth={`${size}px`}
        minHeight={`${size}px`}
      >
        <div
          style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--p-color-text-on-color)",
          }}
        >
          <CheckIcon width={16} height={16} />
        </div>
      </Box>
    );
  }

  return (
    <Box
      background={active ? "bg-fill-brand" : "bg-surface"}
      borderWidth="025"
      borderColor={active ? "border-brand" : "border"}
      borderRadius="full"
      minWidth={`${size}px`}
      minHeight={`${size}px`}
    >
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          as="span"
          variant="bodySm"
          fontWeight="semibold"
          tone={upcoming ? "subdued" : active ? undefined : "subdued"}
        >
          {number}
        </Text>
      </div>
    </Box>
  );
}
