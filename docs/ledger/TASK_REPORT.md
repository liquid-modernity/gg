TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008B.2.4
TITLE: Listing meta deterministic: remove existing canonical/og/twitter then inject clean set in <head> (listing only)

TASK_SUMMARY
- Remove existing canonical/og:url/twitter:url tags on listing HTML and inject a single clean set at end of <head>.
- Guarantee twitter:url presence and stable canonical for /blog.

RATIONALE
- Blogger output can omit twitter:url and may emit variable canonical values; deterministic injection ensures a stable, single source of truth.

BEHAVIOR
- Listing canonical/og:url/twitter:url set to https://www.pakrpp.com/blog (origin + /blog only).
- Stripped params: x, view, utm_* (any key starting with utm_), fbclid, gclid, msclkid.
- Changes apply only to listing responses (forceListing true); posts/pages are untouched.

CHANGES
- src/worker.js
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; listing-only HTML rewrite.
- Rollback: revert this commit.
