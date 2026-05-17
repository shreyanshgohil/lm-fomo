import {
  isForbiddenError,
  ORDERS_ACCESS_HELP,
} from "../services/errors.js";

/**
 * Prevents OAuth from failing when orders webhooks return 403 (missing PCD).
 *
 * @param {import("../shopify.js").default} shopify
 */
export function patchWebhookRegister(shopify) {
  const originalRegister = shopify.api.webhooks.register.bind(
    shopify.api.webhooks
  );

  shopify.api.webhooks.register = async function patchedRegister(params) {
    try {
      return await originalRegister(params);
    } catch (error) {
      if (isForbiddenError(error)) {
        shopify.config.logger.warning(
          `Webhook registration returned 403 — install will continue. ${ORDERS_ACCESS_HELP}`,
          { shop: params.session?.shop }
        );
        return {};
      }
      throw error;
    }
  };
}
