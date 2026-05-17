import { DeliveryMethod } from "@shopify/shopify-api";
import { enqueueOrderCreated } from "../jobs/worker.js";

const ORDERS_CREATE = {
  deliveryMethod: DeliveryMethod.Http,
  callbackUrl: "/api/webhooks",
  callback: async (_topic, shop, body) => {
    const payload = JSON.parse(body);
    await enqueueOrderCreated(shop, payload);
  },
};

export default ORDERS_CREATE;
