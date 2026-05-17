import privacyHandlers from "../privacy.js";
import appUninstalledHandler from "./app-uninstalled.js";
import ordersCreateHandler from "./orders.js";

const webhookHandlers = {
  ...privacyHandlers,
  APP_UNINSTALLED: appUninstalledHandler,
  ORDERS_CREATE: ordersCreateHandler,
};

export default webhookHandlers;
