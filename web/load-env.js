/**
 * Load .env before any module reads process.env.
 * Searches repo root (../.env) then web/.env.
 * Does not override variables already set (e.g. by Shopify CLI).
 */
import dotenv from "dotenv";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootEnv = join(__dirname, "..", ".env");
const localEnv = join(__dirname, ".env");

if (existsSync(rootEnv)) {
  const result = dotenv.config({ path: rootEnv });
  if (result.error) {
    console.warn(`[env] Could not load ${rootEnv}:`, result.error.message);
  }
}

if (existsSync(localEnv)) {
  const result = dotenv.config({ path: localEnv, override: true });
  if (result.error) {
    console.warn(`[env] Could not load ${localEnv}:`, result.error.message);
  }
}
