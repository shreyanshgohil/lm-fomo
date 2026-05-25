/**
 * Orders/create handlers are registered once at process startup in index.js.
 * Subscription delivery is declared in shopify.app.toml (`use_legacy_install_flow = false`).
 * Do not call `addHandlers` here — repeating it stacks duplicate callbacks per delivery.
 *
 * @param {import("../shopify.js").default} _shopify
 * @param {import("@shopify/shopify-api").Session} session
 */
export async function registerOrdersWebhooks(_shopify, session) {
  console.log(
    `[${session.shop}] orders/create handler ready (declarative subscription in shopify.app.toml)`
  );
  return true;
}
