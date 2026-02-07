TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008B.2
TITLE: Normalize /?view=blog -> /blog + rewrite canonical/og:url for listing pages

TASK_SUMMARY
- Added worker redirects to normalize listing URLs to /blog (drops view=blog, preserves other params).
- Rewrote canonical/og:url/twitter:url for listing HTML when forceListing is true.
- Added smoke checks for redirects and listing canonical.

BEHAVIOR
- /?view=blog -> 301 /blog (view param removed; other params preserved).
- /blog?view=blog -> 301 /blog.
- /blog/ -> 301 /blog.
- Listing HTML canonical + og:url + twitter:url point to /blog (plus non-view params).

SMOKE COVERAGE
- Redirect checks for /?view=blog, /blog?view=blog, /blog/.
- Canonical and og:url checks on /blog.

CONSTRAINTS CONFIRMED
- No JS changes.
- No template changes.
- Worker-only behavior change.

CHANGES
- src/worker.js
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build` (FAILED: clean tree required)
- `SMOKE_LIVE_HTML=1 tools/smoke.sh` (FAILED: DNS)

RISKS / ROLLBACK
- Risk: low; redirects and HTML rewrites on listing only.
- Rollback: revert this commit.
