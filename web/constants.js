/** App-owned product metafield keys (see shopify.app.toml). */
export const METAFIELD_NAMESPACE = "$app";
export const METAFIELD_TOTAL_SOLD = "total_sold";
export const METAFIELD_SOLD_LAST_24H = "sold_last_24h";
export const METAFIELD_WIDGET_SETTINGS = "widget_settings";
export const METAFIELD_ONBOARDING_COMPLETED = "onboarding_completed";

/** Theme app extension block handle (blocks/star_rating.liquid). */
export const THEME_APP_BLOCK_HANDLE = "star_rating";

export const ORDERS_PAGE_SIZE = 250;
export const LINE_ITEMS_PAGE_SIZE = 250;
export const METAFIELDS_SET_BATCH_SIZE = 25;

export const JOB_FULL_SHOP_SYNC = "full-shop-sync";
export const JOB_SYNC_24H = "sync-24h";
export const JOB_SYNC_24H_ALL_SHOPS = "sync-24h-all-shops";
export const JOB_PROCESS_ORDER = "process-order";

/** Every 5 minutes. Override with CRON_24H_SYNC (standard cron syntax). */
export const CRON_24H_SYNC = "*/5 * * * *";

export const GRAPHQL_THROTTLE_RESERVE = 100;
export const GRAPHQL_MAX_RETRIES = 8;

/** Wait after OAuth so the offline session is persisted before bulk sync. */
export const FULL_SYNC_INSTALL_DELAY_MS = 30_000;

/** Retry full sync after a 403 / missing orders access. */
export const FULL_SYNC_RETRY_DELAY_MS = 10 * 60 * 1000;
