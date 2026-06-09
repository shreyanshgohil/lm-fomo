import {
  METAFIELD_SOLD_LAST_24H,
  METAFIELD_TOTAL_SOLD,
} from "../constants.js";
import { persistProductSales } from "../db.js";
import { iterateOrders } from "./orders.js";
import { setProductMetafields } from "./metafields.js";

function mergeQuantityMaps(target, source) {
  for (const [productId, quantity] of source) {
    target.set(productId, (target.get(productId) ?? 0) + quantity);
  }
  return target;
}

export function aggregateOrderQuantities(orders) {
  const totals = new Map();

  for (const order of orders) {
    for (const lineItem of order.lineItems) {
      const productId = lineItem.product?.id;
      if (!productId) {
        continue;
      }

      const quantity = lineItem.quantity ?? 0;
      totals.set(productId, (totals.get(productId) ?? 0) + quantity);
    }
  }

  return totals;
}

async function fetchOrderQuantities(session, options = {}) {
  const totals = new Map();

  for await (const ordersPage of iterateOrders(session, options)) {
    mergeQuantityMaps(totals, aggregateOrderQuantities(ordersPage));
  }

  return totals;
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export async function syncFullShopSales(session, shop) {
  const totals = await fetchOrderQuantities(session);
  const last24h = await fetchOrderQuantities(session, {
    createdAfter: hoursAgo(24),
  });

  await setProductMetafields(session, totals, METAFIELD_TOTAL_SOLD);
  await setProductMetafields(session, last24h, METAFIELD_SOLD_LAST_24H);
  await persistProductSales(shop, totals, last24h);

  return { productCount: totals.size, last24hProductCount: last24h.size };
}

export async function syncLast24HoursSales(session, shop) {
  const last24h = await fetchOrderQuantities(session, {
    createdAfter: hoursAgo(24),
  });

  const { getProductSalesCollection } = await import("../db.js");
  const sales = await getProductSalesCollection();
  const rows = await sales.find({ shop }).toArray();

  const totals = new Map();
  const zeroOut = new Map();

  for (const row of rows) {
    totals.set(row.productId, row.totalSold ?? 0);
    if ((row.soldLast24h ?? 0) > 0 && !last24h.has(row.productId)) {
      zeroOut.set(row.productId, 0);
    }
  }

  if (zeroOut.size > 0) {
    await setProductMetafields(session, zeroOut, METAFIELD_SOLD_LAST_24H);
  }

  await setProductMetafields(session, last24h, METAFIELD_SOLD_LAST_24H);

  const merged24h = new Map(zeroOut);
  mergeQuantityMaps(merged24h, last24h);

  await persistProductSales(shop, totals, merged24h);

  return { productCount: last24h.size, zeroedCount: zeroOut.size };
}

export async function applyOrderToSales(session, shop, order) {
  const createdAt = new Date(order.createdAt);
  const within24h = createdAt >= hoursAgo(24);
  const quantities = aggregateOrderQuantities([order]);

  const { incrementProductSales } = await import("../db.js");
  const updates = [];

  for (const [productId, quantity] of quantities) {
    const doc = await incrementProductSales(shop, productId, {
      totalDelta: quantity,
      last24hDelta: within24h ? quantity : 0,
    });

    if (!doc) {
      continue;
    }

    updates.push({
      productId,
      totalSold: doc.totalSold ?? quantity,
      soldLast24h: doc.soldLast24h ?? (within24h ? quantity : 0),
    });
  }

  if (updates.length === 0) {
    return;
  }

  const totalMap = new Map();
  const last24Map = new Map();

  for (const entry of updates) {
    totalMap.set(entry.productId, entry.totalSold);
    last24Map.set(entry.productId, entry.soldLast24h);
  }

  await setProductMetafields(session, totalMap, METAFIELD_TOTAL_SOLD);
  await setProductMetafields(session, last24Map, METAFIELD_SOLD_LAST_24H);
}
