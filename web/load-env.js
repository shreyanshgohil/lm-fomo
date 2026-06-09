/**
 * Load .env before any module reads process.env.
 * Searches repo root (../.env) then web/.env.
 * Does not override variables already set by Shopify CLI (`shopify app dev`).
 */
import dotenv from "dotenv";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootEnv = join(__dirname, "..", ".env");
const localEnv = join(__dirname, ".env");

/** Set by Shopify CLI during `shopify app dev` — must not be overwritten from .env */
const CLI_PRESERVED_KEYS = new Set([
  "HOST",
  "SHOPIFY_API_SECRET",
  "SCOPES",
  "BACKEND_PORT",
  "FRONTEND_PORT",
  "PORT",
]);

function loadEnvFile(path, { override = false } = {}) {
  if (!existsSync(path)) {
    return;
  }

  const result = dotenv.config({ path, override: false });
  if (result.error) {
    console.warn(`[env] Could not load ${path}:`, result.error.message);
    return;
  }

  for (const [key, value] of Object.entries(result.parsed ?? {})) {
    if (CLI_PRESERVED_KEYS.has(key) && process.env[key]) {
      continue;
    }
    if (override || !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(rootEnv);
loadEnvFile(localEnv, { override: true });
