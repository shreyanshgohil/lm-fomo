import {
  getWidgetSettings,
  normalizeWidgetSettings,
  saveWidgetSettings,
} from "../services/widget-settings.js";

/**
 * @param {import("express").Express} app
 */
export function registerWidgetSettingsRoutes(app) {
  app.get("/api/widget-settings", async (_req, res) => {
    try {
      const session = res.locals.shopify.session;
      const settings = await getWidgetSettings(session);
      res.status(200).json({ settings });
    } catch (error) {
      console.error("GET /api/widget-settings failed:", error.message);
      res.status(500).json({
        error: "Could not load widget settings.",
        details: error.message,
      });
    }
  });

  app.put("/api/widget-settings", async (req, res) => {
    try {
      const session = res.locals.shopify.session;
      const normalized = normalizeWidgetSettings(req.body);

      if (!normalized) {
        res.status(400).json({
          error: "Invalid widget settings payload.",
        });
        return;
      }

      const settings = await saveWidgetSettings(session, normalized);
      res.status(200).json({ settings });
    } catch (error) {
      const status =
        error.message.includes("Select at least") ||
        error.message.includes("Hybrid minimum") ||
        error.message.includes("message translation") ||
        error.message.includes("language needs")
          ? 400
          : 500;

      if (status === 500) {
        console.error("PUT /api/widget-settings failed:", error.message);
      }

      res.status(status).json({
        error: error.message || "Could not save widget settings.",
      });
    }
  });
}
