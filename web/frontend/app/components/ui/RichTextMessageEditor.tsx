import { useCallback, useEffect, useRef, useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  ColorPicker,
  Divider,
  Popover,
  Text,
  TextField,
  hexToRgb,
  hsbToHex,
  rgbToHsb,
} from "@shopify/polaris";
import type { HSBColor } from "@shopify/polaris";
import { TextBoldIcon, TextColorIcon } from "@shopify/polaris-icons";
import { messageTextColorPresets } from "../../data/mock/widgetSettings";
import { toEditorHtml } from "../../utils/richTextMessage";
import "./RichTextMessageEditor.css";

const DEFAULT_TEXT_COLOR = "#202223";

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

interface RichTextMessageEditorProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (html: string) => void;
}

export function RichTextMessageEditor({
  label = "Message",
  value,
  placeholder,
  onChange,
}: RichTextMessageEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [colorPopoverActive, setColorPopoverActive] = useState(false);
  const [pickerColor, setPickerColor] = useState<HSBColor>(() =>
    hexToHsb(DEFAULT_TEXT_COLOR),
  );
  const [customHex, setCustomHex] = useState(DEFAULT_TEXT_COLOR);

  const syncEditorContent = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = toEditorHtml(value);
    if (editor.innerHTML !== html) {
      editor.innerHTML = html;
    }
  }, [value]);

  useEffect(() => {
    syncEditorContent();
  }, [syncEditorContent]);

  const focusEditor = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(editor.innerHTML);
  }, [onChange]);

  const applyTextColor = useCallback(
    (hex: string) => {
      const normalized = normalizeHex(hex);
      setCustomHex(normalized);
      setPickerColor(hexToHsb(normalized));
      focusEditor();
      document.execCommand("foreColor", false, normalized);
      emitChange();
    },
    [emitChange, focusEditor],
  );

  const handleBold = useCallback(() => {
    focusEditor();
    document.execCommand("bold");
    emitChange();
  }, [emitChange, focusEditor]);

  const handlePresetColor = useCallback(
    (hex: string) => {
      applyTextColor(hex);
    },
    [applyTextColor],
  );

  const handlePickerChange = useCallback(
    (hsb: HSBColor) => {
      const hex = hsbToHex(hsb);
      setPickerColor(hsb);
      setCustomHex(hex);
      applyTextColor(hex);
    },
    [applyTextColor],
  );

  const handleCustomHexChange = useCallback((input: string) => {
    setCustomHex(input);
    const normalized = normalizeHex(input);
    if (isValidHex(normalized)) {
      setPickerColor(hexToHsb(normalized));
    }
  }, []);

  const handleCustomHexApply = useCallback(() => {
    const normalized = normalizeHex(customHex);
    if (isValidHex(normalized)) {
      applyTextColor(normalized);
    }
  }, [applyTextColor, customHex]);

  const handleInsertCount = useCallback(() => {
    focusEditor();
    document.execCommand("insertText", false, "{{count}}");
    emitChange();
  }, [emitChange, focusEditor]);

  const colorActivator = (
    <Button
      icon={TextColorIcon}
      accessibilityLabel="Message text color"
      onClick={() => setColorPopoverActive((active) => !active)}
    />
  );

  return (
    <div className="rich-text-message">
      <label className="rich-text-message__label">{label}</label>
      <div className="rich-text-message__toolbar">
        <ButtonGroup variant="segmented">
          <Button
            icon={TextBoldIcon}
            accessibilityLabel="Bold"
            onClick={handleBold}
          />
          <Popover
            active={colorPopoverActive}
            activator={colorActivator}
            onClose={() => setColorPopoverActive(false)}
            preferredAlignment="left"
            autofocusTarget="none"
          >
            <Box padding="300" minWidth="260px">
              <BlockStack gap="300">
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Quick picks
                  </Text>
                  <div
                    className="rich-text-message__color-grid"
                    role="group"
                    aria-label="Message text color presets"
                  >
                    {messageTextColorPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        className={`rich-text-message__color-swatch${
                          preset.value === DEFAULT_TEXT_COLOR
                            ? " rich-text-message__color-swatch--default"
                            : ""
                        }`}
                        style={
                          preset.value === DEFAULT_TEXT_COLOR
                            ? undefined
                            : {
                                backgroundColor: preset.value,
                                ...(preset.value === "#FFFFFF"
                                  ? {
                                      boxShadow:
                                        "inset 0 0 0 1px var(--p-color-border)",
                                    }
                                  : {}),
                              }
                        }
                        aria-label={preset.label}
                        onClick={() => handlePresetColor(preset.value)}
                      />
                    ))}
                  </div>
                </BlockStack>

                <Divider />

                <BlockStack gap="300">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Custom color
                  </Text>
                  <ColorPicker
                    fullWidth
                    color={pickerColor}
                    onChange={handlePickerChange}
                  />
                  <InlineHexApply
                    value={customHex}
                    onChange={handleCustomHexChange}
                    onApply={handleCustomHexApply}
                  />
                </BlockStack>
              </BlockStack>
            </Box>
          </Popover>
        </ButtonGroup>
        <Button size="slim" onClick={handleInsertCount}>
          Insert {"{{count}}"}
        </Button>
      </div>
      <div
        ref={editorRef}
        className="rich-text-message__editor"
        contentEditable
        role="textbox"
        aria-multiline
        aria-label={label}
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        suppressContentEditableWarning
      />
    </div>
  );
}

function InlineHexApply({
  value,
  onChange,
  onApply,
}: {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="rich-text-message__hex-row">
      <TextField
        label="Hex"
        labelHidden
        value={value}
        onChange={onChange}
        autoComplete="off"
        connectedRight={
          <Button onClick={onApply}>Apply</Button>
        }
      />
    </div>
  );
}
