TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-REMOVE-DOMPARSER-CORE-SINGLETON-20260221
TITLE: Centralize DOMParser parsing (singleton + safety budget) + tighten ratchet

SUMMARY
- Added centralized parser helper `parseHtmlDoc(html, url)` in `ui.bucket.core.js` with safety contract:
  - size budget: reject input over 2MB
  - same-origin expectation when URL is provided
  - single DOMParser callsite only
- Replaced two former DOMParser callsites with helper usage:
  - LoadMore fetch HTML parse path
  - `parseHeadingItems(html, sourceUrl)` parse path
- Kept core render pipeline behavior intact while routing parser through the same helper.
- Removed LEGACY-0022 and LEGACY-0027; only LEGACY-0013 remains for DOMParser pattern.
- Added verifier `tools/verify-core-domparser-singleton.mjs` and wired it into `tools/gate-prod.sh`.

ALLOWLIST COUNT
- Before: `3`
- After: `1`
- max_allow: `1`

IDS REMOVED
- LEGACY-0022
- LEGACY-0027

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-core-domparser-singleton.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-core-domparser-singleton.mjs`
```text
PASS: core DOMParser is singleton + budgeted
```

- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
PASS: core swap has no innerHTML
PASS: core DOMParser is singleton + budgeted
PASS: panels skeleton has no innerHTML
PASS: comments gate has no innerHTML
PASS: shortcodes has no innerHTML writes
VERIFY_SHORTCODES_TEMPLATES: PASS
PASS: authors module has no DOMParser
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=1 allowlisted_matches=1 violations=0
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=6491208)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual browser sanity:
  - listing -> post -> back (no blank main / no console errors)
  - load more posts still appends correctly
  - TOC/headings parse still produces heading list
