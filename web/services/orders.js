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
          lineItems(first: 250) {
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

function toSearchQuery(createdAfter) {
  if (!createdAfter) {
    return null;
  }

  return `created_at:>=${new Date(createdAfter).toISOString()}`;
}

export async function* iterateOrders(session, { createdAfter } = {}) {
  let hasNextPage = true;
  let cursor = null;
  const query = toSearchQuery(createdAfter);

  while (hasNextPage) {
    const response = await requestGraphQL(session, ORDERS_QUERY, {
      first: 250,
      after: cursor,
      query,
    });

    const ordersConnection = response.data.orders;
    const edges = ordersConnection.edges || [];
    const orders = edges.map((edge) => edge.node);

    if (orders.length > 0) {
      yield orders;
    }

    hasNextPage = ordersConnection.pageInfo.hasNextPage;
    cursor = ordersConnection.pageInfo.endCursor;
  }
}
