# Environment variables

## Admin API (web server & background jobs)

| Variable | Purpose |
|----------|---------|
| `SHOPIFY_API_KEY` | App client ID (from Dev Dashboard → Settings) |
| `SHOPIFY_API_SECRET` | App client secret |
| `MONGODB_URI` | Session storage and app data |
| `SHOPIFY_AUTH_MODE` | `oauth` (default) or `client_credentials` |

### OAuth mode (default)

Merchants install the app; offline tokens are stored in MongoDB. On install, legacy non-expiring tokens are upgraded to expiring tokens. While the embedded admin is open, `/api/*` requests mint or refresh the offline token via token exchange; background jobs refresh using the stored refresh token.

### Client credentials mode

For **same-organization** Dev Dashboard stores only. Background jobs exchange client ID + secret for a ~24h access token (refreshed automatically). The embedded admin UI still uses OAuth via App Bridge.

```bash
SHOPIFY_AUTH_MODE=client_credentials
SHOPIFY_API_KEY=your-client-id
SHOPIFY_API_SECRET=your-client-secret
```

Install the app on the dev store first. The store must appear under **Dev stores** in the same org as the app.

## App Automation Token (`atkn_...`)

**Not used for Admin API or this web server.**

Use `SHOPIFY_APP_AUTOMATION_TOKEN` only in CI/CD for non-interactive CLI:

```bash
export SHOPIFY_APP_AUTOMATION_TOKEN=atkn_...
shopify app deploy --allow-updates
```

[Manage App Automation Tokens](https://shopify.dev/docs/apps/build/dev-dashboard/app-automation-tokens)

## Troubleshooting: "Invalid OAuth callback"

This almost always means **HMAC verification failed** (wrong `SHOPIFY_API_SECRET`), not a state mismatch.

1. **Remove `SHOPIFY_API_SECRET` from `.env`** when using `shopify app dev` — the CLI injects the current secret.
2. Restart: stop the dev server, run `shopify app dev` again, open the app from the CLI preview link (do not reuse an old callback URL in the browser).
3. If you run the backend without the CLI, copy the secret from Dev Dashboard → Settings and set `SHOPIFY_API_SECRET` once (rotate if it was ever committed).
