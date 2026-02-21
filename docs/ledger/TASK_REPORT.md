TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PHASE7-CORE-PANEL-SKELETON-NO-INNERHTML-20260221
TITLE: Build panels skeleton via DOM (no innerHTML) + tighten ratchet

SUMMARY
- Replaced editorial preview skeleton rendering in `GG.modules.InfoPanel` from `panel.innerHTML = ...` template markup to DOM-only builder (`createElement`, `textContent`, `appendChild`).
- Kept panel interaction contracts unchanged (open/close flow, focus panel behavior, panel state hooks).
- Added verifier `tools/verify-core-panel-no-innerhtml.mjs` and wired it into `tools/gate-prod.sh`.
- Removed LEGACY-0024 from HTML-in-JS allowlist and tightened ratchet.

ALLOWLIST COUNT
- Before: `9`
- After: `8`
- max_allow: `8`

IDS REMOVED
- LEGACY-0024

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-core-panel-no-innerhtml.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-core-panel-no-innerhtml.mjs`
```text
PASS: panels skeleton has no innerHTML
```

- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
PASS: core swap has no innerHTML
PASS: panels skeleton has no innerHTML
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=8 allowlisted_matches=8 violations=0
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=b13d129)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual browser check: open left/right panels, ensure content visible, no console errors, focus trap still works.
