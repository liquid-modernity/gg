TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-A11Y-TAP-TARGETS-20260221
TITLE: Enforce 44px tap targets for interactive controls

SUMMARY
- Enforced `--gg-tap-min` (44px) as minimum interactive hit target on known undersized controls in `public/assets/latest/main.css`.
- Added static guardrail `tools/verify-tap-targets.mjs` to prevent regressions.
- Wired tap-target verifier into `tools/gate-prod.sh` after icon-control verifier.
- Added manual QA checklist document `docs/a11y/TAP_TARGETS_SWEEP.md`.

SELECTORS FIXED
- `.gg-tree-toggle`
- `.gg-post-card__tool`
- `.gg-post__tool`
- `.gg-lt__collapse`
- `.gg-lt__panelbtn`
- `.gg-pi__toggle`
- `.gg-toc__toggle`
- `.gg-share-sheet__close-btn`
- `nav.gg-dock .gg-dock__search input`

FILES CHANGED
- public/assets/latest/main.css
- tools/verify-tap-targets.mjs
- tools/gate-prod.sh
- docs/a11y/TAP_TARGETS_SWEEP.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-tap-targets.mjs`
```text
PASS: tap targets contract (44px)
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=37 allowlisted_matches=37 violations=0
VERIFY_SEARCH_NO_INNERHTML: PASS
VERIFY_SKIP_LINK_CONTRACT: PASS
VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=68 labeled=68 unlabeledSuspects=0
PASS: tap targets contract (44px)
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
PASS: palette a11y contract (mode=repo, release=6b2bad6)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

ADDITIONAL VERIFY
- `bash tools/gate-release.sh`
```text
PASS: tap targets contract (44px)
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

NOTES
- `gate:prod` aligned artifacts to `RELEASE_ID=6b2bad6`.
- `gate-release` strict live smoke failed due DNS/network resolution in sandbox environment.
