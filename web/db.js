import { MongoClient } from "mongodb";

const DB_NAME = process.env.MONGODB_DB_NAME || "lm-fomo";

let client;
let db;

export async function connectDb() {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(DB_NAME);
  return db;
}

export async function getDb() {
  return connectDb();
}

export async function getShopsCollection() {
  const database = await getDb();
  return database.collection("shops");
}

export async function getProductSalesCollection() {
  const database = await getDb();
  return database.collection("product_sales");
}

let processedOrdersIndexReady = false;

async function ensureProcessedOrdersIndex() {
  if (processedOrdersIndexReady) {
    return;
  }

  const processed = await getProcessedOrdersCollection();
  await processed.createIndex({ shop: 1, orderId: 1 }, { unique: true });
  processedOrdersIndexReady = true;
}

export async function getProcessedOrdersCollection() {
  const database = await getDb();
  return database.collection("processed_orders");
}

/**
 * @returns {Promise<boolean>} true when this order was not processed before
 */
export async function claimOrderProcessed(shop, orderId) {
  if (!shop || !orderId) {
    return false;
  }

  await ensureProcessedOrdersIndex();
  const processed = await getProcessedOrdersCollection();

  try {
    await processed.insertOne({
      shop,
      orderId,
      processedAt: new Date(),
    });
    return true;
  } catch (error) {
    if (error?.code === 11000) {
      return false;
    }
    throw error;
  }
}

export async function upsertShop(shop) {
  const shops = await getShopsCollection();
  await shops.updateOne(
    { shop },
    { $set: { shop, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function removeShop(shop) {
  const shops = await getShopsCollection();
  const sales = await getProductSalesCollection();
  const processed = await getProcessedOrdersCollection();
  await Promise.all([
    shops.deleteOne({ shop }),
    sales.deleteMany({ shop }),
    processed.deleteMany({ shop }),
  ]);
}

export async function listInstalledShops() {
  const shops = await getShopsCollection();
  return shops.find({}).project({ shop: 1, _id: 0 }).toArray();
}

export async function persistProductSales(shop, totalsMap, last24hMap) {
  const sales = await getProductSalesCollection();
  const productIds = new Set([...totalsMap.keys(), ...last24hMap.keys()]);
  const now = new Date();

  const ops = [...productIds].map((productId) =>
    sales.updateOne(
      { shop, productId },
      {
        $set: {
          shop,
          productId,
          totalSold: totalsMap.get(productId) ?? 0,
          soldLast24h: last24hMap.get(productId) ?? 0,
          updatedAt: now,
        },
      },
      { upsert: true }
    )
  );

  if (ops.length > 0) {
    await Promise.all(ops);
  }
}

export async function incrementProductSales(
  shop,
  productId,
  { totalDelta = 0, last24hDelta = 0 }
) {
  const sales = await getProductSalesCollection();
  const update = { $set: { updatedAt: new Date() } };
  const inc = {};

  if (totalDelta) {
    inc.totalSold = totalDelta;
  }
  if (last24hDelta) {
    inc.soldLast24h = last24hDelta;
  }

  if (Object.keys(inc).length === 0) {
    return null;
  }

  update.$inc = inc;

  const result = await sales.findOneAndUpdate(
    { shop, productId },
    { ...update, $setOnInsert: { shop, productId } },
    { upsert: true, returnDocument: "after" }
  );

  return result;
}
