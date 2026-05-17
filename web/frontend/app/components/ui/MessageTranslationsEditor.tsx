import { useCallback, useMemo, useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  Divider,
  FormLayout,
  InlineStack,
  Select,
  Text,
} from "@shopify/polaris";
import { RichTextMessageEditor } from "./RichTextMessageEditor";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import { localeOptions } from "../../data/mock/widgetSettings";
import type { MessageTranslation } from "../../types";
import { DEFAULT_MESSAGE_TEMPLATE } from "../../utils/messageTranslations";

interface MessageTranslationsEditorProps {
  translations: MessageTranslation[];
  onChange: (translations: MessageTranslation[]) => void;
}

function getLocaleLabel(locale: string): string {
  return localeOptions.find((opt) => opt.value === locale)?.label ?? locale;
}

export function MessageTranslationsEditor({
  translations,
  onChange,
}: MessageTranslationsEditorProps) {
  const [localeToAdd, setLocaleToAdd] = useState("");

  const usedLocales = useMemo(
    () => new Set(translations.map((entry) => entry.locale)),
    [translations],
  );

  const availableLocales = useMemo(
    () => localeOptions.filter((opt) => !usedLocales.has(opt.value)),
    [usedLocales],
  );

  const addLocaleOptions = useMemo(
    () => [
      { label: "Choose a language…", value: "" },
      ...availableLocales.map((opt) => ({
        label: opt.label,
        value: opt.value,
      })),
    ],
    [availableLocales],
  );

  const handleAddLanguage = useCallback(() => {
    if (!localeToAdd || usedLocales.has(localeToAdd)) return;
    onChange([
      ...translations,
      { locale: localeToAdd, text: DEFAULT_MESSAGE_TEMPLATE },
    ]);
    setLocaleToAdd("");
  }, [localeToAdd, onChange, translations, usedLocales]);

  const handleTextChange = useCallback(
    (locale: string, text: string) => {
      onChange(
        translations.map((entry) =>
          entry.locale === locale ? { ...entry, text } : entry,
        ),
      );
    },
    [onChange, translations],
  );

  const handleRemove = useCallback(
    (locale: string) => {
      if (translations.length <= 1) return;
      onChange(translations.filter((entry) => entry.locale !== locale));
    },
    [onChange, translations],
  );

  return (
    <BlockStack gap="400">
      <Banner tone="info">
        <Text as="p" variant="bodyMd">
          Add a message for each language. Use bold and text color (presets or
          custom picker),
          and use{" "}
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {"{{count}}"}
          </Text>{" "}
          where the purchase number should appear.
        </Text>
      </Banner>

      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="200" blockAlign="center">
          <Text as="span" variant="bodySm" tone="subdued">
            Languages
          </Text>
          <Badge tone="info">{String(translations.length)}</Badge>
        </InlineStack>
      </InlineStack>

      <BlockStack gap="300">
        {translations.map((entry, index) => (
          <BlockStack key={entry.locale} gap="300">
            <Card background="bg-surface-secondary" padding="400">
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Badge>{entry.locale.toUpperCase()}</Badge>
                    <Text as="h4" variant="headingSm">
                      {getLocaleLabel(entry.locale)}
                    </Text>
                  </InlineStack>
                  <Button
                    variant="tertiary"
                    tone="critical"
                    icon={DeleteIcon}
                    accessibilityLabel={`Remove ${getLocaleLabel(entry.locale)}`}
                    onClick={() => handleRemove(entry.locale)}
                    disabled={translations.length <= 1}
                  />
                </InlineStack>
                <RichTextMessageEditor
                  value={entry.text}
                  onChange={(text) => handleTextChange(entry.locale, text)}
                  placeholder={DEFAULT_MESSAGE_TEMPLATE}
                />
              </BlockStack>
            </Card>
            {index < translations.length - 1 && <Divider />}
          </BlockStack>
        ))}
      </BlockStack>

      {availableLocales.length > 0 ? (
        <Card padding="400">
          <FormLayout>
            <Select
              label="Add another language"
              options={addLocaleOptions}
              value={localeToAdd}
              onChange={setLocaleToAdd}
            />
            <Button
              variant="primary"
              icon={PlusIcon}
              onClick={handleAddLanguage}
              disabled={!localeToAdd}
            >
              Add language
            </Button>
          </FormLayout>
        </Card>
      ) : (
        <Banner tone="success">
          All available languages have been added.
        </Banner>
      )}
    </BlockStack>
  );
}
