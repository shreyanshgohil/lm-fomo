import { useState } from "react";
import {
  BlockStack,
  Button,
  ChoiceList,
  InlineGrid,
} from "@shopify/polaris";
import { PageContainer, StickyColumn } from "../app/components/layout";
import {
  PulseColorPicker,
  HybridRangeFields,
  MessageTranslationsEditor,
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
              description="Add translations for each language your store supports"
            >
              <MessageTranslationsEditor
                translations={settings.messageTranslations}
                onChange={(messageTranslations) => {
                  setSettings((prev) => {
                    const previewStillExists = messageTranslations.some(
                      (entry) => entry.locale === prev.previewLocale,
                    );
                    return {
                      ...prev,
                      messageTranslations,
                      previewLocale: previewStillExists
                        ? prev.previewLocale
                        : (messageTranslations[0]?.locale ?? "en"),
                    };
                  });
                }}
              />
            </SettingsSection>

            <SettingsSection
              title="Pulse color"
              description="Color of the live pulsing dot beside your message"
            >
              <PulseColorPicker
                value={settings.pulseColor}
                onChange={(color) => update("pulseColor", color)}
              />
            </SettingsSection>
          </SectionCard>
        </BlockStack>

        <StickyColumn>
          <SectionCard
            title="Widget preview"
            description="Updates in real time as you change settings"
          >
            <PreviewWidget
              settings={settings}
              onPreviewLocaleChange={(previewLocale) =>
                update("previewLocale", previewLocale)
              }
            />
          </SectionCard>
        </StickyColumn>
      </InlineGrid>
    </PageContainer>
  );
}
