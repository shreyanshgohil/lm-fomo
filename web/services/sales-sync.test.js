import assert from "node:assert/strict";
import { test } from "node:test";
import { aggregateOrderQuantities } from "./sales-sync.js";

test("aggregateOrderQuantities sums quantity per product", () => {
  const totals = aggregateOrderQuantities([
    {
      lineItems: [
        {
          id: "line-1",
          quantity: 1,
          product: { id: "gid://shopify/Product/1" },
        },
      ],
    },
  ]);

  assert.equal(totals.get("gid://shopify/Product/1"), 1);
});

test("aggregateOrderQuantities ignores duplicate line item ids", () => {
  const totals = aggregateOrderQuantities([
    {
      lineItems: [
        {
          id: "line-1",
          quantity: 1,
          product: { id: "gid://shopify/Product/1" },
        },
        {
          id: "line-1",
          quantity: 1,
          product: { id: "gid://shopify/Product/1" },
        },
        {
          id: "line-2",
          quantity: 1,
          product: { id: "gid://shopify/Product/1" },
        },
      ],
    },
  ]);

  assert.equal(totals.get("gid://shopify/Product/1"), 2);
});

test("aggregateOrderQuantities ignores zero quantity lines", () => {
  const totals = aggregateOrderQuantities([
    {
      lineItems: [
        {
          id: "line-1",
          quantity: 0,
          product: { id: "gid://shopify/Product/1" },
        },
      ],
    },
  ]);

  assert.equal(totals.size, 0);
});
