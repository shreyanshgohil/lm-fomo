import {
  CRON_24H_SYNC,
  FULL_SYNC_RETRY_DELAY_MS,
  JOB_FULL_SHOP_SYNC,
  JOB_PROCESS_ORDER,
  JOB_SYNC_24H,
  JOB_SYNC_24H_ALL_SHOPS,
} from "../constants.js";
import { connectDb, listInstalledShops } from "../db.js";
import { getAgenda } from "./queue.js";
import { isOrdersAccessError } from "../services/errors.js";
import { assertOrdersAccess } from "../services/session-access.js";
import { registerOrdersWebhooks } from "../webhooks/register-orders.js";
import {
  applyOrderToSales,
  syncFullShopSales,
  syncLast24HoursSales,
} from "../services/sales-sync.js";

async function getShopify() {
  const { default: shopify } = await import("../shopify.js");
  return shopify;
}

async function loadOfflineSession(shop) {
  const shopify = await getShopify();
  const sessions = await shopify.config.sessionStorage.findSessionsByShop(shop);
  const offline =
    sessions.find((session) => session.isOnline === false) ?? sessions[0];

  if (!offline) {
    throw new Error(`No session found for shop: ${shop}`);
  }

  return offline;
}

async function scheduleFullSyncRetry(agenda, shop) {
  const runAt = new Date(Date.now() + FULL_SYNC_RETRY_DELAY_MS);
  await agenda.schedule(runAt, JOB_FULL_SHOP_SYNC, { shop });
  return runAt;
}

export async function startJobWorker() {
  await connectDb();
  const agenda = await getAgenda();

  agenda.define(JOB_FULL_SHOP_SYNC, { concurrency: 1 }, async (job) => {
    const { shop } = job.attrs.data;

    try {
      const shopify = await getShopify();
      const session = await loadOfflineSession(shop);
      await assertOrdersAccess(shopify, session);
      await registerOrdersWebhooks(shopify, session);

      const result = await syncFullShopSales(session, shop);
      const database = await connectDb();
      await database.collection("shops").updateOne(
        { shop },
        {
          $set: {
            initialSyncCompleted: true,
            ordersAccessOk: true,
            updatedAt: new Date(),
          },
          $unset: { ordersAccessError: "" },
        }
      );
      console.log(`[${shop}] Full sales sync complete`, result);
    } catch (error) {
      if (isOrdersAccessError(error)) {
        const database = await connectDb();
        const retryAt = await scheduleFullSyncRetry(agenda, shop);
        await database.collection("shops").updateOne(
          { shop },
          {
            $set: {
              ordersAccessOk: false,
              ordersAccessError: error.message,
              updatedAt: new Date(),
            },
          }
        );
        console.error(`[${shop}] Orders access blocked: ${error.message}`);
        console.error(
          `[${shop}] Full sync will retry at ${retryAt.toISOString()}`
        );
        return;
      }

      throw error;
    }
  });

  agenda.define(JOB_SYNC_24H, { concurrency: 1 }, async (job) => {
    const { shop } = job.attrs.data;

    try {
      const shopify = await getShopify();
      const session = await loadOfflineSession(shop);
      await assertOrdersAccess(shopify, session);
      const result = await syncLast24HoursSales(session, shop);
      console.log(`[${shop}] 24h sales sync complete`, result);
    } catch (error) {
      if (isOrdersAccessError(error)) {
        console.error(`[${shop}] 24h sync skipped — orders access: ${error.message}`);
        return;
      }
      throw error;
    }
  });

  agenda.define(JOB_SYNC_24H_ALL_SHOPS, { concurrency: 1 }, async () => {
    const shops = await listInstalledShops();
    for (const { shop } of shops) {
      await agenda.now(JOB_SYNC_24H, { shop });
    }
    console.log(`Scheduled 24h sync for ${shops.length} shop(s)`);
  });

  agenda.define(JOB_PROCESS_ORDER, { concurrency: 2 }, async (job) => {
    const { shop, order } = job.attrs.data;

    try {
      const session = await loadOfflineSession(shop);
      await applyOrderToSales(session, shop, order);
      console.log(`[${shop}] Processed order ${order.id}`);
    } catch (error) {
      if (isOrdersAccessError(error)) {
        console.error(
          `[${shop}] Order webhook skipped — orders access: ${error.message}`
        );
        return;
      }
      throw error;
    }
  });

  await agenda.start();
  await agenda.every(CRON_24H_SYNC, JOB_SYNC_24H_ALL_SHOPS, null, {
    timezone: process.env.CRON_TZ || undefined,
  });

  console.log(`Agenda worker started (24h cron: ${CRON_24H_SYNC})`);
}
