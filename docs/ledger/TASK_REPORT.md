TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PHASE6-TRIVIAL-REMAINS-LISTING-POST-CMD-20260221
TITLE: Remove remaining trivial HTML-in-JS in listing/post/cmd + tighten ratchet

SUMMARY
- Replaced all remaining `innerHTML = ...` assignments in target modules with DOM API rendering:
  - `public/assets/latest/modules/ui.bucket.listing.js` (LEGACY-0044, LEGACY-0051, LEGACY-0060)
  - `public/assets/latest/modules/ui.bucket.post.js` (LEGACY-0071, LEGACY-0072)
  - `public/assets/latest/modules/ui.bucket.cmd.js` (LEGACY-0012)
- Added new guardrail verifier `tools/verify-no-innerhtml-assign-modules.mjs` and wired it into `tools/gate-prod.sh`.
- Removed migrated legacy IDs from allowlist and tightened ratchet.

ALLOWLIST COUNT
- Before: `22`
- After: `16`
- `max_allow`: `16`

IDS REMOVED
- LEGACY-0012
- LEGACY-0044
- LEGACY-0051
- LEGACY-0060
- LEGACY-0071
- LEGACY-0072

FILES CHANGED
- public/assets/latest/modules/ui.bucket.listing.js
- public/assets/latest/modules/ui.bucket.post.js
- public/assets/latest/modules/ui.bucket.cmd.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-no-innerhtml-assign-modules.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-no-innerhtml-assign-modules.mjs`
```text
VERIFY_NO_INNERHTML_ASSIGN_MODULES: PASS
```

- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=16 allowlisted_matches=16 violations=0
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=16 allowlisted_matches=16 violations=0
VERIFY_NO_INNERHTML_ASSIGN_MODULES: PASS
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=0fd3deb)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

NOTES
- Initial `gate:prod` run failed due `verify-budgets` on `ui.bucket.listing.js`; resolved by slimming implementation while preserving DOM-only rendering.
- Initial `verify-palette-a11y` fallback failed because verifier expects literal option role token in command module; resolved by keeping explicit static token while retaining DOM node construction.
- Manual sanity checks for listing/post/cmd behavior remain required in browser.
