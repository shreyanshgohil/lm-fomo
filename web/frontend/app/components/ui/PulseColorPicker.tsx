import { useCallback, useEffect, useState } from "react";
import {
  BlockStack,
  Box,
  ColorPicker,
  TextField,
  hexToRgb,
  hsbToHex,
  rgbToHsb,
} from "@shopify/polaris";
import type { HSBColor } from "@shopify/polaris";

function hexToHsb(hex: string): HSBColor {
  return rgbToHsb(hexToRgb(hex));
}

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function isValidHex(value: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(value.trim());
}

interface PulseColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function PulseColorPicker({ value, onChange }: PulseColorPickerProps) {
  const [color, setColor] = useState<HSBColor>(() => hexToHsb(value));
  const [hexInput, setHexInput] = useState(value);

  useEffect(() => {
    setHexInput(value);
    setColor(hexToHsb(value));
  }, [value]);

  const applyHex = useCallback(
    (hex: string) => {
      const normalized = normalizeHex(hex);
      setHexInput(normalized);
      setColor(hexToHsb(normalized));
      onChange(normalized);
    },
    [onChange],
  );

  const handlePickerChange = useCallback(
    (hsb: HSBColor) => {
      setColor(hsb);
      applyHex(hsbToHex(hsb));
    },
    [applyHex],
  );

  const handleHexChange = useCallback(
    (input: string) => {
      setHexInput(input);
      const normalized = normalizeHex(input);
      if (isValidHex(normalized)) {
        applyHex(normalized);
      }
    },
    [applyHex],
  );

  const handleHexBlur = useCallback(() => {
    const normalized = normalizeHex(hexInput);
    if (isValidHex(normalized)) {
      applyHex(normalized);
      return;
    }
    setHexInput(value);
    setColor(hexToHsb(value));
  }, [applyHex, hexInput, value]);

  return (
    <BlockStack gap="300">
      <Box minWidth="220px" maxWidth="320px">
        <ColorPicker fullWidth color={color} onChange={handlePickerChange} />
      </Box>
      <TextField
        label="Hex value"
        value={hexInput}
        onChange={handleHexChange}
        onBlur={handleHexBlur}
        autoComplete="off"
      />
    </BlockStack>
  );
}
