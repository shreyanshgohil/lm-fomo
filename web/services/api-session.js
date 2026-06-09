import {
  accessTokenNeedsRefresh,
  refreshOfflineToken,
} from "../auth/token-exchange.js";
import {
  fetchClientCredentialsToken,
  isClientCredentialsEnabled,
  sessionFromClientCredentials,
} from "./client-credentials.js";

async function getShopify() {
  const { default: shopify } = await import("../shopify.js");
  return shopify;
}

/**
 * Loads the offline session from storage and refreshes it when expired.
 *
 * @param {import("../shopify.js").default} shopify
 * @param {string} shop
 */
async function loadOAuthOfflineSession(shopify, shop) {
  const sessions = await shopify.config.sessionStorage.findSessionsByShop(shop);
  const offline =
    sessions.find((session) => session.isOnline === false) ?? sessions[0];

  if (!offline?.accessToken) {
    throw new Error(`No OAuth session found for shop: ${shop}`);
  }

  if (accessTokenNeedsRefresh(offline)) {
    const refreshed = await refreshOfflineToken(shop);
    if (!refreshed) {
      throw new Error(
        `[${shop}] Offline access token expired and cannot be refreshed. Open the app in Shopify admin to re-authenticate, or use SHOPIFY_AUTH_MODE=client_credentials for same-org dev stores.`
      );
    }
    return refreshed;
  }

  return offline;
}

/**
 * Resolves an offline Admin API session for background work (jobs, webhooks).
 * Uses client credentials when SHOPIFY_AUTH_MODE=client_credentials; otherwise
 * loads and refreshes the OAuth offline session from MongoDB.
 *
 * @param {string} shop
 */
export async function getApiSession(shop) {
  if (isClientCredentialsEnabled()) {
    const tokenData = await fetchClientCredentialsToken(shop);
    return sessionFromClientCredentials(shop, tokenData);
  }

  const shopify = await getShopify();
  return loadOAuthOfflineSession(shopify, shop);
}
