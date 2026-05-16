import { useState } from "react";
import {
  BlockStack,
  Button,
  ChoiceList,
  InlineGrid,
  TextField,
} from "@shopify/polaris";
import { PageContainer } from "../app/components/layout";
import {
  AccentColorPicker,
  HybridRangeFields,
  PreviewWidget,
  ProductScopePicker,
  SectionCard,
  SettingsSection,
} from "../app/components/ui";
import {
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
              title="Products"
              description="Choose where the widget appears in your catalog"
            >
              <ProductScopePicker
                productScope={settings.productScope}
                selectedProducts={settings.selectedProducts}
                onScopeChange={(scope) => update("productScope", scope)}
                onProductsChange={(products) =>
                  update("selectedProducts", products)
                }
              />
            </SettingsSection>

            <SettingsSection
              title="FOMO mode"
              description="Choose how purchase activity is displayed"
            >
              <BlockStack gap="400">
                <ChoiceList
                  title="Display mode"
                  titleHidden
                  choices={fomoModeOptions.map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                    helpText: "helpText" in opt ? opt.helpText : undefined,
                  }))}
                  selected={[settings.fomoMode]}
                  onChange={(selected) =>
                    update("fomoMode", selected[0] as FomoMode)
                  }
                />
                {settings.fomoMode === "hybrid_randomized" && (
                  <HybridRangeFields
                    min={settings.hybridMin}
                    max={settings.hybridMax}
                    ttl={settings.hybridTtl}
                    onMinChange={(hybridMin) => update("hybridMin", hybridMin)}
                    onMaxChange={(hybridMax) => update("hybridMax", hybridMax)}
                    onTtlChange={(hybridTtl) => update("hybridTtl", hybridTtl)}
                  />
                )}
              </BlockStack>
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

          </SectionCard>
        </BlockStack>

        <BlockStack gap="400">
          <SectionCard
            title="Accent color"
            description="Pick a color for the activity indicator"
          >
            <AccentColorPicker
              value={settings.accentColor}
              onChange={(color) => update("accentColor", color)}
            />
          </SectionCard>

          <SectionCard
            title="Widget preview"
            description="Updates in real time as you change settings"
          >
            <PreviewWidget settings={settings} />
          </SectionCard>
        </BlockStack>
      </InlineGrid>
    </PageContainer>
  );
}
