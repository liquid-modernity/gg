TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-LEGACY-HTMLJS-GATE-HARDEN-20260221
TITLE: Enforce one-use legacy ids for HTML-in-JS

SUMMARY
- Hardened `tools/verify-no-new-html-in-js.mjs` so a LEGACY id cannot be reused by another occurrence.
- Added policy text in `docs/AGENTS.md` that every `LEGACY:<ID>` is single-use.
- Updated allowlist contract with `"one_use": true` for explicit policy signaling.
- Preserved gate order and existing gate wiring.

FILES CHANGED
- tools/verify-no-new-html-in-js.mjs
- docs/AGENTS.md
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
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
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=77 allowlisted_matches=77 violations=0
```

- `npm run -s gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=77 allowlisted_matches=77 violations=0
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
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=77 allowlisted_matches=77 violations=0
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

NOTES
- `gate-release` remains strict-live and failed in this sandbox due external DNS/network unavailability.
