import CoreWebhookHandlers from "./core.js";
import OrdersWebhookHandlers from "./orders.js";

export { default as CoreWebhookHandlers } from "./core.js";
export { default as OrdersWebhookHandlers } from "./orders.js";

/**
 * All handlers for incoming webhook HTTP requests.
 *
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  ...CoreWebhookHandlers,
  ...OrdersWebhookHandlers,
};
