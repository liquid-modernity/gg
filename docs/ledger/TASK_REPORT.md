TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008B.4
TITLE: Inject GG_SCHEMA v1 JSON-LD (WebSite + Person/Organization + WebPage + BlogPosting when article) via Worker; add smoke schema checks

TASK_SUMMARY
- Inject GG_SCHEMA v1 JSON-LD via worker for all HTML responses (listing + post + page + home) with stable, sanitized URLs.
- Add smoke checks to verify schema presence, JSON parse, listing CollectionPage URL, and optional BlogPosting.

RATIONALE
- Centralized JSON-LD ensures consistent, clean schema without cache-busters or tracking params; body injection is deterministic after meta capture.

BEHAVIOR
- Always injects WebSite + Person (publisher) + WebPage nodes.
- Listing responses set WebPage type to CollectionPage with url https://www.pakrpp.com/blog.
- Article detection via og:type=article or article:published_time adds BlogPosting.
- Schema URLs strip x, view, utm_*, fbclid, gclid, msclkid and drop all params.

CHANGES
- src/worker.js
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

SMOKE COVERAGE
- /: gg-schema present, JSON parses, contains @context/@graph.
- /blog?x=: gg-schema present, CollectionPage exists, url equals /blog (no params).
- Optional: SMOKE_POST_URL validates BlogPosting.

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; worker HTML rewrite only.
- Rollback: revert this commit.
