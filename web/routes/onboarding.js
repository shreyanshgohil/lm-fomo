import {
  completeOnboarding,
  getOnboardingStatus,
} from "../services/onboarding.js";

/**
 * @param {import("express").Express} app
 */
export function registerOnboardingRoutes(app) {
  app.get("/api/onboarding", async (_req, res) => {
    try {
      const session = res.locals.shopify.session;
      const status = await getOnboardingStatus(session);
      res.status(200).json(status);
    } catch (error) {
      console.error("GET /api/onboarding failed:", error.message);
      res.status(500).json({
        error: "Could not load onboarding status.",
        details: error.message,
      });
    }
  });

  app.post("/api/onboarding/complete", async (_req, res) => {
    try {
      const session = res.locals.shopify.session;
      const result = await completeOnboarding(session);
      res.status(200).json(result);
    } catch (error) {
      console.error("POST /api/onboarding/complete failed:", error.message);
      res.status(500).json({
        error: "Could not save onboarding status.",
        details: error.message,
      });
    }
  });
}
