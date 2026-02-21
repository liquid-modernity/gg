TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PHASE6-CORE-QUICK-WINS-20260221
TITLE: Replace core quick-win innerHTML/template blocks with DOM nodes + tighten ratchet

SUMMARY
- Refactored the targeted core legacy blocks in `public/assets/latest/modules/ui.bucket.core.js` to pure DOM APIs:
  - LEGACY-0015: `ui.skeleton.render` now builds skeleton bars via `createElement`.
  - LEGACY-0033: `GG.modules.Skeleton.buildCard` now builds thumb/line nodes with DOM.
  - LEGACY-0034: `GG.modules.RelatedInline.buildCard` now builds eyebrow/title/thumb/meta nodes with DOM.
  - LEGACY-0037 + LEGACY-0038: YouTube hydrate now creates `iframe` node and appends it.
  - LEGACY-0039: left panel header now built with DOM nodes.
- Removed the corresponding legacy annotations from core callsites.
- Removed six entries from allowlist and tightened ratchet.

ALLOWLIST COUNT
- Before: `16`
- After: `10`
- `max_allow`: `10`

IDS REMOVED
- LEGACY-0015
- LEGACY-0033
- LEGACY-0034
- LEGACY-0037
- LEGACY-0038
- LEGACY-0039

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=10 allowlisted_matches=10 violations=0
```

- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=10 allowlisted_matches=10 violations=0
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=79c5b91)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

NOTES
- During gate preflight, release alignment moved from `ff1c3d0` to `79c5b91` via `ALLOW_DIRTY_RELEASE=1 npm run build` inside `tools/gate-prod.sh`.
- Manual browser sanity is still recommended for visual parity of skeleton blocks, related inline card rendering, YouTube lite hydration, and left panel header.
