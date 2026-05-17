import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

const parsedMongoUrl = new URL(MONGODB_URI);
const defaultDbName = parsedMongoUrl.pathname.replace("/", "") || "lm-fomo";
const MONGODB_DB = process.env.MONGODB_DB || defaultDbName;

let clientPromise;
let dbPromise;
let indexesReady = false;

async function getClient() {
  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}

async function ensureIndexes(db) {
  if (indexesReady) {
    return;
  }

  await Promise.all([
    db.collection("queue_jobs").createIndex({ status: 1, runAt: 1 }),
    db.collection("queue_jobs").createIndex({ shop: 1, status: 1 }),
    db.collection("queue_jobs").createIndex({ lockedAt: 1 }),
    db.collection("product_sales").createIndex(
      { shop: 1, productId: 1 },
      { unique: true }
    ),
    db.collection("processed_orders").createIndex(
      { shop: 1, orderId: 1 },
      { unique: true }
    ),
    db.collection("shops").createIndex({ shop: 1 }, { unique: true }),
  ]);

  indexesReady = true;
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = getClient().then((client) => client.db(MONGODB_DB));
  }

  const db = await dbPromise;
  await ensureIndexes(db);
  return db;
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}

export async function clearShopData(shop) {
  const db = await getDb();

  await Promise.all([
    db.collection("queue_jobs").deleteMany({ shop }),
    db.collection("product_sales").deleteMany({ shop }),
    db.collection("processed_orders").deleteMany({ shop }),
    db.collection("shops").deleteMany({ shop }),
  ]);
}
