TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-TEMPLATE-INVALID-NESTING-FIX-20260221
TITLE: Remove invalid nested interactive elements in templates

SUMMARY
- Fixed invalid interactive nesting in both Blogger templates by replacing nested `a > button` store-dock markup with a single anchor element styled as dock item.
- Added verifier `tools/verify-template-no-nested-interactives.mjs` to block regressions for both forbidden patterns:
  - `<a>...<button>`
  - `<button>...<a>`
- Wired verifier into `tools/gate-prod.sh` near template contract checks.

FIXED LOCATIONS
- index.prod.xml:3758 (Store dock item converted from nested `<a><button>...</button></a>` to single `<a ...>`)
- index.dev.xml:3323 (Store dock item converted from nested `<a><button>...</button></a>` to single `<a ...>`)

FILES CHANGED
- index.prod.xml
- index.dev.xml
- tools/verify-template-no-nested-interactives.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-template-no-nested-interactives.mjs`
```text
VERIFY_TEMPLATE_NO_NESTED_INTERACTIVES: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=37 allowlisted_matches=37 violations=0
VERIFY_SEARCH_NO_INNERHTML: PASS
VERIFY_SKIP_LINK_CONTRACT: PASS
VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=68 labeled=68 unlabeledSuspects=0
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
VERIFY_TEMPLATE_NO_NESTED_INTERACTIVES: PASS
VERIFY_TEMPLATE_CONTRACT: PASS
VERIFY_TEMPLATE_FINGERPRINT: PASS
VERIFY_BUDGETS: PASS
VERIFY_INLINE_CSS: PASS
VERIFY_CRP: PASS
PASS: palette a11y contract (mode=repo, release=0a516a5)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

ADDITIONAL VERIFY
- `bash tools/gate-release.sh`
```text
VERIFY_TEMPLATE_NO_NESTED_INTERACTIVES: PASS
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

NOTES
- `gate:prod` re-aligned release artifacts to `RELEASE_ID=0a516a5` after template/capsule edits.
- `gate-release` fails in this environment due DNS/network resolution for live host, not local contract failures.
