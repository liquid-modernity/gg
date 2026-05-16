# Discovery root first-render fix

Replace these files in the same paths:

- `src/js/gg-app.source.js`
- `qa/discovery-contract-guard.mjs`
- `__gg/assets/js/gg-app.dev.js`
- `__gg/assets/js/gg-app.min.js`
- `dist/assets/js/gg-app.dev.js`
- `dist/assets/js/gg-app.min.js`

## What this fixes

The previous patch still allowed `/` to open Discovery before rendering rows because `launchDiscovery()` waited for `ensureDiscoveryIndex()`, and `ensureDiscoveryIndex()` could return the async feed fetch when there were no local listing rows.

This patch changes root Global Discovery so it renders synchronously from the static Global base items first:

- Home
- Blog
- Store
- Contact
- landing sections
- actions

The Blogger feed still enhances articles/topics asynchronously after the sheet opens.

It also resets dock Search launches to the `All` filter, so static route/section/action items cannot be hidden by a stale `Articles` tab.

## Required verification

Run:

```bash
npm run gaga:verify-discovery-contract
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run ci:cloudflare
```

Then hard-refresh or clear site/service-worker cache and manually verify:

- `/` -> Search -> results must show immediately, even before articles load.
- `/landing` -> Search -> still shows Global Discovery.
- `/store` -> Search -> still shows Store Discovery.

If `/` is still blank after this replacement, test in a private window or unregister the service worker, because the stale asset may still be cached by the browser.
