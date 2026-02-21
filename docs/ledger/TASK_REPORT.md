TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-HTML-IN-JS-MIGRATION-PHASE2-CORE-HOTSPOTS-20260221
TITLE: Remove trivial innerHTML usage in core hotspots

SUMMARY
- Removed all `innerHTML = ''` usage from `public/assets/latest/modules/ui.bucket.core.js` and replaced with `textContent = ''`.
- Replaced comments loading/unavailable HTML strings with DOM API rendering (`createElement` + `textContent` + aria attributes).
- Replaced trivial button/icon HTML in core hotspots with DOM node creation.
- Added `tools/verify-no-innerhtml-clear.mjs` and wired it into `tools/gate-prod.sh`.
- Cleaned obsolete legacy annotations and reduced allowlist entries accordingly.

ALLOWLIST SIZE
- Before: 57
- After: 42

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-no-innerhtml-clear.mjs
- tools/gate-prod.sh
- tools/perf-budgets.json
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-no-innerhtml-clear.mjs`
```text
VERIFY_NO_INNERHTML_CLEAR: PASS
```

- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=42 allowlisted_matches=42 violations=0
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=42 allowlisted_matches=42 violations=0
VERIFY_NO_INNERHTML_CLEAR: PASS
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
VERIFY_NO_INNERHTML_CLEAR: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=42 allowlisted_matches=42 violations=0
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

NOTES
- `gate-release` strict live smoke fails in this sandbox due DNS/network resolution limits.
- Budget for `modules/ui.bucket.core.js` was adjusted minimally (`max_gzip` 55400 -> 55600) to reflect intentional DOM-based refactor footprint.
