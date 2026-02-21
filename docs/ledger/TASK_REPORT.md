TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PHASE7-CORE-SPA-SWAP-NO-INNERHTML-20260221
TITLE: Swap #gg-main via DOM nodes (no innerHTML) + tighten ratchet

SUMMARY
- Replaced `target.innerHTML = source.innerHTML` in `GG.core.render.apply()` with DOM clone swap flow.
- Added `cloneSwapContent(srcEl)` to clone `source.childNodes` into a `DocumentFragment`.
- Added script neutralization during clone:
  - top-level and nested `<script>` nodes are changed to `type="text/plain"`
  - scripts are marked `data-gg-inert="1"`
  - then appended as inert nodes (no execution during swap)
- Kept post-swap pipeline intact (no behavior contract change):
  - `layout.sync`
  - `surface.update`
  - `meta.update`
  - `rehydrateComments`
  - `GG.app.rehydrate`
- Added verifier `tools/verify-core-swap-no-innerhtml.mjs` and wired it into `tools/gate-prod.sh`.
- Removed LEGACY-0014 from allowlist and tightened ratchet.

ALLOWLIST COUNT
- Before: `10`
- After: `9`
- `max_allow`: `9`

IDS REMOVED
- LEGACY-0014

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-core-swap-no-innerhtml.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-core-swap-no-innerhtml.mjs`
```text
PASS: core swap has no innerHTML
```

- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=9 allowlisted_matches=9 violations=0
```

- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
PASS: core swap has no innerHTML
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=9 allowlisted_matches=9 violations=0
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=73c49f1)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

NOTES
- During gate preflight, release alignment moved from `35a8a1e` to `73c49f1` via `ALLOW_DIRTY_RELEASE=1 npm run build` inside `tools/gate-prod.sh`.
- Manual browser sanity (listing -> post -> back, focus on `#gg-main`, no blank swap, and inert embedded script behavior) is still recommended.
