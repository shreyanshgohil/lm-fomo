import { LINE_ITEMS_PAGE_SIZE, ORDERS_PAGE_SIZE } from "../constants.js";
import { requestGraphQL } from "./graphql-client.js";

const ORDERS_QUERY = `
  query GetOrdersPage($first: Int!, $after: String, $query: String) {
    orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          createdAt
          lineItems(first: ${LINE_ITEMS_PAGE_SIZE}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                quantity
                product {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ORDER_LINE_ITEMS_QUERY = `
  query OrderLineItemsPage($id: ID!, $after: String) {
    order(id: $id) {
      lineItems(first: ${LINE_ITEMS_PAGE_SIZE}, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            quantity
            product {
              id
            }
          }
        }
      }
    }
  }
`;

function toSearchQuery(createdAfter) {
  if (!createdAfter) {
    return null;
  }

  return `created_at:>=${new Date(createdAfter).toISOString()}`;
}

function mapLineItemEdges(edges = []) {
  return edges.map((edge) => edge.node);
}

async function fetchRemainingLineItems(session, order) {
  const lineItems = mapLineItemEdges(order.lineItems?.edges);
  let hasNextPage = order.lineItems?.pageInfo?.hasNextPage;
  let cursor = order.lineItems?.pageInfo?.endCursor;

  while (hasNextPage) {
    const response = await requestGraphQL(session, ORDER_LINE_ITEMS_QUERY, {
      id: order.id,
      after: cursor,
    });

    const connection = response.data?.order?.lineItems;
    if (!connection) {
      break;
    }

    lineItems.push(...mapLineItemEdges(connection.edges));
    hasNextPage = connection.pageInfo?.hasNextPage;
    cursor = connection.pageInfo?.endCursor;
  }

  return lineItems;
}

async function normalizeOrder(session, order) {
  const needsPagination = order.lineItems?.pageInfo?.hasNextPage;
  const lineItems = needsPagination
    ? await fetchRemainingLineItems(session, order)
    : mapLineItemEdges(order.lineItems?.edges);

  return {
    id: order.id,
    createdAt: order.createdAt,
    lineItems,
  };
}

async function normalizeOrders(session, orders) {
  return Promise.all(orders.map((order) => normalizeOrder(session, order)));
}

export async function* iterateOrders(session, { createdAfter } = {}) {
  let hasNextPage = true;
  let cursor = null;
  const query = toSearchQuery(createdAfter);

  while (hasNextPage) {
    const response = await requestGraphQL(session, ORDERS_QUERY, {
      first: ORDERS_PAGE_SIZE,
      after: cursor,
      query,
    });

    const ordersConnection = response.data.orders;
    const edges = ordersConnection.edges || [];
    const rawOrders = edges.map((edge) => edge.node);

    if (rawOrders.length > 0) {
      const orders = await normalizeOrders(session, rawOrders);
      yield orders;
    }

    hasNextPage = ordersConnection.pageInfo.hasNextPage;
    cursor = ordersConnection.pageInfo.endCursor;
  }
}
