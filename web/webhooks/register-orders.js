import OrdersWebhookHandlers from "./orders.js";
import { isForbiddenError, ORDERS_ACCESS_HELP } from "../services/errors.js";

/**
 * Register orders/create after Protected customer data + read_orders are active.
 *
 * @param {import("../shopify.js").default} shopify
 * @param {import("@shopify/shopify-api").Session} session
 */
export async function registerOrdersWebhooks(shopify, session) {
  const shop = session.shop;
  shopify.api.webhooks.addHandlers(OrdersWebhookHandlers);

  try {
    const results = await shopify.api.webhooks.register({ session });
    const responses = results.ORDERS_CREATE ?? [];
    const failed = responses.filter((entry) => !entry.success);

    if (failed.length > 0) {
      console.warn(`[${shop}] orders/create webhook registration failed`, failed);
      return false;
    }

    console.log(`[${shop}] orders/create webhook registered`);
    return true;
  } catch (error) {
    if (isForbiddenError(error)) {
      console.warn(`[${shop}] orders/create webhook blocked (403). ${ORDERS_ACCESS_HELP}`);
      return false;
    }
    throw error;
  }
}
