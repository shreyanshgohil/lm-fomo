import { useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  ChoiceList,
  InlineGrid,
  InlineStack,
  Select,
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
          <SectionCard>
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
        </SectionCard>
      </InlineGrid>
    </PageContainer>
  );
}
