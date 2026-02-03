# X-045 Report

## Caching strategy summary
- Install: `skipWaiting()` and precache `/offline.html`, `/manifest.webmanifest`, and all `/gg-pwa-icon/*` files.
- Activate: `clients.claim()` and remove old caches by version.
- Navigation: network-first; on failure, serve cached `/offline.html`.
- `/assets/dev/*`: network-only (no cache).
- `/assets/v/*` and `/gg-pwa-icon/*`: cache-first (immutable).
- `/manifest.webmanifest` and `/offline.html`: stale-while-revalidate.
- Debug logs only when URL contains `?ggdebug=1`.

## Manual checklist
- Register SW and reload; confirm controller is active in DevTools.
- Update SW version string, reload, and verify the new SW activates quickly.
- Simulate offline and navigate to a page; confirm `/offline.html` is served.
