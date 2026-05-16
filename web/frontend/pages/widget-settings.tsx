import { useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  Checkbox,
  ChoiceList,
  InlineGrid,
  InlineStack,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { PageContainer } from "../app/components/layout";
import {
  PreviewWidget,
  SectionCard,
  SettingsSection,
} from "../app/components/ui";
import {
  accentColors,
  defaultWidgetSettings,
  fomoModeOptions,
} from "../app/data/mock/widgetSettings";
import type { FomoMode, WidgetSettingsState } from "../app/types";

export default function WidgetSettingsPage() {
  const [settings, setSettings] = useState<WidgetSettingsState>(
    defaultWidgetSettings,
  );

  const update = <K extends keyof WidgetSettingsState>(
    key: K,
    value: WidgetSettingsState[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <PageContainer
      title="Widget Settings"
      subtitle="Customize how FOMO appears on your product pages"
      primaryAction={
        <Button variant="primary" disabled>
          Save (mock)
        </Button>
      }
    >
      <InlineGrid columns={2} gap="400">
        <BlockStack gap="400">
          <SectionCard title="General">
            <SettingsSection
              title="Widget status"
              description="Show or hide the FOMO notification on product pages"
            >
              <Checkbox
                label="Enable widget"
                checked={settings.enabled}
                onChange={(checked) => update("enabled", checked)}
              />
              <Checkbox
                label="Visible on desktop"
                checked={settings.desktopVisible}
                onChange={(checked) => update("desktopVisible", checked)}
                helpText="Mock toggle — desktop-only layout"
              />
            </SettingsSection>

            <SettingsSection
              title="FOMO mode"
              description="Choose how purchase activity is displayed"
            >
              <ChoiceList
                title="Display mode"
                titleHidden
                choices={fomoModeOptions.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
                selected={[settings.fomoMode]}
                onChange={(selected) =>
                  update("fomoMode", selected[0] as FomoMode)
                }
              />
            </SettingsSection>

            <SettingsSection
              title="Message"
              description="Use {{count}} as a placeholder for the number shown"
            >
              <TextField
                label="Custom text"
                value={settings.customText}
                onChange={(value) => update("customText", value)}
                autoComplete="off"
                multiline={2}
              />
            </SettingsSection>

            <SettingsSection title="Display options">
              <BlockStack gap="300">
                <Checkbox
                  label="Show emoji"
                  checked={settings.showEmoji}
                  onChange={(checked) => update("showEmoji", checked)}
                />
                <Checkbox
                  label="Enable subtle animation"
                  checked={settings.animationEnabled}
                  onChange={(checked) => update("animationEnabled", checked)}
                />
              </BlockStack>
            </SettingsSection>

            <SettingsSection
              title="Accent color"
              description="Pick a color for the activity indicator"
            >
              <InlineStack gap="200">
                {accentColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select color ${color}`}
                    onClick={() => update("accentColor", color)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--p-border-radius-full)",
                      backgroundColor: color,
                      border:
                        settings.accentColor === color
                          ? "3px solid var(--p-color-border-emphasis)"
                          : "2px solid var(--p-color-border)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </InlineStack>
              <Box paddingBlockStart="300">
                <Select
                  label="Hex value"
                  options={accentColors.map((c) => ({
                    label: c,
                    value: c,
                  }))}
                  value={settings.accentColor}
                  onChange={(value) => update("accentColor", value)}
                />
              </Box>
            </SettingsSection>
          </SectionCard>
        </BlockStack>

        <SectionCard
          title="Widget preview"
          description="Updates in real time as you change settings"
        >
          <PreviewWidget settings={settings} />
          <Box paddingBlockStart="300">
            <Text as="p" variant="bodySm" tone="subdued">
              {settings.enabled
                ? "Widget is enabled (mock state)"
                : "Widget is disabled — preview only"}
            </Text>
          </Box>
        </SectionCard>
      </InlineGrid>
    </PageContainer>
  );
}
