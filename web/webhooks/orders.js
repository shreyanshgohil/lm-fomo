import { DeliveryMethod } from "@shopify/shopify-api";
import { enqueueProcessOrder } from "../jobs/queue.js";
import { normalizeOrderFromWebhook } from "./order-payload.js";

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (_topic, shop, body) => {
      const payload = JSON.parse(body);
      const order = normalizeOrderFromWebhook(payload);
      await enqueueProcessOrder(shop, order);
    },
  },
};
