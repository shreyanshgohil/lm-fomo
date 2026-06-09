import { DeliveryMethod } from "@shopify/shopify-api";
import { removeShop } from "../db.js";

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (_topic, shop) => {
      await removeShop(shop);
      console.log(`[${shop}] App uninstalled — shop data removed`);
    },
  },
};
