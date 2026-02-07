TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008B.2.3
TITLE: Guarantee clean canonical/og/twitter URL for /blog (strip cache-buster & tracking params; rewrite or inject)

TASK_SUMMARY
- Sanitize listing canonical/og/twitter URLs to a stable /blog target with no cache-buster or tracking params.
- Rewrite existing tags and inject missing tags for listing HTML.

RATIONALE
- Cache-buster and tracking params create duplicate canonical URLs and dilute SEO signals; listing canonicals should be stable.

BEHAVIOR
- Listing canonical/og:url/twitter:url set to https://www.pakrpp.com/blog (origin + /blog only).
- Stripped params: x, view, utm_* (any key starting with utm_), fbclid, gclid, msclkid.
- Changes apply only to listing responses (forceListing true); posts/pages are untouched.

CHANGES
- src/worker.js
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

SMOKE COVERAGE
- Listing canonical/og/twitter clean check via cache-busted fetch; debug prints matching tag lines on failure.

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; listing-only HTML rewrite.
- Rollback: revert this commit.
