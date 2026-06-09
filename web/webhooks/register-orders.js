import OrdersWebhookHandlers from "./orders.js";

/**
 * Ensures orders/create handlers are registered. Subscription delivery is
 * declared in shopify.app.toml (`use_legacy_install_flow = false`); programmatic
 * `webhooks.register` is intentionally disabled in shopify.js.
 *
 * @param {import("../shopify.js").default} shopify
 * @param {import("@shopify/shopify-api").Session} session
 */
export async function registerOrdersWebhooks(shopify, session) {
  const shop = session.shop;
  shopify.api.webhooks.addHandlers(OrdersWebhookHandlers);
  console.log(
    `[${shop}] orders/create handler ready (declarative subscription in shopify.app.toml)`
  );
  return true;
}
