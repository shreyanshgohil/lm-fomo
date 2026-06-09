import "./load-env.js";
import { ApiVersion } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-07";

const mongoUrl = process.env.MONGODB_URI;
if (!mongoUrl) {
  throw new Error("MONGODB_URI environment variable is required");
}

const shopify = shopifyApp({
  api: {
    apiVersion: ApiVersion.July25,
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: undefined,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new MongoDBSessionStorage(mongoUrl),
});

// shopify-app-express still calls `api.webhooks.register({ session })` during the
// legacy OAuth callback. With declarative webhook subscriptions in shopify.app.toml
// (`use_legacy_install_flow = false`) Shopify rejects programmatic registration with
// 403. Webhook delivery is owned by Shopify; `processWebhooks` registers handlers.
shopify.api.webhooks.register = async () => ({});

export default shopify;
