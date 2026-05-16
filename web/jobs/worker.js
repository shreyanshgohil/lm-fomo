import cron from "node-cron";
import shopify from "../shopify.js";
import { getCollection } from "../db.js";
import {
  JOB_TYPES,
  claimNextJob,
  completeJob,
  enqueueJob,
  enqueueUniqueJob,
  failJob,
} from "./queue.js";
import {
  processOrderCreated,
  runFullSalesSync,
  runLast24hSync,
} from "../services/sales-sync.js";

let workerStarted = false;
let isProcessing = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadOfflineSession(shop) {
  const sessionId = shopify.api.session.getOfflineId(shop);
  return shopify.config.sessionStorage.loadSession(sessionId);
}

async function processJob(job) {
  const session = await loadOfflineSession(job.shop);
  if (!session) {
    throw new Error(`No offline session found for shop ${job.shop}`);
  }

  if (job.type === JOB_TYPES.FULL_SYNC) {
    await runFullSalesSync(job.shop, session);
    return;
  }

  if (job.type === JOB_TYPES.LAST_24H_SYNC) {
    await runLast24hSync(job.shop, session);
    return;
  }

  if (job.type === JOB_TYPES.ORDER_CREATED) {
    await processOrderCreated(job.shop, job.payload, session);
    return;
  }

  throw new Error(`Unsupported job type ${job.type}`);
}

async function pollQueue() {
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  try {
    while (true) {
      const job = await claimNextJob();
      if (!job) {
        break;
      }

      try {
        await processJob(job);
        await completeJob(job._id);
      } catch (error) {
        await failJob(job, error);
      }
    }
  } finally {
    isProcessing = false;
  }
}

export async function registerShop(shop) {
  const shops = await getCollection("shops");
  await shops.updateOne(
    { shop },
    { $set: { shop, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function enqueueFullSync(shop) {
  await enqueueUniqueJob(shop, JOB_TYPES.FULL_SYNC);
}

export async function enqueueOrderCreated(shop, payload) {
  await enqueueJob({
    shop,
    type: JOB_TYPES.ORDER_CREATED,
    payload,
    maxAttempts: 8,
  });
}

export async function enqueueLast24hSync(shop) {
  await enqueueUniqueJob(shop, JOB_TYPES.LAST_24H_SYNC);
}

async function enqueueDailyJobsForAllShops() {
  const shops = await getCollection("shops");
  const records = await shops.find({}, { projection: { _id: 0, shop: 1 } }).toArray();

  for (const record of records) {
    await enqueueLast24hSync(record.shop);
    await sleep(50);
  }
}

export function startCronJobs() {
  if (!workerStarted) {
    workerStarted = true;
    setInterval(() => {
      pollQueue().catch((error) => {
        console.error("Queue poll failed", error);
      });
    }, 2000);
  }

  // Every 24 hours at midnight server time, recompute the rolling 24h value from created_at.
  cron.schedule("0 0 * * *", () => {
    enqueueDailyJobsForAllShops().catch((error) => {
      console.error("Failed to enqueue daily 24h sync jobs", error);
    });
  });
}
