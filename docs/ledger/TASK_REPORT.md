TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0004B
TITLE: DEV SW poisoning fix + /assets/latest SW alignment

TASK_SUMMARY
- Added DEV cleanup routine in `public/assets/latest/main.js` to unregister SWs, clear caches, and force a one-time reload if controlled.
- Updated `public/sw.js` to treat `/assets/latest/*` as network-only (no cache) and removed legacy `/assets/dev` handling.
- Added `docs/sw/SW_STRATEGY.md` with DEV/PROD behavior and verification steps.

FILES_CHANGED
- public/sw.js
- public/assets/latest/main.js
- docs/sw/SW_STRATEGY.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION (LOCAL)
- Ran: `node tools/validate-xml.js`
- Ran: `node tools/verify-assets.mjs`
- Result: PASSED

DEVTOOLS VERIFICATION (DEV MODE)
1) Open Application → Service Workers: should show none after one reload.
2) Open Application → Cache Storage: no `gg-*` or `workbox-*` caches after cleanup.
3) Console: one line `GG DEV: SW & caches cleaned`.
4) Network: `/assets/latest/main.js` shows `Cache-Control: no-store` and is fetched from network (not Cache Storage).

PROD VERIFICATION (PROD MODE)
1) Application → Service Workers: `sw.js` registered and active.
2) Offline test: reload → `/offline.html` served.
3) Assets: `/assets/v/<RELEASE_ID>/main.js` is cached and `immutable`.

CURL CHECKS (expected)
- `curl -I https://pakrpp.com/` → `301` + `Location: https://www.pakrpp.com/`
- `curl -I https://www.pakrpp.com/__gg_worker_ping` → `200` + `x-gg-worker-version`

RISKS / ROLLBACK
- Risk: If dev cleanup is not triggered (marker missing), old SW can still control. Ensure `<meta name='gg:mode' content='dev'/>` exists in `index.dev.xml`.
- Rollback: revert this commit.
