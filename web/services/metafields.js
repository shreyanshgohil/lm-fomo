import { requestGraphQL } from "./graphql-client.js";

export const SALES_METAFIELD_NAMESPACE = "$app:fomo";
export const TOTAL_SOLD_KEY = "total_sold_count";
export const LAST_24H_KEY = "last_24h_sold_count";

const GET_PRODUCT_METAFIELD_DEFINITIONS = `
  query GetProductMetafieldDefinitions($namespace: String!, $first: Int!) {
    metafieldDefinitions(ownerType: PRODUCT, namespace: $namespace, first: $first) {
      edges {
        node {
          id
          key
          namespace
        }
      }
    }
  }
`;

const CREATE_METAFIELD_DEFINITION = `
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        key
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const SET_METAFIELDS = `
  mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function createDefinition(session, { key, name }) {
  const result = await requestGraphQL(session, CREATE_METAFIELD_DEFINITION, {
    definition: {
      ownerType: "PRODUCT",
      namespace: SALES_METAFIELD_NAMESPACE,
      key,
      type: "number_integer",
      name,
      description: `Auto-managed by app for ${name}`,
      pin: false,
      visibleToStorefrontApi: false,
    },
  });

  const userErrors = result.data.metafieldDefinitionCreate.userErrors || [];
  if (userErrors.length > 0) {
    const isAlreadyExists = userErrors.every((entry) =>
      String(entry.message || "").toLowerCase().includes("already")
    );

    if (!isAlreadyExists) {
      throw new Error(
        `Failed to create metafield definition ${key}: ${JSON.stringify(userErrors)}`
      );
    }
  }
}

export async function ensureProductSalesMetafields(session) {
  const response = await requestGraphQL(session, GET_PRODUCT_METAFIELD_DEFINITIONS, {
    namespace: SALES_METAFIELD_NAMESPACE,
    first: 50,
  });

  const existingKeys = new Set(
    (response.data.metafieldDefinitions.edges || []).map((edge) => edge.node.key)
  );

  const requiredDefinitions = [
    { key: TOTAL_SOLD_KEY, name: "Total sold count" },
    { key: LAST_24H_KEY, name: "Last 24h sold count" },
  ];

  for (const definition of requiredDefinitions) {
    if (!existingKeys.has(definition.key)) {
      await createDefinition(session, definition);
    }
  }
}

async function setCountsForKey(session, productCounts, key) {
  const inputs = Object.entries(productCounts).map(([productId, count]) => ({
    ownerId: productId,
    namespace: SALES_METAFIELD_NAMESPACE,
    key,
    type: "number_integer",
    value: String(Math.max(0, count ?? 0)),
  }));

  const grouped = chunk(inputs, 25);
  for (const group of grouped) {
    const response = await requestGraphQL(session, SET_METAFIELDS, {
      metafields: group,
    });

    const userErrors = response.data.metafieldsSet.userErrors || [];
    if (userErrors.length > 0) {
      throw new Error(`Failed to update metafields: ${JSON.stringify(userErrors)}`);
    }
  }
}

export async function updateProductSalesMetafields(session, totalCounts, last24hCounts) {
  const productIds = new Set([
    ...Object.keys(totalCounts || {}),
    ...Object.keys(last24hCounts || {}),
  ]);

  const totalPayload = {};
  const last24hPayload = {};

  for (const productId of productIds) {
    totalPayload[productId] = totalCounts?.[productId] ?? 0;
    last24hPayload[productId] = last24hCounts?.[productId] ?? 0;
  }

  await setCountsForKey(session, totalPayload, TOTAL_SOLD_KEY);
  await setCountsForKey(session, last24hPayload, LAST_24H_KEY);
}
