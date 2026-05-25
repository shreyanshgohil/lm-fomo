import { RequestedTokenType } from "@shopify/shopify-api";
import shopify from "../shopify.js";

const REFRESH_LEEWAY_MS = 30_000;

function readBearer(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function shopFromPayload(payload) {
  if (!payload?.dest) return null;
  return payload.dest.replace(/^https?:\/\//, "");
}

function expiresAtMs(date) {
  if (!date) return null;
  return date instanceof Date ? date.getTime() : new Date(date).getTime();
}

function isPast(date, leewayMs = 0) {
  const at = expiresAtMs(date);
  if (at == null) return true;
  return at < Date.now() + leewayMs;
}

/**
 * The Admin API rejects non-expiring offline tokens. A stored session is
 * usable only if it has an `expires` timestamp that is still in the future
 * (with leeway). Sessions with no expiry are legacy non-expiring tokens that
 * Shopify will reject — they must be re-minted via token exchange.
 */
export function accessTokenNeedsRefresh(session) {
  if (!session) return true;
  return isPast(session.expires, REFRESH_LEEWAY_MS);
}

async function persist(session) {
  await shopify.config.sessionStorage.storeSession(session);
}

function logSession(reason, session) {
  const expires = session.expires
    ? new Date(session.expires).toISOString()
    : "n/a";
  const rtExpires = session.refreshTokenExpires
    ? new Date(session.refreshTokenExpires).toISOString()
    : "n/a";
  console.log(
    `[token-exchange] ${reason} offline token for ${session.shop} (access expires ${expires}, refresh expires ${rtExpires})`
  );
}

/**
 * Renew an offline access token using the stored refresh token. Use this from
 * non-embedded contexts (webhook handlers, scheduled jobs) where no App Bridge
 * session-token JWT is available.
 *
 * Returns the live `Session` (or null if the refresh token is missing/expired,
 * in which case the merchant has to re-open the app to mint a new one).
 */
export async function refreshOfflineToken(shop) {
  const offlineSessionId = shopify.api.session.getOfflineId(shop);
  const stored = await shopify.config.sessionStorage.loadSession(offlineSessionId);
  if (!stored?.refreshToken) return null;
  if (isPast(stored.refreshTokenExpires)) return null;

  const { session } = await shopify.api.auth.refreshToken({
    shop,
    refreshToken: stored.refreshToken,
  });

  await persist(session);
  logSession("refresh-token renewed", session);
  return session;
}

/**
 * Mint or refresh an expiring offline access token via token exchange whenever
 * the embedded frontend hits `/api/*` with a session-token JWT.
 *
 * @see https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/offline-access-tokens
 */
export default async function ensureOfflineToken(req, res, next) {
  try {
    const bearer = readBearer(req);
    if (!bearer) return next();

    let payload;
    try {
      payload = await shopify.api.session.decodeSessionToken(bearer);
    } catch {
      return next();
    }

    const shop = shopFromPayload(payload);
    if (!shop) return next();

    const offlineSessionId = shopify.api.session.getOfflineId(shop);
    const stored = await shopify.config.sessionStorage.loadSession(offlineSessionId);

    if (!accessTokenNeedsRefresh(stored)) {
      return next();
    }

    const reason = !stored
      ? "minted"
      : expiresAtMs(stored.expires) == null
        ? "upgraded-legacy"
        : "refreshed";

    const { session } = await shopify.api.auth.tokenExchange({
      shop,
      sessionToken: bearer,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
      expiring: true,
    });

    await persist(session);
    logSession(reason, session);

    return next();
  } catch (err) {
    console.log(`[token-exchange] failed: ${err.message}`);
    return next();
  }
}
