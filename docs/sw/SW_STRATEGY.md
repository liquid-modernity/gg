# Service Worker Strategy
Last updated: 2026-02-05

## Goals
- DEV must never be controlled by a Service Worker.
- PROD can use SW with safe updates and offline fallback.
- `/assets/latest/*` must never be cached.
- `/assets/v/*` can be cached (immutable).
- Blogger comment endpoints must not be cached or intercepted beyond passthrough.

## DEV Mode Detection
- DEV is explicitly marked in `index.dev.xml`:
  - `<meta name='gg:mode' content='dev'/>`
- JS reads this marker and sets `GG_IS_DEV`.

## DEV Cleanup Routine (JS)
When DEV mode is detected on page load:
1) Unregister all service workers.
2) Delete caches with keys starting `gg-` or `workbox-`.
3) If the page is still controlled, do a one-time reload guarded by `sessionStorage` (`gg_dev_sw_cleaned`).
4) Log once: `GG DEV: SW & caches cleaned`.

## SW Fetch Rules (public/sw.js)
- `/assets/latest/*`: network-only (`cache: no-store`), never cached.
- `/assets/v/*` and `/gg-pwa-icon/*`: cache-first (immutable assets).
- `/manifest.webmanifest` and `/offline.html`: stale-while-revalidate.
- Navigations: network-first with offline fallback to `/offline.html`.
- Everything else (including Blogger comments endpoints): passthrough fetch with no caching.

## Verification (DevTools)
**DEV**
- Application → Service Workers: no active registrations after one reload.
- Application → Cache Storage: no `gg-*` or `workbox-*` caches after cleanup.
- Console: one line `GG DEV: SW & caches cleaned`.
- Network: `/assets/latest/main.js` shows `Cache-Control: no-store`.

**PROD**
- Application → Service Workers: `sw.js` registered and active.
- Offline test: go offline and reload a page → `/offline.html` is served.
- Assets: `/assets/v/<RELEASE_ID>/main.js` cached and `immutable`.
