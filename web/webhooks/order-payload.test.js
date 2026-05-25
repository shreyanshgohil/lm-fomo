import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeOrderFromWebhook } from "./order-payload.js";

test("normalizeOrderFromWebhook uses current_quantity when present", () => {
  const order = normalizeOrderFromWebhook({
    id: 1001,
    admin_graphql_api_id: "gid://shopify/Order/1001",
    created_at: "2026-05-26T12:00:00Z",
    line_items: [
      {
        id: 55,
        product_id: 42,
        quantity: 3,
        current_quantity: 1,
      },
    ],
  });

  assert.equal(order.lineItems.length, 1);
  assert.equal(order.lineItems[0].quantity, 1);
  assert.equal(order.lineItems[0].id, "55");
});

test("normalizeOrderFromWebhook drops lines without product or quantity", () => {
  const order = normalizeOrderFromWebhook({
    id: 1002,
    created_at: "2026-05-26T12:00:00Z",
    line_items: [
      { id: 1, product_id: null, quantity: 1 },
      { id: 2, product_id: 9, quantity: 0 },
    ],
  });

  assert.equal(order.lineItems.length, 0);
});
