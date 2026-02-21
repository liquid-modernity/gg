TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-SHORTCODES-A11Y-POLISH-20260221
TITLE: Polish shortcodes outputs (yt-lite + accordion semantics)

SUMMARY
- Updated shortcode templates in `index.prod.xml` and `index.dev.xml`:
  - `gg-tpl-sc-yt-lite` now has keyboard/button semantics (`role="button"`, `tabindex="0"`), baseline label (`aria-label="Play video"`), and runtime hook (`data-gg-yt-label="1"`).
  - `gg-tpl-sc-accordion` now includes stable hooks (`data-gg-acc`, `data-gg-acc-toggle`, `data-gg-acc-body`) for runtime binding.
- Updated `GG.modules.ShortcodesV2` in `public/assets/latest/modules/ui.bucket.core.js`:
  - Added `bindA11y(root)` and wired it into transform flow to ensure new/rehydrated nodes are bound.
  - YT lite now guarantees keyboard activation with `Enter`/`Space`, and keeps a meaningful label baseline (`Play video`) with runtime title derivation.
  - Accordion now sets stable unique `body.id`, wires `aria-controls` on toggle, and keeps `aria-expanded` synchronized with `body.hidden` state.
  - Added double-bind guard using `data-gg-a11y-bound="1"`.
- Added `tools/verify-shortcodes-a11y-contract.mjs` and wired it into `tools/gate-prod.sh` after shortcode contract verifiers.
- No HTML injection introduced. No new legacy allowlist entry added.

WHAT CHANGED
- YT lite label + keyboard:
  - baseline `Play video` label present
  - runtime label derivation + Enter/Space keyboard activation
- Accordion semantics:
  - runtime `aria-controls` mapping to generated `gg-acc-body-*` ids
  - `aria-expanded` and `hidden` state stay in sync

FILES CHANGED
- index.prod.xml
- index.dev.xml
- public/assets/latest/modules/ui.bucket.core.js
- tools/verify-shortcodes-a11y-contract.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-shortcodes-a11y-contract.mjs`
```text
PASS: shortcodes a11y contract
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
PASS: shortcodes has no innerHTML writes
VERIFY_SHORTCODES_TEMPLATES: PASS
PASS: shortcodes a11y contract
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=1 allowlisted_matches=1 violations=0
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=f109652)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual browser check:
  - YT lite: Tab focus, Enter/Space activation, SR announces at least "Play video"
  - Accordion: button announced with expanded/collapsed, `aria-controls` valid, body hidden toggles
  - SPA navigation rehydrate: inserted shortcodes remain interactive
