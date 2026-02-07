TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008C.1
TITLE: Add SMOKE_POST_URL schema proof + strengthen BlogPosting fields (article pages)

TASK_SUMMARY
- Strengthen BlogPosting schema fields (url, isPartOf, dates, image validation) and keep schema URLs query-clean.
- Add SMOKE_POST_URL check to validate BlogPosting presence and clean URLs on real post pages.

BEHAVIOR
- BlogPosting now includes url (clean), isPartOf, and validated image array when og:image is a valid URL.
- Article detection remains og:type=article or article:published_time; additionally uses <article> when not listing.
- Schema URLs drop x, view, utm_*, fbclid, gclid, msclkid and any remaining params.

SMOKE COVERAGE
- Optional post validation:
  `SMOKE_POST_URL="https://www.pakrpp.com/YYYY/MM/slug.html" SMOKE_LIVE_HTML=1 tools/smoke.sh`
- Asserts BlogPosting exists and BlogPosting/WebPage urls contain no query string.

CHANGES
- src/worker.js
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`
- `SMOKE_POST_URL="https://www.pakrpp.com/YYYY/MM/slug.html" SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; HTML rewrite only.
- Rollback: revert this commit.
