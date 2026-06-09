import { Agenda } from "agenda";
import {
  JOB_FULL_SHOP_SYNC,
  JOB_PROCESS_ORDER,
  JOB_SYNC_24H,
  JOB_SYNC_24H_ALL_SHOPS,
} from "../constants.js";

let agenda;

export async function getAgenda() {
  if (agenda) {
    return agenda;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }

  agenda = new Agenda({
    db: {
      address: mongoUri,
      collection: "agenda_jobs",
    },
    processEvery: "30 seconds",
    maxConcurrency: 3,
    defaultConcurrency: 1,
  });

  return agenda;
}

/**
 * @param {string} shop
 * @param {{ delayMs?: number }} [options]
 */
export async function enqueueFullShopSync(shop, options = {}) {
  const { delayMs = 0 } = options;
  const instance = await getAgenda();
  const runAt = new Date(Date.now() + delayMs);

  if (delayMs > 0) {
    await instance.schedule(runAt, JOB_FULL_SHOP_SYNC, { shop });
    return runAt;
  }

  await instance.now(JOB_FULL_SHOP_SYNC, { shop });
  return runAt;
}

export async function enqueueSync24h(shop) {
  const instance = await getAgenda();
  await instance.now(JOB_SYNC_24H, { shop });
}

export async function enqueueProcessOrder(shop, order) {
  const instance = await getAgenda();
  await instance.now(JOB_PROCESS_ORDER, { shop, order });
}

export { JOB_FULL_SHOP_SYNC, JOB_SYNC_24H, JOB_SYNC_24H_ALL_SHOPS, JOB_PROCESS_ORDER };
