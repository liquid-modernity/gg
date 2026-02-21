# GG_CAPSULE (current session)
Last updated: 2026-02-21

NOW:
- TASK-NATIVE-FEEL-ROUTE-FOCUS-ANNOUNCE-20260221: Enforce focus + polite announce on SPA route navigation callbacks.

CONSTRAINTS:
- main-only
- preview always www.pakrpp.com
- DEV/PROD via 2 Blogger themes (index.dev.xml / index.prod.xml manual paste)
- Cloudflare Worker name: gg
- assets served via Worker ASSETS binding (same-domain paths)
- local machine macOS 10.15: wrangler CI-only
- apex redirect via Cloudflare Redirect Rule (301) to https://www.pakrpp.com/$1

<!-- GG:AUTOGEN:BEGIN -->
RELEASE_ID: d790c38
RELEASE_HISTORY:
- d790c38
- 1d3d036
PROD_PINNED_JS: /assets/v/d790c38/main.js
PROD_PINNED_APP: /assets/v/d790c38/app.js
PROD_PINNED_CSS: /assets/v/d790c38/main.css
<!-- GG:AUTOGEN:END -->

LIVE CONTRACT (must hold):
- apex redirects → https://www.pakrpp.com/
- worker ping: https://www.pakrpp.com/__gg_worker_ping
- latest assets (DEV): https://www.pakrpp.com/assets/latest/main.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/boot.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/app.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/core.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/modules/pwa.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/modules/ui.js (no-store)
- pinned assets (PROD): see AUTOGEN block (immutable)
- sw.js: https://www.pakrpp.com/sw.js (no-store)
- offline: https://www.pakrpp.com/offline.html

NEXT_TASK:
- TASK-HTML-IN-JS-MIGRATION-PHASE2-CORE-HOTSPOTS-20260221

LAST_PATCH:
- 2026-02-21 TASK-NATIVE-FEEL-ROUTE-FOCUS-ANNOUNCE-20260221 patched router callbacks for #gg-main focus + SR title announce.

RISKS (top 5):
- Manual paste mismatch (dev/prod)
- Worker routes missing on www
- Release ID not bumped alongside assets
- CI-only deploy skipped
- SW cache not updating if VERSION not bumped

FAST VERIFY (60s):
1) view-source → confirm boot.js path matches `/assets/latest/` (DEV) or `/assets/v/<RELEASE_ID>/boot.js` (PROD).
2) https://www.pakrpp.com/__gg_worker_ping returns `X-GG-Worker-Version`.
3) https://www.pakrpp.com/assets/latest/main.js (DEV) and AUTOGEN pinned JS (PROD) return expected cache headers.
4) DevTools → Application → Service Workers: DEV not controlled, PROD controlled.
