function toProductGid(productId) {
  if (!productId) {
    return null;
  }

  if (String(productId).startsWith("gid://")) {
    return productId;
  }

  return `gid://shopify/Product/${productId}`;
}

function lineItemQuantity(item) {
  const raw =
    item.current_quantity ?? item.quantity ?? item.fulfillable_quantity ?? 0;
  const quantity = Number(raw);
  return Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;
}

export function normalizeOrderFromWebhook(payload) {
  const lineItems = (payload.line_items || [])
    .map((item) => ({
      id: item.id != null ? String(item.id) : null,
      quantity: lineItemQuantity(item),
      product: {
        id: toProductGid(item.product_id),
      },
    }))
    .filter((item) => item.product.id && item.quantity > 0);

  return {
    id: payload.admin_graphql_api_id || `gid://shopify/Order/${payload.id}`,
    createdAt: payload.created_at,
    lineItems,
  };
}
