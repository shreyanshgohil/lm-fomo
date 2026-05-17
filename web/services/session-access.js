import { OrdersAccessError, isForbiddenError, ORDERS_ACCESS_HELP } from "./errors.js";

const ORDER_SCOPE_NAMES = ["read_orders", "read_all_orders"];

const ORDERS_PROBE_QUERY = `
  query OrdersAccessProbe {
    orders(first: 1, sortKey: CREATED_AT) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

export function parseScopes(scopeString) {
  return (scopeString || "")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export function sessionHasOrderScopes(session) {
  const granted = parseScopes(session.scope);
  return ORDER_SCOPE_NAMES.some((name) => granted.includes(name));
}

/**
 * Confirms the offline session can query orders before bulk sync.
 *
 * @param {import("../shopify.js").default} shopify
 * @param {import("@shopify/shopify-api").Session} session
 */
export async function assertOrdersAccess(shopify, session) {
  if (!sessionHasOrderScopes(session)) {
    throw new OrdersAccessError(
      `Session is missing order scopes (have: ${session.scope || "none"}). Uninstall and re-install the app after updating scopes in shopify.app.toml.`
    );
  }

  const client = new shopify.api.clients.Graphql({ session });

  try {
    await client.request(ORDERS_PROBE_QUERY);
  } catch (error) {
    if (isForbiddenError(error)) {
      throw new OrdersAccessError(ORDERS_ACCESS_HELP, { cause: error });
    }
    throw error;
  }
}
