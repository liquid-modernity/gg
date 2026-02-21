TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-LEGACY-ALLOWLIST-RATCHET-20260221
TITLE: Ratchet legacy allowlist (no growth)

SUMMARY
- Added top-level `max_allow` to `docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json`.
- Set `max_allow` to the current baseline after TASK 14.
- Added `tools/verify-legacy-allowlist-ratchet.mjs` to block allowlist growth unless `max_allow` is explicitly raised.
- Wired ratchet verifier into `tools/gate-prod.sh`.

RATCHET VALUE
- max_allow: 42
- allow length (current): 42

FILES CHANGED
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-legacy-allowlist-ratchet.mjs
- tools/gate-prod.sh
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=42 allowlisted_matches=42 violations=0
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
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

NOTES
- `gate:prod` auto-realigned release metadata/artifacts after `GG_CAPSULE` update.
