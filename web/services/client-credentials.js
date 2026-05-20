import { Session } from "@shopify/shopify-api";

/** @type {Map<string, { accessToken: string, scope?: string, expiresAt: number }>} */
const tokenCache = new Map();

function normalizeShop(shop) {
  const trimmed = (shop || "").trim().toLowerCase();
  if (!trimmed) {
    throw new Error("Shop domain is required");
  }
  return trimmed.endsWith(".myshopify.com")
    ? trimmed
    : `${trimmed}.myshopify.com`;
}

function getClientCredentials() {
  const clientId =
    process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_API_KEY || "";
  const clientSecret =
    process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET || "";
  return { clientId, clientSecret };
}

/**
 * Client credentials grant (same-org Dev Dashboard apps).
 * Tokens last ~24h and are refreshed automatically.
 *
 * @see https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant
 */
export function isClientCredentialsEnabled() {
  const mode = (process.env.SHOPIFY_AUTH_MODE || "oauth").toLowerCase();
  if (mode === "oauth") {
    return false;
  }
  if (mode !== "client_credentials") {
    throw new Error(
      `Invalid SHOPIFY_AUTH_MODE="${process.env.SHOPIFY_AUTH_MODE}". Use "oauth" or "client_credentials".`
    );
  }

  const { clientId, clientSecret } = getClientCredentials();
  return Boolean(clientId && clientSecret);
}

/**
 * @param {string} shop
 */
export async function fetchClientCredentialsToken(shop) {
  const normalized = normalizeShop(shop);
  const cached = tokenCache.get(normalized);
  if (cached && Date.now() < cached.expiresAt - 60_000) {
    return cached;
  }

  const { clientId, clientSecret } = getClientCredentials();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Client credentials mode requires SHOPIFY_API_KEY and SHOPIFY_API_SECRET (or SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET)."
    );
  }

  const response = await fetch(
    `https://${normalized}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `[${normalized}] Client credentials token request failed (${response.status}): ${body}`
    );
  }

  const payload = await response.json();
  const entry = {
    accessToken: payload.access_token,
    scope: payload.scope,
    expiresAt: Date.now() + (payload.expires_in ?? 86_399) * 1000,
  };
  tokenCache.set(normalized, entry);
  return entry;
}

/**
 * @param {string} shop
 * @param {{ accessToken: string, scope?: string, expiresAt: number }} tokenData
 */
export function sessionFromClientCredentials(shop, tokenData) {
  const normalized = normalizeShop(shop);
  return new Session({
    id: `offline_client_credentials_${normalized}`,
    shop: normalized,
    state: "client_credentials",
    isOnline: false,
    accessToken: tokenData.accessToken,
    scope: tokenData.scope,
    expires: new Date(tokenData.expiresAt),
  });
}
