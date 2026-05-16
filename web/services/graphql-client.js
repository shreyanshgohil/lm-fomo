import shopify from "../shopify.js";

const MAX_RETRIES = 6;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoffMs(attempt) {
  return Math.min(250 * 2 ** attempt, 5000);
}

function isThrottledError(error) {
  const message = error?.message || "";
  const statusCode = error?.response?.status;
  const graphQLErrors = error?.response?.errors;

  if (statusCode === 429 || message.includes("429")) {
    return true;
  }

  if (message.toUpperCase().includes("THROTTLED")) {
    return true;
  }

  return Array.isArray(graphQLErrors)
    ? graphQLErrors.some((entry) =>
        String(entry?.message || "")
          .toUpperCase()
          .includes("THROTTLED")
      )
    : false;
}

async function handleThrottlePause(response) {
  const throttle = response?.extensions?.cost?.throttleStatus;

  if (!throttle) {
    return;
  }

  const currentlyAvailable = throttle.currentlyAvailable ?? 1000;
  const restoreRate = throttle.restoreRate ?? 50;
  const minimumBudget = 80;

  if (currentlyAvailable >= minimumBudget) {
    return;
  }

  const deficit = minimumBudget - currentlyAvailable;
  const waitMs = Math.ceil((deficit / restoreRate) * 1000);
  if (waitMs > 0) {
    await sleep(waitMs);
  }
}

export async function requestGraphQL(session, query, variables = {}, attempt = 0) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    const response = await client.request(query, { variables });
    await handleThrottlePause(response);
    return response;
  } catch (error) {
    if (attempt < MAX_RETRIES && isThrottledError(error)) {
      await sleep(getBackoffMs(attempt));
      return requestGraphQL(session, query, variables, attempt + 1);
    }

    throw error;
  }
}
