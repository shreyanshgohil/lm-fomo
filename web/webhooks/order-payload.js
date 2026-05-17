function toProductGid(productId) {
  if (!productId) {
    return null;
  }

  if (String(productId).startsWith("gid://")) {
    return productId;
  }

  return `gid://shopify/Product/${productId}`;
}

export function normalizeOrderFromWebhook(payload) {
  const lineItems = (payload.line_items || [])
    .map((item) => ({
      quantity: item.quantity ?? 0,
      product: {
        id: toProductGid(item.product_id),
      },
    }))
    .filter((item) => item.product.id);

  return {
    id: payload.admin_graphql_api_id || `gid://shopify/Order/${payload.id}`,
    createdAt: payload.created_at,
    lineItems,
  };
}
