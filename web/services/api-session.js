import {
  fetchClientCredentialsToken,
  isClientCredentialsEnabled,
  sessionFromClientCredentials,
} from "./client-credentials.js";

async function getShopify() {
  const { default: shopify } = await import("../shopify.js");
  return shopify;
}

function getOAuthClientCredentials() {
  return {
    clientId: process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CLIENT_ID || "",
    clientSecret:
      process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_CLIENT_SECRET || "",
  };
}

/**
 * Refreshes an expiring offline OAuth session using its refresh token.
 *
 * @param {import("../shopify.js").default} shopify
 * @param {import("@shopify/shopify-api").Session} session
 */
async function refreshExpiringOfflineSession(shopify, session) {
  const refreshToken = session.refreshToken;
  if (!refreshToken) {
    throw new Error(
      `[${session.shop}] Offline access token expired and no refresh token is stored. Open the app in Shopify admin to re-authenticate, or use SHOPIFY_AUTH_MODE=client_credentials for same-org dev stores.`
    );
  }

  const { clientId, clientSecret } = getOAuthClientCredentials();
  if (!clientId || !clientSecret) {
    throw new Error(
      "SHOPIFY_API_KEY and SHOPIFY_API_SECRET are required to refresh expiring offline tokens."
    );
  }

  const response = await fetch(
    `https://${session.shop}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `[${session.shop}] Refresh token request failed (${response.status}): ${body}`
    );
  }

  const payload = await response.json();
  session.accessToken = payload.access_token;
  session.refreshToken = payload.refresh_token;
  session.scope = payload.scope ?? session.scope;
  session.expires = new Date(Date.now() + (payload.expires_in ?? 3600) * 1000);

  if (payload.refresh_token_expires_in) {
    session.refreshTokenExpires = new Date(
      Date.now() + payload.refresh_token_expires_in * 1000
    );
  }

  await shopify.config.sessionStorage.storeSession(session);
  return session;
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

  if (offline.isExpired()) {
    await refreshExpiringOfflineSession(shopify, offline);
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
