import { useCallback } from "react";
import {
  BlockStack,
  Checkbox,
  RangeSlider,
  Text,
  TextField,
} from "@shopify/polaris";
import { PulseColorPicker } from "./PulseColorPicker";

const BORDER_RADIUS_MIN = 0;
const BORDER_RADIUS_MAX = 32;

interface WidgetAppearanceFieldsProps {
  backgroundColor: string;
  borderEnabled: boolean;
  borderColor: string;
  borderRadius: number;
  onBackgroundColorChange: (color: string) => void;
  onBorderEnabledChange: (enabled: boolean) => void;
  onBorderColorChange: (color: string) => void;
  onBorderRadiusChange: (radius: number) => void;
}

export function WidgetAppearanceFields({
  backgroundColor,
  borderEnabled,
  borderColor,
  borderRadius,
  onBackgroundColorChange,
  onBorderEnabledChange,
  onBorderColorChange,
  onBorderRadiusChange,
}: WidgetAppearanceFieldsProps) {
  const clampRadius = useCallback(
    (value: number) =>
      Math.min(
        BORDER_RADIUS_MAX,
        Math.max(BORDER_RADIUS_MIN, Math.round(value)),
      ),
    [],
  );

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

      <BlockStack gap="200">
        <Text as="p" variant="bodyMd">
          Border radius
        </Text>
        <RangeSlider
          label="Border radius"
          labelHidden
          min={BORDER_RADIUS_MIN}
          max={BORDER_RADIUS_MAX}
          step={1}
          value={borderRadius}
          onChange={onBorderRadiusChange}
          output
          suffix="px"
        />
        <TextField
          label="Border radius (px)"
          labelHidden
          type="number"
          min={BORDER_RADIUS_MIN}
          max={BORDER_RADIUS_MAX}
          value={String(borderRadius)}
          onChange={(value) => {
            const parsed = Number.parseInt(value, 10);
            if (Number.isFinite(parsed)) {
              onBorderRadiusChange(clampRadius(parsed));
            }
          }}
          onBlur={() => onBorderRadiusChange(clampRadius(borderRadius))}
          autoComplete="off"
          suffix="px"
        />
      </BlockStack>
    </BlockStack>
  );
}
