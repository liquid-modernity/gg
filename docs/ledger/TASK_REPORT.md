TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008B.3
TITLE: Enforce single H1 per surface (landing/listing/post/page) with minimal template edits

TASK_SUMMARY
- Add a single listing H1 ("Blog") for /blog and demote the sitemap page H1 to H2 to keep page surfaces at one H1.
- Add live smoke checks to enforce exactly one H1 on home and listing surfaces.

H1 POLICY (PER SURFACE)
- Landing: exactly one H1 (hero title).
- Listing (/blog): exactly one H1 ("Blog").
- Post: exactly one H1 (post title).
- Page: exactly one H1 (page title).

TEMPLATE CHANGES
- Inserted <h1 class="gg-listing__title">Blog</h1> only for multiple-items views that are not homepage.
- Demoted sitemap page heading from H1 to H2 to avoid duplicate H1s on page surfaces.
- Header brand already non-H1; left unchanged.

SMOKE COVERAGE
- Live HTML mode checks H1 count == 1 on / and /blog; listing H1 must include "Blog".

CHANGES
- index.prod.xml
- index.dev.xml
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; markup-only.
- Rollback: revert this commit.
