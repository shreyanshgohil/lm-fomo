import {
  METAFIELD_NAMESPACE,
  METAFIELD_ONBOARDING_COMPLETED,
  THEME_APP_BLOCK_HANDLE,
} from "../constants.js";
import { requestGraphQL } from "./graphql-client.js";

const SHOP_ONBOARDING_QUERY = `
  query ShopOnboarding {
    shop {
      id
      onboardingCompleted: metafield(
        namespace: "${METAFIELD_NAMESPACE}"
        key: "${METAFIELD_ONBOARDING_COMPLETED}"
      ) {
        value
      }
    }
  }
`;

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

function parseOnboardingCompleted(rawValue) {
  if (rawValue == null || rawValue === "") {
    return false;
  }
  if (typeof rawValue === "boolean") {
    return rawValue;
  }
  const normalized = String(rawValue).trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

/**
 * Deep link to the product template in the theme editor with the Fomo app block.
 *
 * @param {string} shop
 * @returns {string}
 */
export function getProductTemplateThemeEditorUrl(shop) {
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  const params = new URLSearchParams({
    template: "product",
    addAppBlockId: `${apiKey}/${THEME_APP_BLOCK_HANDLE}`,
    target: "newAppsSection",
  });

  return `https://${shop}/admin/themes/current/editor?${params.toString()}`;
}

async function getShopId(session) {
  const response = await requestGraphQL(session, SHOP_ONBOARDING_QUERY);
  const shopId = response.data?.shop?.id;
  if (!shopId) {
    throw new Error("Could not resolve shop id");
  }
  return shopId;
}

/**
 * @param {import("@shopify/shopify-api").Session} session
 */
export async function getOnboardingStatus(session) {
  const response = await requestGraphQL(session, SHOP_ONBOARDING_QUERY);
  const rawValue = response.data?.shop?.onboardingCompleted?.value;

  return {
    completed: parseOnboardingCompleted(rawValue),
    themeEditorUrl: getProductTemplateThemeEditorUrl(session.shop),
  };
}

/**
 * @param {import("@shopify/shopify-api").Session} session
 */
export async function completeOnboarding(session) {
  const shopId = await getShopId(session);

  const response = await requestGraphQL(session, METAFIELDS_SET_MUTATION, {
    metafields: [
      {
        ownerId: shopId,
        namespace: METAFIELD_NAMESPACE,
        key: METAFIELD_ONBOARDING_COMPLETED,
        type: "boolean",
        value: "true",
      },
    ],
  });

  const userErrors = response.data?.metafieldsSet?.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((entry) => entry.message).join("; "));
  }

  return { completed: true };
}
