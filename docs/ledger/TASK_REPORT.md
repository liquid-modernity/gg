TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-UX-PANELS-NO-SCROLLTOP-20260222
TITLE: Prevent panel-open scroll jump on post detail

SUMMARY
- Audited `GG.modules.Panels` open/close path in `public/assets/latest/modules/ui.bucket.core.js` and confirmed no direct `scrollTo({ top: 0 ... })` calls inside the Panels module.
- Hardened focus behavior with new local helper `focusNoScroll(el)`:
  - Primary path: `el.focus({ preventScroll:true })`
  - Fallback path (older browsers): restore viewport using captured `pageXOffset/pageYOffset` after focus, so opening/closing panels does not jump article position.
- Applied helper to both panel-open focus path and focus-restore path (`focusPanel` + `restoreFocus`).
- Added guardrail verifier `tools/verify-no-scrolltop-panels.mjs` and wired it to `tools/gate-prod.sh`.

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- tools/verify-no-scrolltop-panels.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/8c1fb78/*

VERIFICATION OUTPUTS
- `node tools/verify-no-scrolltop-panels.mjs`
```text
PASS: panels no scrolltop contract
```

- `npm run gate:prod`
```text
PASS: panels no scrolltop contract
PASS: gate:prod
```

MANUAL SANITY
- Not executed in this CLI environment.
- Recommended browser check:
  - Open a long post, scroll mid-article.
  - Open left/right panel from post toolbar.
  - Confirm viewport position does not jump to top.
