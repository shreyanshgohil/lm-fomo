import { useCallback } from "react";
import { BlockStack, InlineGrid, Text, TextField } from "@shopify/polaris";

interface HybridRangeFieldsProps {
  min: number;
  max: number;
  ttl: number;
  onMinChange: (min: number) => void;
  onMaxChange: (max: number) => void;
  onTtlChange: (ttl: number) => void;
}

function parsePositiveInt(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return null;
  return parsed;
}

export function HybridRangeFields({
  min,
  max,
  ttl,
  onMinChange,
  onMaxChange,
  onTtlChange,
}: HybridRangeFieldsProps) {
  const rangeError =
    min > max ? "Minimum must be less than or equal to maximum" : undefined;

  const handleMinChange = useCallback(
    (value: string) => {
      const parsed = parsePositiveInt(value);
      if (parsed !== null) onMinChange(parsed);
    },
    [onMinChange],
  );

  const handleMaxChange = useCallback(
    (value: string) => {
      const parsed = parsePositiveInt(value);
      if (parsed !== null) onMaxChange(parsed);
    },
    [onMaxChange],
  );

  const handleTtlChange = useCallback(
    (value: string) => {
      const parsed = parsePositiveInt(value);
      if (parsed !== null) onTtlChange(parsed);
    },
    [onTtlChange],
  );

  return (
    <BlockStack gap="300">
      <Text as="p" variant="bodySm" tone="subdued">
        Set the range for randomized purchase counts shown to shoppers.
      </Text>
      <InlineGrid columns={2} gap="300">
        <TextField
          label="Minimum"
          type="number"
          value={String(min)}
          onChange={handleMinChange}
          min={1}
          autoComplete="off"
          error={rangeError}
        />
        <TextField
          label="Maximum"
          type="number"
          value={String(max)}
          onChange={handleMaxChange}
          min={1}
          autoComplete="off"
        />
      </InlineGrid>
      <TextField
        label="TTL (minutes)"
        type="number"
        value={String(ttl)}
        onChange={handleTtlChange}
        min={1}
        autoComplete="off"
        helpText="How long the randomized count stays the same before refreshing"
      />
    </BlockStack>
  );
}
