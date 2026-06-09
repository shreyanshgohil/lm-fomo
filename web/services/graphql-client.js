import {
  GRAPHQL_MAX_RETRIES,
  GRAPHQL_THROTTLE_RESERVE,
} from "../constants.js";
import {
  isForbiddenError,
  OrdersAccessError,
  ORDERS_ACCESS_HELP,
} from "./errors.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getThrottleStatus(response) {
  return response?.extensions?.cost?.throttleStatus;
}

function getRequestedCost(response) {
  return response?.extensions?.cost?.requestedQueryCost ?? 0;
}

function isThrottled(response) {
  if (!response?.errors?.length) {
    return false;
  }

  return response.errors.some((error) => {
    const message = (error.message || "").toLowerCase();
    return message.includes("throttl") || message.includes("rate limit");
  });
}

async function waitForThrottle(response) {
  const throttle = getThrottleStatus(response);
  if (!throttle) {
    await sleep(1000);
    return;
  }

  const requested = getRequestedCost(response);
  const available = throttle.currentlyAvailable ?? 0;
  const restoreRate = throttle.restoreRate ?? 50;

  if (available >= requested + GRAPHQL_THROTTLE_RESERVE) {
    return;
  }

  const deficit =
    requested + GRAPHQL_THROTTLE_RESERVE - Math.max(available, 0);
  const waitMs = Math.ceil((deficit / restoreRate) * 1000) + 250;
  await sleep(waitMs);
}

async function getShopify() {
  const { default: shopify } = await import("../shopify.js");
  return shopify;
}

export async function requestGraphQL(session, query, variables = {}) {
  const shopify = await getShopify();
  const client = new shopify.api.clients.Graphql({ session });

  for (let attempt = 0; attempt < GRAPHQL_MAX_RETRIES; attempt++) {
    let response;

    try {
      response = await client.request(query, { variables });
    } catch (error) {
      if (isForbiddenError(error)) {
        throw new OrdersAccessError(ORDERS_ACCESS_HELP, { cause: error });
      }

      const status = error?.response?.code ?? error?.response?.status;
      if (status === 429 || status === 503) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
      throw error;
    }

    if (isThrottled(response)) {
      await waitForThrottle(response);
      continue;
    }

    await waitForThrottle(response);

    if (response?.errors?.length) {
      throw new Error(
        response.errors.map((entry) => entry.message).join("; ")
      );
    }

    return response;
  }

  throw new Error("GraphQL request failed after retries (rate limited)");
}
