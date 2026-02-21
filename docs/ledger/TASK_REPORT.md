TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PHASE7-COMMENTS-GATE-NO-INNERHTML-20260221
TITLE: Clone comments gate template without innerHTML + tighten ratchet

SUMMARY
- Replaced comments gate template copy fallback from `tmp.innerHTML = tpl.innerHTML` to safe node cloning from `tpl.content.childNodes` (or `tpl.childNodes` fallback), then appended via `DocumentFragment`.
- Removed LEGACY annotation for LEGACY-0035 in `ui.bucket.core.js` and removed LEGACY-0035 from allowlist.
- Added verifier `tools/verify-comments-gate-no-innerhtml.mjs` and wired it into `tools/gate-prod.sh`.
- Kept comments behavior intact (no string parsing, no native comments flow interception).

ALLOWLIST COUNT
- Before: `8`
- After: `7`
- max_allow: `7`

IDS REMOVED
- LEGACY-0035

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-comments-gate-no-innerhtml.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-comments-gate-no-innerhtml.mjs`
```text
PASS: comments gate has no innerHTML
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
PASS: comments gate has no innerHTML
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=7 allowlisted_matches=7 violations=0
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=c690b35)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual browser check on a post with comments: comments load, layout intact, no console errors, and native comment form behavior remains normal.
