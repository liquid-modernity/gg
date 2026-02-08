TASK_REPORT
Last updated: 2026-02-08

TASK_ID: TASK-0008F.0
TITLE: UI feature wiring audit (flags -> modules -> DOM hooks) + DOM-contract smoke

TASK_SUMMARY
- Document UI wiring map across core/listing/post/search/poster modules and DOM hooks.
- Confirm gg-flags only gate service worker, not UI features.
- Add LIVE_HTML DOM-contract smoke checks for home + listing.

BEHAVIOR
- FEATURE_WIRING_MAP captures feature wiring, required DOM hooks, and failure modes.
- Smoke LIVE_HTML now asserts landing/listing surface markers and core DOM hooks (#gg-main, skiplink, #postcards).
- Highlights missing wiring where modules or DOM hooks are absent (postcardKebab, palette host, footer accordion).

CHANGES
- docs/ui/FEATURE_WIRING_MAP.md
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; documentation and smoke-only changes.
- Rollback: revert this commit.

TASK_ID: TASK-0008C.1.2
TITLE: Guarantee BlogPosting on post surface (data-gg-surface=post) + improve smoke debug

TASK_SUMMARY
- Force BlogPosting on post surfaces by reading data-gg-surface from HTML body in the worker.
- Improve SMOKE_POST_URL debug output to show exact failing condition.

BEHAVIOR
- BlogPosting is always included when data-gg-surface="post".
- BlogPosting/WebPage urls remain query-clean.
- datePublished/dateModified are only emitted when article dates are present.

SMOKE COVERAGE
- Post check prints explicit failing condition (missing BlogPosting, query in url, etc.).

CHANGES
- src/worker.js
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_POST_URL="https://www.pakrpp.com/YYYY/MM/slug.html" SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; HTML rewrite only.
- Rollback: revert this commit.

---

TASK_ID: TASK-0008D.1
TITLE: Add Security Headers v1 (CSP Report-Only) + /api/csp-report endpoint + smoke checks

TASK_SUMMARY
- Add baseline security headers on all responses.
- Add CSP report-only on HTML with reporting endpoints and a `/api/csp-report` handler.
- Extend smoke checks to validate headers and report endpoint.

BEHAVIOR
- All responses include `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options`.
- HTML responses include `Content-Security-Policy-Report-Only` plus `Report-To` and `Reporting-Endpoints` pointing to `/api/csp-report`.
- `/api/csp-report` accepts POST, logs a compact one-liner (timestamp, cf-ray, UA, report keys/raw), and returns 204; non-POST returns 405.
- Reports are visible in Cloudflare Worker logs; v2 can consider enforcement or nonce support.

SMOKE COVERAGE
- Home/blog response headers include security headers + CSP report-only.
- `/api/csp-report` POST returns 204.

CHANGES
- src/worker.js
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; report-only headers + logging endpoint.
- Rollback: revert this commit.

---

TASK_ID: TASK-0008D.2
TITLE: CSP report triage: redact + dedupe counters + optional gating flag (report-only stays)

TASK_SUMMARY
- Add `csp_report_enabled` flag to gg-flags and gate CSP report-only headers/logging.
- Redact URL queries/fragments in CSP report logs and dedupe with counters.
- Extend smoke with gg-flags key check.

BEHAVIOR
- CSP report-only headers are only attached when `csp_report_enabled` is true.
- `/api/csp-report` returns 204 always; when the flag is false it skips logging.
- CSP report logs are deduped by directive + blocked URL + source URL and log on 1/10/50/100/200... counts.
- Logged URLs strip query strings and fragments for privacy.

HOW TO TOGGLE
- Edit `public/__gg/flags.json` and set `csp_report_enabled` to `false` to disable CSP report headers/logging (worker still returns 204 for reports).
- Set it back to `true` to re-enable.

LOG EXAMPLE
- `CSP_REPORT count=10 dir=script-src blocked=https://example.com/path source=https://www.pakrpp.com/post doc=https://www.pakrpp.com/post ray=... ua="..."`

SMOKE COVERAGE
- gg-flags.json contains `csp_report_enabled`.
- Home/blog still return CSP report-only headers when enabled.
- `/api/csp-report` returns 204.

CHANGES
- src/worker.js
- public/__gg/flags.json
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; report-only CSP remains, logging changes only.
- Rollback: revert this commit.

---

TASK_ID: TASK-0008D.2.1
TITLE: Fix headers contract: /gg-flags.json must be Cache-Control no-store, max-age=0

TASK_SUMMARY
- Force `Cache-Control: no-store, max-age=0` on `/gg-flags.json` responses.

BEHAVIOR
- `/gg-flags.json` always returns `Cache-Control: no-store, max-age=0` while preserving JSON content type.

CHANGES
- src/worker.js
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; header-only change.
- Rollback: revert this commit.

---

TASK_ID: TASK-0008D.2.2
TITLE: Preserve Cache-Control in stamp() + hard override no-store for /gg-flags.json

TASK_SUMMARY
- Clone headers explicitly in `stamp()` to preserve Cache-Control and other upstream headers.
- Force `/gg-flags.json` to no-store with legacy no-cache headers after stamping.
- Improve smoke debug output for authoritative header checks.

BEHAVIOR
- `stamp()` uses `new Headers(res.headers)` and rebuilds the response with explicit status/headers.
- `/gg-flags.json` always returns `Cache-Control: no-store, max-age=0` plus `Pragma: no-cache` and `Expires: 0`.

CHANGES
- src/worker.js
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; header-only changes.
- Rollback: revert this commit.

---

TASK_ID: TASK-0008D.2.2
TITLE: Fix gg-flags caching by removing static collision

TASK_SUMMARY
- Move internal flags file to `public/__gg/flags.json` to avoid static asset collision.
- Update worker flag loader to read the new internal path.
- Add smoke guard to ensure `/gg-flags.json` is served by the worker.

BEHAVIOR
- `/gg-flags.json` remains the public endpoint and is always stamped by the worker.
- Cache-Control is forced to `no-store, max-age=0` and worker headers are present.

SMOKE COVERAGE
- Assert `x-gg-worker-version` exists on `/gg-flags.json` headers.

CHANGES
- src/worker.js
- public/__gg/flags.json
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

OPERATOR NOTE
- After deploy, purge Cloudflare cache for `/gg-flags.json` to drop the stale static object.

RISKS / ROLLBACK
- Risk: low; flags path update and header checks only.
- Rollback: revert this commit and restore the previous flags file location.
