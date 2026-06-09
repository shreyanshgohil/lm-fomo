import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_WIDGET_SETTINGS,
  normalizeWidgetSettings,
  validateWidgetSettings,
} from "./widget-settings.js";

test("normalizeWidgetSettings returns defaults for invalid input", () => {
  assert.equal(normalizeWidgetSettings(null), null);
  assert.equal(normalizeWidgetSettings("bad"), null);

  const normalized = normalizeWidgetSettings({
    fomoMode: "total_sold",
    messageTranslations: [{ locale: "fr", text: "Test {{count}}" }],
  });

  assert.ok(normalized);
  assert.equal(normalized.fomoMode, "total_sold");
  assert.equal(normalized.messageTranslations[0].locale, "fr");
  assert.equal(normalized.productScope, "all_products");
});

test("validateWidgetSettings rejects selected products without items", () => {
  const settings = {
    ...DEFAULT_WIDGET_SETTINGS,
    productScope: "selected_products",
    selectedProducts: [],
  };

  assert.match(
    validateWidgetSettings(settings),
    /Select at least one product/
  );
});

test("validateWidgetSettings accepts valid payload", () => {
  assert.equal(validateWidgetSettings(DEFAULT_WIDGET_SETTINGS), null);
});

test("validateWidgetSettings rejects empty translation text", () => {
  const settings = {
    ...DEFAULT_WIDGET_SETTINGS,
    messageTranslations: [{ locale: "en", text: "   " }],
  };

  assert.match(validateWidgetSettings(settings), /language needs message text/);
});
