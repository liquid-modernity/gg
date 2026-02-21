TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-TAP-TARGETS-V2-20260221
TITLE: Expand 44px tap target contract (icon buttons + nav links)

SUMMARY
- Expanded 44px hit-area contract to additional real-world offenders in CSS.
- Extended `tools/verify-tap-targets.mjs` so these selectors are now mandatory and regression-protected.
- Expanded manual sweep checklist for icon buttons, sidebar links, and head buttons.

SELECTORS ADDED TO CONTRACT
- `.gg-icon-btn`
- `nav.gg-dock .gg-dock__search .gg-icon-btn`
- `.gg-leftnav__link`
- `.gg-lt[data-gg-module="labeltree"] .gg-lt__headbtn`
- `#gg-toc .gg-toc__headbtn`

CSS CHANGES
- `nav.gg-dock .gg-dock__search .gg-icon-btn`: replaced `40px` sizing with `var(--gg-tap-min)` + min-size guards.
- `.gg-leftnav__link`: added `min-height: var(--gg-tap-min)`.
- `.gg-lt[data-gg-module="labeltree"] .gg-lt__headbtn` (both duplicated blocks): added `min-height: var(--gg-tap-min)`.
- `#gg-toc .gg-toc__headbtn`: added `min-height: var(--gg-tap-min)`.

FILES CHANGED
- public/assets/latest/main.css
- tools/verify-tap-targets.mjs
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
VERIFY_AUTHORS_DIR_CONTRACT: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=28 allowlisted_matches=28 violations=0
VERIFY_SEARCH_NO_INNERHTML: PASS
VERIFY_SKIP_LINK_CONTRACT: PASS
VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=68 labeled=68 unlabeledSuspects=0
PASS: tap targets contract (44px)
VERIFY_PALETTE_NOT_MODAL: PASS
VERIFY_MODAL_OPEN_CLOSE_PARITY: PASS modalOpen=3 modalClose=6
VERIFY_OVERLAY_MODAL_CONTRACT: PASS
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
PASS: phase4 trivial htmljs blocked
VERIFY_NO_INNERHTML_CLEAR: PASS
PASS: verify-panels-inert-safety
PASS: verify-smooth-scroll-policy
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
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

- `bash tools/gate-release.sh`
```text
INFO: live checks run only in CI or with GG_GATE_RELEASE_LIVE=1
PASS: tap targets contract (44px)
PASS: gate:prod
PASS: palette a11y contract (mode=repo, release=042358e)
PASS: gate:release(local)
```

NOTES
- During `npm run gate:prod`, release artifacts were automatically realigned to `RELEASE_ID=042358e`.
- Local release gate intentionally stays non-live; strict live proof remains in CI via `gate-release-live.sh`.
