TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0004A
TITLE: Remove apex route from wrangler config

TASK_SUMMARY
- Removed `pakrpp.com/*` from `wrangler.jsonc` routes so only `www.pakrpp.com/*` is served by Worker `gg`.
- Updated Cloudflare setup docs to state apex must only redirect via Redirect Rule (not Worker routing).
- Updated GG_CAPSULE and ledger entries for this change.

FILES_CHANGED
- wrangler.jsonc
- docs/CLOUDFLARE_SETUP.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION (LOCAL)
- Ran: `node tools/validate-xml.js`
- Ran: `node tools/verify-assets.mjs`
- Result: PASSED

VERIFY IN CLOUDFLARE DASHBOARD
1) Workers Routes: ensure ONLY `www.pakrpp.com/*` points to Worker `gg`.
2) Redirect Rules: ensure `pakrpp.com/*` → `https://www.pakrpp.com/$1` with status 301 (preserve path + query).
3) Remove any existing `pakrpp.com/*` Worker route if still present.

CURL CHECKS (expected)
- `curl -I https://pakrpp.com/` → `301` with `Location: https://www.pakrpp.com/`
- `curl -I https://www.pakrpp.com/__gg_worker_ping` → `200` + `x-gg-worker-version`

RISKS / ROLLBACK
- Risk: If an apex Worker route still exists in the dashboard, it must be removed to honor Redirect Rule.
- Rollback: revert this commit.
