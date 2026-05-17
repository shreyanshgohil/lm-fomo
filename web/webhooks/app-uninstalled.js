import { DeliveryMethod } from "@shopify/shopify-api";
import { clearShopData } from "../db.js";

const APP_UNINSTALLED = {
  deliveryMethod: DeliveryMethod.Http,
  callbackUrl: "/api/webhooks",
  callback: async (_topic, shop) => {
    await clearShopData(shop);
  },
};

export default APP_UNINSTALLED;
