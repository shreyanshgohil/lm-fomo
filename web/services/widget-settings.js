import {
  METAFIELD_NAMESPACE,
  METAFIELD_WIDGET_SETTINGS,
} from "../constants.js";
import { requestGraphQL } from "./graphql-client.js";

const DEFAULT_MESSAGE_TEMPLATE =
  "{{count}} people bought this in the last 24 hours";

export const DEFAULT_WIDGET_SETTINGS = {
  fomoMode: "last_24_hours",
  messageTranslations: [{ locale: "en", text: DEFAULT_MESSAGE_TEMPLATE }],
  pulseColor: "#008060",
  backgroundColor: "#FFFFFF",
  borderEnabled: false,
  borderColor: "#E1E3E5",
  borderRadius: 6,
  productScope: "all_products",
  selectedProducts: [],
  hybridMin: 5,
  hybridMax: 25,
  hybridTtl: 60,
};

const FOMO_MODES = new Set([
  "last_24_hours",
  "total_sold",
  "hybrid_randomized",
]);
const PRODUCT_SCOPES = new Set(["all_products", "selected_products"]);

const BORDER_RADIUS_MIN = 0;
const BORDER_RADIUS_MAX = 32;

function normalizeBorderRadius(value) {
  const radius = Number(value);
  if (!Number.isFinite(radius)) {
    return DEFAULT_WIDGET_SETTINGS.borderRadius;
  }
  return Math.min(
    BORDER_RADIUS_MAX,
    Math.max(BORDER_RADIUS_MIN, Math.round(radius))
  );
}

const SHOP_WIDGET_SETTINGS_QUERY = `
  query ShopWidgetSettings {
    shop {
      id
      widgetSettings: metafield(namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_WIDGET_SETTINGS}") {
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

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSelectedProducts(products) {
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .filter((product) => product && typeof product.id === "string")
    .map((product) => ({
      id: product.id,
      title: typeof product.title === "string" ? product.title : "",
      ...(typeof product.imageUrl === "string"
        ? { imageUrl: product.imageUrl }
        : {}),
      ...(typeof product.handle === "string" ? { handle: product.handle } : {}),
    }));
}

function normalizeMessageTranslations(translations) {
  if (!Array.isArray(translations)) {
    return DEFAULT_WIDGET_SETTINGS.messageTranslations;
  }

  const normalized = translations
    .filter(
      (entry) =>
        entry &&
        typeof entry.locale === "string" &&
        typeof entry.text === "string"
    )
    .map((entry) => ({
      locale: entry.locale.trim(),
      text: entry.text,
    }))
    .filter((entry) => entry.locale.length > 0);

  return normalized.length > 0
    ? normalized
    : DEFAULT_WIDGET_SETTINGS.messageTranslations;
}

/**
 * @param {unknown} input
 * @returns {typeof DEFAULT_WIDGET_SETTINGS | null}
 */
export function normalizeWidgetSettings(input) {
  if (!isPlainObject(input)) {
    return null;
  }

  const fomoMode = FOMO_MODES.has(input.fomoMode)
    ? input.fomoMode
    : DEFAULT_WIDGET_SETTINGS.fomoMode;

  const productScope = PRODUCT_SCOPES.has(input.productScope)
    ? input.productScope
    : DEFAULT_WIDGET_SETTINGS.productScope;

  const hybridMin = Number(input.hybridMin);
  const hybridMax = Number(input.hybridMax);
  const hybridTtl = Number(input.hybridTtl);

  return {
    fomoMode,
    messageTranslations: normalizeMessageTranslations(
      input.messageTranslations
    ),
    pulseColor:
      typeof input.pulseColor === "string" && input.pulseColor.trim()
        ? input.pulseColor.trim()
        : DEFAULT_WIDGET_SETTINGS.pulseColor,
    backgroundColor:
      typeof input.backgroundColor === "string" && input.backgroundColor.trim()
        ? input.backgroundColor.trim()
        : DEFAULT_WIDGET_SETTINGS.backgroundColor,
    borderEnabled: input.borderEnabled === true,
    borderColor:
      typeof input.borderColor === "string" && input.borderColor.trim()
        ? input.borderColor.trim()
        : DEFAULT_WIDGET_SETTINGS.borderColor,
    borderRadius: normalizeBorderRadius(input.borderRadius),
    productScope,
    selectedProducts: normalizeSelectedProducts(input.selectedProducts),
    hybridMin: Number.isFinite(hybridMin)
      ? hybridMin
      : DEFAULT_WIDGET_SETTINGS.hybridMin,
    hybridMax: Number.isFinite(hybridMax)
      ? hybridMax
      : DEFAULT_WIDGET_SETTINGS.hybridMax,
    hybridTtl: Number.isFinite(hybridTtl) && hybridTtl > 0
      ? hybridTtl
      : DEFAULT_WIDGET_SETTINGS.hybridTtl,
  };
}

/**
 * @param {typeof DEFAULT_WIDGET_SETTINGS} settings
 * @returns {string | null}
 */
export function validateWidgetSettings(settings) {
  if (
    settings.productScope === "selected_products" &&
    settings.selectedProducts.length === 0
  ) {
    return "Select at least one product, or switch to all products.";
  }

  if (settings.hybridMin > settings.hybridMax) {
    return "Hybrid minimum must be less than or equal to maximum.";
  }

  if (settings.messageTranslations.length === 0) {
    return "Add at least one message translation.";
  }

  const emptyMessage = settings.messageTranslations.find(
    (entry) => !entry.text.trim()
  );
  if (emptyMessage) {
    return "Each language needs message text.";
  }

  return null;
}

function mergeWithDefaults(stored) {
  const normalized = normalizeWidgetSettings(stored);
  if (!normalized) {
    return { ...DEFAULT_WIDGET_SETTINGS };
  }

  return {
    ...DEFAULT_WIDGET_SETTINGS,
    ...normalized,
    messageTranslations:
      normalized.messageTranslations.length > 0
        ? normalized.messageTranslations
        : DEFAULT_WIDGET_SETTINGS.messageTranslations,
  };
}

async function getShopId(session) {
  const response = await requestGraphQL(session, SHOP_WIDGET_SETTINGS_QUERY);
  const shopId = response.data?.shop?.id;
  if (!shopId) {
    throw new Error("Could not resolve shop id");
  }
  return shopId;
}

/**
 * @param {import("@shopify/shopify-api").Session} session
 */
export async function getWidgetSettings(session) {
  const response = await requestGraphQL(session, SHOP_WIDGET_SETTINGS_QUERY);
  const rawValue = response.data?.shop?.widgetSettings?.value;

  if (!rawValue) {
    return { ...DEFAULT_WIDGET_SETTINGS };
  }

  try {
    const parsed = JSON.parse(rawValue);
    return mergeWithDefaults(parsed);
  } catch {
    return { ...DEFAULT_WIDGET_SETTINGS };
  }
}

/**
 * @param {import("@shopify/shopify-api").Session} session
 * @param {typeof DEFAULT_WIDGET_SETTINGS} settings
 */
export async function saveWidgetSettings(session, settings) {
  const validationError = validateWidgetSettings(settings);
  if (validationError) {
    throw new Error(validationError);
  }

  const shopId = await getShopId(session);
  const value = JSON.stringify(settings);

  const response = await requestGraphQL(session, METAFIELDS_SET_MUTATION, {
    metafields: [
      {
        ownerId: shopId,
        namespace: METAFIELD_NAMESPACE,
        key: METAFIELD_WIDGET_SETTINGS,
        type: "json",
        value,
      },
    ],
  });

  const userErrors = response.data?.metafieldsSet?.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((entry) => entry.message).join("; "));
  }

  return settings;
}
