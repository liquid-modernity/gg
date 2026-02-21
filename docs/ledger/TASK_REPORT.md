TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-OVERLAY-ARIA-LABELS-AUDIT-20260221
TITLE: Skip link + icon control accessible-name contract

SUMMARY
- Added global skip-link contract in template shell with `.gg-skip-link[href="#gg-main"]`, hidden until focused.
- Added skip-link runtime focus binding in core so click always lands focus on `#gg-main` safely.
- Added explicit labels for icon controls that were previously implicit.
- Added static guardrails to prevent regressions (`verify-skip-link-contract` and `verify-icon-controls-a11y`) and wired both into `gate:prod`.

CONTROLS FIXED (selector -> label)
- `.gg-post-card__action--bookmark[data-gg-action="bookmark"]` -> `aria-label="Bookmark"`
- `.gg-post-card__tool[data-gg-action="like"]` -> `aria-label="Like"`
- `.gg-post-card__action--share[data-gg-action="share"]` -> `aria-label="Share"`
- `.gg-post-card__tool--info[data-gg-action="info"]` -> `aria-label="Information"`
- Dynamic `.gg-tree-toggle` buttons in core modules -> `aria-label="Toggle <section>"` fallback `Toggle section`
- `a.gg-skip-link[href="#gg-main"]` + runtime focus safeguard (`tabindex=-1` + focus)

FILES CHANGED
- index.prod.xml
- index.dev.xml
- public/assets/latest/modules/ui.bucket.core.js
- tools/verify-skip-link-contract.mjs
- tools/verify-icon-controls-a11y.mjs
- tools/gate-prod.sh
- tools/perf-budgets.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-skip-link-contract.mjs`
```text
VERIFY_SKIP_LINK_CONTRACT: PASS
```

- `node tools/verify-icon-controls-a11y.mjs`
```text
VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=69 labeled=69 unlabeledSuspects=0
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=42 allowlisted_matches=42 violations=0
VERIFY_SKIP_LINK_CONTRACT: PASS
VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=69 labeled=69 unlabeledSuspects=0
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
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

- `bash tools/gate-release.sh`
```text
VERIFY_SKIP_LINK_CONTRACT: PASS
VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=69 labeled=69 unlabeledSuspects=0
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

MANUAL SANITY
- Not executable in this terminal sandbox (no interactive browser/screen reader).
- Pending manual checks on real browser:
  - Tab once -> skip link appears; Enter jumps and focus lands on `#gg-main`.
  - SR announces meaningful names for icon controls.
