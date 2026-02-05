TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0004B.1
TITLE: Resilient SW install + inline DEV kill-switch

TASK_SUMMARY
- Made SW install best-effort in `public/sw.js` so precache failures do not abort installation.
- Added inline DEV kill-switch in `index.dev.xml` to unregister SWs and clear caches before external JS loads.
- Updated SW strategy docs with install resilience and inline cleanup behavior.

FILES_CHANGED
- public/sw.js
- index.dev.xml
- docs/sw/SW_STRATEGY.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION (LOCAL)
- Ran: `node tools/validate-xml.js`
- Ran: `node tools/verify-assets.mjs`
- Result: PASSED

DEVTOOLS CHECKLIST (DEV MODE)
1) Open DevTools → Application → Service Workers: no active registrations after one reload.
2) Application → Cache Storage: no `gg-*` or `workbox-*` caches after cleanup.
3) Console shows once: `GG DEV: inline SW cleanup`.
4) Console shows once: `GG DEV: SW & caches cleaned` (from main.js cleanup).
5) Network: `/assets/latest/main.js` shows `Cache-Control: no-store` and is fetched from network.

PROD CHECKLIST (PROD MODE)
1) Service Worker installs even if offline precache fails.
2) Offline test: reload → offline fallback returns cached `/offline.html` or minimal inline offline page.
3) `/assets/v/<RELEASE_ID>/main.js` remains cacheable (immutable).

CURL CHECKS (expected)
- `curl -I https://pakrpp.com/` → `301` + `Location: https://www.pakrpp.com/`
- `curl -I https://www.pakrpp.com/__gg_worker_ping` → `200` + `x-gg-worker-version`

RISKS / ROLLBACK
- Risk: None (best-effort install + inline cleanup only).
- Rollback: revert this commit.
