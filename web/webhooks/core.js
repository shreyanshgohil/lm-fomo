import PrivacyWebhookHandlers from "../privacy.js";
import AppUninstalledWebhookHandlers from "./app-uninstalled.js";

/**
 * Webhooks registered during OAuth (no orders scope / PCD required).
 *
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
const CoreWebhookHandlers = {
  ...PrivacyWebhookHandlers,
  ...AppUninstalledWebhookHandlers,
};

export default CoreWebhookHandlers;
