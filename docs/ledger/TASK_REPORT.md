TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-REMOVE-DOMPARSER-AUTHORS-20260221
TITLE: Remove DOMParser from authors module + tighten ratchet

SUMMARY
- Replaced DOMParser HTML parsing in `ui.bucket.authors.js` with safe JSON script extraction using regex + `JSON.parse`.
- Added shared helpers inside module:
  - `extractJsonScript(html, id)`
  - `parseJsonFromScript(html, id)`
- Applied parser for both directories:
  - authors dir from `#gg-authors-dir`
  - tags dir from `#gg-tags-dir`
- Added shape validation for authors payload requiring `authors.pakrpp.href`; invalid payload now fails gracefully to fallback cache/empty map (no throw).
- Removed allowlist entries `LEGACY-0001` and `LEGACY-0002`.
- Added verifier `tools/verify-no-domparser-authors.mjs` and wired it to `tools/gate-prod.sh`.

ALLOWLIST COUNT
- Before: `5`
- After: `3`
- max_allow: `3`

IDS REMOVED
- LEGACY-0001
- LEGACY-0002

FILES CHANGED
- public/assets/latest/modules/ui.bucket.authors.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-no-domparser-authors.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-no-domparser-authors.mjs`
```text
PASS: authors module has no DOMParser
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
PASS: shortcodes has no innerHTML writes
VERIFY_SHORTCODES_TEMPLATES: PASS
PASS: authors module has no DOMParser
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=3 allowlisted_matches=3 violations=0
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=7a7c4cc)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual browser check:
  - `/p/author.html` and `/p/tags.html` directory rendering + link correctness
  - no console errors while author/tag directory data loads
