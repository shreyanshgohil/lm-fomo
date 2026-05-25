import { BlockStack, Checkbox, Text } from "@shopify/polaris";
import { PulseColorPicker } from "./PulseColorPicker";

interface WidgetAppearanceFieldsProps {
  backgroundColor: string;
  borderEnabled: boolean;
  borderColor: string;
  onBackgroundColorChange: (color: string) => void;
  onBorderEnabledChange: (enabled: boolean) => void;
  onBorderColorChange: (color: string) => void;
}

export function WidgetAppearanceFields({
  backgroundColor,
  borderEnabled,
  borderColor,
  onBackgroundColorChange,
  onBorderEnabledChange,
  onBorderColorChange,
}: WidgetAppearanceFieldsProps) {
  return (
    <BlockStack gap="400">
      <BlockStack gap="200">
        <Text as="p" variant="bodyMd">
          Background color
        </Text>
        <PulseColorPicker
          value={backgroundColor}
          onChange={onBackgroundColorChange}
        />
      </BlockStack>
      <Checkbox
        label="Show border"
        checked={borderEnabled}
        onChange={onBorderEnabledChange}
      />
      {borderEnabled && (
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            Border color
          </Text>
          <PulseColorPicker
            value={borderColor}
            onChange={onBorderColorChange}
          />
        </BlockStack>
      )}
    </BlockStack>
  );
}
