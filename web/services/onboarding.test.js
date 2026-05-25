import assert from "node:assert/strict";
import { test } from "node:test";
import { getProductTemplateThemeEditorUrl } from "./onboarding.js";

test("getProductTemplateThemeEditorUrl builds product template deep link", () => {
  const previous = process.env.SHOPIFY_API_KEY;
  process.env.SHOPIFY_API_KEY = "test-client-id";

  try {
    const url = getProductTemplateThemeEditorUrl("demo.myshopify.com");
    assert.ok(url.startsWith("https://demo.myshopify.com/admin/themes/current/editor?"));
    assert.ok(url.includes("template=product"));
    assert.ok(url.includes("addAppBlockId=test-client-id%2Fstar_rating"));
    assert.ok(url.includes("target=newAppsSection"));
  } finally {
    if (previous === undefined) {
      delete process.env.SHOPIFY_API_KEY;
    } else {
      process.env.SHOPIFY_API_KEY = previous;
    }
  }
});
