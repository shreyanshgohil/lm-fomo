import { getCollection } from "../db.js";
import { iterateOrders } from "./orders.js";
import {
  ensureProductSalesMetafields,
  updateProductSalesMetafields,
} from "./metafields.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function nowMinus24hIso() {
  return new Date(Date.now() - DAY_MS).toISOString();
}

function normalizeProductId(productId) {
  if (!productId) {
    return null;
  }

  if (String(productId).startsWith("gid://")) {
    return String(productId);
  }

  return `gid://shopify/Product/${productId}`;
}

function addToCountMap(counts, productId, quantity) {
  if (!productId || !Number.isFinite(quantity)) {
    return;
  }

  counts[productId] = (counts[productId] || 0) + quantity;
}

function buildCountsFromOrder(order, totalCounts, last24hCounts, now) {
  const createdAtMs = new Date(order.createdAt).getTime();
  const isWithin24h = now - createdAtMs <= DAY_MS;
  const lineItems = order.lineItems?.edges || [];

  for (const lineItemEdge of lineItems) {
    const lineItem = lineItemEdge.node;
    const productId = normalizeProductId(lineItem.product?.id);
    const quantity = Number(lineItem.quantity || 0);

    if (!productId || quantity <= 0) {
      continue;
    }

    addToCountMap(totalCounts, productId, quantity);
    if (isWithin24h) {
      addToCountMap(last24hCounts, productId, quantity);
    }
  }
}

async function upsertSalesSnapshot(shop, totalCounts, last24hCounts) {
  const salesCollection = await getCollection("product_sales");
  const now = new Date();
  const productIds = new Set([
    ...Object.keys(totalCounts || {}),
    ...Object.keys(last24hCounts || {}),
  ]);

  if (productIds.size === 0) {
    return;
  }

  const operations = [...productIds].map((productId) => ({
    updateOne: {
      filter: { shop, productId },
      update: {
        $set: {
          totalCount: totalCounts[productId] || 0,
          last24hCount: last24hCounts[productId] || 0,
          updatedAt: now,
        },
      },
      upsert: true,
    },
  }));

  await salesCollection.bulkWrite(operations, { ordered: false });
}

export async function runFullSalesSync(shop, session) {
  await ensureProductSalesMetafields(session);

  const totalCounts = {};
  const last24hCounts = {};
  const now = Date.now();

  for await (const orders of iterateOrders(session)) {
    for (const order of orders) {
      buildCountsFromOrder(order, totalCounts, last24hCounts, now);
    }
  }

  await upsertSalesSnapshot(shop, totalCounts, last24hCounts);
  await updateProductSalesMetafields(session, totalCounts, last24hCounts);
}

export async function runLast24hSync(shop, session) {
  await ensureProductSalesMetafields(session);

  const totalCounts = {};
  const last24hCounts = {};

  const salesCollection = await getCollection("product_sales");
  const existingDocs = await salesCollection
    .find({ shop }, { projection: { _id: 0, productId: 1, totalCount: 1 } })
    .toArray();

  for (const doc of existingDocs) {
    totalCounts[doc.productId] = doc.totalCount || 0;
    last24hCounts[doc.productId] = 0;
  }

  for await (const orders of iterateOrders(session, { createdAfter: nowMinus24hIso() })) {
    for (const order of orders) {
      buildCountsFromOrder(order, totalCounts, last24hCounts, Date.now());
    }
  }

  await upsertSalesSnapshot(shop, totalCounts, last24hCounts);
  await updateProductSalesMetafields(session, totalCounts, last24hCounts);
}

export async function processOrderCreated(shop, payload, session) {
  await ensureProductSalesMetafields(session);

  const orderId = String(payload?.id || payload?.admin_graphql_api_id || "");
  if (!orderId) {
    return;
  }

  const processedOrders = await getCollection("processed_orders");
  try {
    await processedOrders.insertOne({
      shop,
      orderId,
      createdAt: new Date(),
    });
  } catch (error) {
    if (String(error?.code) === "11000") {
      return;
    }
    throw error;
  }

  const createdAt = new Date(payload.created_at || payload.createdAt).getTime();
  const within24h = Date.now() - createdAt <= DAY_MS;
  const lineItems = payload?.line_items || [];

  const increments = {};
  const last24hIncrements = {};

  for (const lineItem of lineItems) {
    const productId = normalizeProductId(lineItem.product_id);
    const quantity = Number(lineItem.quantity || 0);

    if (!productId || quantity <= 0) {
      continue;
    }

    addToCountMap(increments, productId, quantity);
    if (within24h) {
      addToCountMap(last24hIncrements, productId, quantity);
    }
  }

  const affectedProductIds = Object.keys(increments);
  if (affectedProductIds.length === 0) {
    return;
  }

  const salesCollection = await getCollection("product_sales");
  const now = new Date();

  const operations = affectedProductIds.map((productId) => ({
    updateOne: {
      filter: { shop, productId },
      update: {
        $inc: {
          totalCount: increments[productId] || 0,
          last24hCount: last24hIncrements[productId] || 0,
        },
        $set: { updatedAt: now },
      },
      upsert: true,
    },
  }));

  await salesCollection.bulkWrite(operations, { ordered: false });

  const docs = await salesCollection
    .find(
      { shop, productId: { $in: affectedProductIds } },
      { projection: { _id: 0, productId: 1, totalCount: 1, last24hCount: 1 } }
    )
    .toArray();

  const totalCounts = {};
  const last24hCounts = {};
  for (const doc of docs) {
    totalCounts[doc.productId] = doc.totalCount || 0;
    last24hCounts[doc.productId] = doc.last24hCount || 0;
  }

  await updateProductSalesMetafields(session, totalCounts, last24hCounts);
}
