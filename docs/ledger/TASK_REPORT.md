TASK_REPORT
Last updated: 2026-02-07

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
