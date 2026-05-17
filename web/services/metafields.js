import {
  METAFIELD_NAMESPACE,
  METAFIELDS_SET_BATCH_SIZE,
} from "../constants.js";
import { requestGraphQL } from "./graphql-client.js";

const METAFIELDS_SET_MUTATION = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function toMetafieldInputs(productQuantities, key) {
  return [...productQuantities.entries()].map(([productId, quantity]) => ({
    ownerId: productId,
    namespace: METAFIELD_NAMESPACE,
    key,
    type: "number_integer",
    value: String(Math.max(0, Math.floor(quantity))),
  }));
}

export async function setProductMetafields(session, productQuantities, key) {
  if (productQuantities.size === 0) {
    return;
  }

  const inputs = toMetafieldInputs(productQuantities, key);

  for (let i = 0; i < inputs.length; i += METAFIELDS_SET_BATCH_SIZE) {
    const batch = inputs.slice(i, i + METAFIELDS_SET_BATCH_SIZE);
    const response = await requestGraphQL(session, METAFIELDS_SET_MUTATION, {
      metafields: batch,
    });

    const userErrors = response.data?.metafieldsSet?.userErrors ?? [];
    if (userErrors.length > 0) {
      throw new Error(
        userErrors.map((entry) => entry.message).join("; ")
      );
    }
  }
}
