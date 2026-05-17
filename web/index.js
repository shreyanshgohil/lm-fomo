// @ts-check
import "./load-env.js";
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import { CoreWebhookHandlers } from "./webhooks/index.js";
import { patchWebhookRegister } from "./webhooks/safe-register.js";
import { startJobWorker } from "./jobs/worker.js";
import { runPostAuthInstall } from "./install.js";
import { registerWidgetSettingsRoutes } from "./routes/widget-settings.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

// OAuth registers core webhooks only (orders/create is deferred — see register-orders.js).
patchWebhookRegister(shopify);
shopify.api.webhooks.addHandlers(CoreWebhookHandlers);

const app = express();

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async (req, res, next) => {
    const session = res.locals.shopify?.session;
    if (session) {
      try {
        await runPostAuthInstall(shopify, session);
      } catch (error) {
        console.error(
          `[${session.shop}] Post-auth install failed:`,
          error.message
        );
      }
    }
    return shopify.redirectToShopifyOrAppRoot()(req, res, next);
  }
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: CoreWebhookHandlers })
);

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

registerWidgetSettingsRoutes(app);

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

await startJobWorker();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
