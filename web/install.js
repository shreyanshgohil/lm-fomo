import { privacyTopics } from "@shopify/shopify-api";
import { FULL_SYNC_INSTALL_DELAY_MS } from "./constants.js";
import { getDb, upsertShop } from "./db.js";
import { enqueueFullShopSync } from "./jobs/queue.js";
import { sessionHasOrderScopes } from "./services/session-access.js";

/**
 * Runs after OAuth completes. Webhooks are already registered by the auth
 * callback; this verifies registration and starts the initial sales sync.
 *
 * @param {import("./shopify.js").default} shopify
 * @param {import("@shopify/shopify-api").Session} session
 */
export async function runPostAuthInstall(shopify, session) {
  const shop = session.shop;

  if (!session.isOnline) {
    logWebhookHandlers(shopify, shop);
  }

  await upsertShop(shop);

  if (!sessionHasOrderScopes(session)) {
    console.warn(
      `[${shop}] Session does not include read_orders yet — uninstall/re-install after scope changes.`
    );
  }

  const db = await getDb();
  const shopDoc = await db.collection("shops").findOne({ shop });

  if (!shopDoc?.initialSyncCompleted) {
    const runAt = await enqueueFullShopSync(shop, {
      delayMs: FULL_SYNC_INSTALL_DELAY_MS,
    });
    console.log(
      `[${shop}] Initial sales sync scheduled at ${runAt.toISOString()} (waits for session to be ready)`
    );
  }
}

/**
 * Webhooks are registered in the OAuth callback — only log status here (no second register call).
 *
 * @param {import("./shopify.js").default} shopify
 * @param {string} shop
 */
function logWebhookHandlers(shopify, shop) {
  const host = process.env.HOST;

  if (!host) {
    console.warn(
      `[${shop}] HOST is not set — webhook URLs cannot be built. Run via "shopify app dev".`
    );
    return;
  }

  const topics = shopify.api.webhooks
    .getTopicsAdded()
    .filter((topic) => !privacyTopics.includes(topic));

  console.log(`[${shop}] Webhook handlers ready: ${topics.join(", ") || "none"}`);
}
