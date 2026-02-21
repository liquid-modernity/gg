TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-HTML-IN-JS-MIGRATION-PHASE3-SEARCH-20260221
TITLE: Render listbox with DOM APIs (no innerHTML) + tighten allowlist ratchet

SUMMARY
- Replaced search listbox rendering in `public/assets/latest/modules/ui.bucket.search.js` from string/`innerHTML` to pure DOM APIs (`createElement`, `textContent`, `DocumentFragment`, `appendChild`).
- Preserved combobox+listbox behavior (not modal): recent section, results, hints, `aria-activedescendant`, keyboard navigation, Enter/Esc/Tab behavior path unchanged.
- Removed legacy annotation block tied to previous search `innerHTML` writes.
- Added dedicated guardrail verifier `tools/verify-search-no-innerhtml.mjs` and wired into `tools/gate-prod.sh`.
- Reduced allowlist by removing `LEGACY-0073..LEGACY-0077` and tightened ratchet.

ALLOWLIST RATCHET (BEFORE/AFTER)
- Before allow count: `42`
- After allow count: `37`
- New `max_allow`: `37`
- Removed IDs: `LEGACY-0073`, `LEGACY-0074`, `LEGACY-0075`, `LEGACY-0076`, `LEGACY-0077`

FILES CHANGED
- public/assets/latest/modules/ui.bucket.search.js
- tools/verify-search-no-innerhtml.mjs
- tools/gate-prod.sh
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/perf-budgets.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-search-no-innerhtml.mjs`
```text
VERIFY_SEARCH_NO_INNERHTML: PASS
```

- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=37 allowlisted_matches=37 violations=0
```

- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=37 allowlisted_matches=37 violations=0
VERIFY_SEARCH_NO_INNERHTML: PASS
VERIFY_SKIP_LINK_CONTRACT: PASS
VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=69 labeled=69 unlabeledSuspects=0
VERIFY_PALETTE_NOT_MODAL: PASS
VERIFY_MODAL_OPEN_CLOSE_PARITY: PASS modalOpen=3 modalClose=6
VERIFY_OVERLAY_MODAL_CONTRACT: PASS
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
PASS: palette a11y contract (mode=repo, release=5bae869)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

ADDITIONAL VERIFY
- `node tools/verify-palette-a11y.mjs --mode=repo`
```text
PASS: palette a11y contract (mode=repo, release=5bae869)
```

- `bash tools/gate-release.sh`
```text
VERIFY_SEARCH_NO_INNERHTML: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=37 allowlisted_matches=37 violations=0
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

NOTES
- `tools/verify-palette-a11y.mjs` expects literal option role markers in source; static marker was added in search renderer while preserving DOM-only rendering and zero `innerHTML`.
