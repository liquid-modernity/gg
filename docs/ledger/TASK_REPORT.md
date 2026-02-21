TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-HTML-IN-JS-MIGRATION-PHASE1-LISTING-20260221
TITLE: Replace HTML injection with DOM APIs in listing module

SUMMARY
- Migrated most `innerHTML` usage in `public/assets/latest/modules/ui.bucket.listing.js` to DOM APIs.
- Replaced container clearing, static list messages, and `<select>` option builders with safe node creation.
- Kept only 3 allowlisted legacy complex builders in this file (`LEGACY-0044`, `LEGACY-0051`, `LEGACY-0060`).
- Reduced allowlist entries by removing obsolete listing exceptions.

ALLOWLIST SIZE
- Before: 77
- After: 57

FILES CHANGED
- public/assets/latest/modules/ui.bucket.listing.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/perf-budgets.json
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/* (build output)

VERIFICATION OUTPUTS
- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=57 allowlisted_matches=57 violations=0
```

- `npm run -s gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=57 allowlisted_matches=57 violations=0
PASS: verify-panels-inert-safety
PASS: verify-smooth-scroll-policy
VERIFY_AUTHORS_DIR_CONTRACT: PASS
VERIFY_SITEMAP_PAGE_CONTRACT: PASS
VERIFY_TAGS_DIR_CONTRACT: PASS
VERIFY_ROUTER_CONTRACT: PASS
VERIFY_UI_GUARDRAILS: PASS
VERIFY_TEMPLATE_CONTRACT: PASS
VERIFY_TEMPLATE_FINGERPRINT: PASS
VERIFY_BUDGETS: PASS
VERIFY_INLINE_CSS: PASS
VERIFY_CRP: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

- `bash tools/gate-release.sh`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=57 allowlisted_matches=57 violations=0
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

NOTES
- `gate-release` failed due strict live smoke requiring DNS/network access not available in sandbox.
- `ui.bucket.listing.js` legacy occurrences now: 3.
