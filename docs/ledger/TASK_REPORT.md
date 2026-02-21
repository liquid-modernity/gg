TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-NATIVE-FEEL-OVERLAY-CMD-TRAP-20260221
TITLE: Modal contract for overlays (trap + esc + restore focus)

TARGET OVERLAYS FOUND (PRE-CODE DISCOVERY)
- Command/search overlay root: `#gg-palette-list`
- Command/search open entry points:
  - window event `gg:search-open`
  - dock search input `#gg-dock .gg-dock__search input[type="search"]` (focus/input path)
  - hotkey path `Ctrl/Cmd+K` via UI loader -> `search.openFromHotkey()`
- Command/search close controls:
  - `[data-gg-dock-close]`
  - `Escape`
  - outside pointerdown path in search module
- Comments help overlay root: `[data-gg-modal="comments-help"]`
- Comments help open trigger: `[data-gg-action="comments-help"]`
- Comments help close selector/path:
  - `[data-gg-action="comments-help-close"]`
  - backdrop click (`event.target === modal root`)

SUMMARY
- Added `GG.services.a11y.modalOpen(modalEl, triggerEl, opts)` and `GG.services.a11y.modalClose(modalEl, opts)` in `ui.bucket.core.js`.
- Enforced modal ARIA contract on open (`role="dialog"`, `aria-modal="true"`, optional label, focusability via `tabindex=-1`).
- Added deterministic single-modal behavior via global active modal tracking (`_activeModalEl`, `_activeModalCleanup`, `_activeModalTrigger`).
- Added Esc-close behavior (capture keydown) and focus restore to opening trigger.
- Wired helper into actual overlays:
  - command/search palette (`#gg-palette-list`) by patching `GG.modules.search.open/close`
  - comments-help modal toggle/actions
  - generic `ui.overlay.open/close`
- Added route-change cleanup to close active modal before route a11y focus/announce.
- Added static verifier `tools/verify-overlay-modal-contract.mjs` and wired into `tools/gate-prod.sh`.

CHANGES
- public/assets/latest/modules/ui.bucket.core.js
- tools/verify-overlay-modal-contract.mjs
- tools/gate-prod.sh
- tools/perf-budgets.json
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-overlay-modal-contract.mjs`
```text
VERIFY_OVERLAY_MODAL_CONTRACT: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=42 allowlisted_matches=42 violations=0
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

- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=42 allowlisted_matches=42 violations=0
```

- `bash tools/gate-release.sh`
```text
VERIFY_OVERLAY_MODAL_CONTRACT: PASS
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

MANUAL SANITY
- Not executable in this sandbox (no interactive browser).
- Pending checks on real browser session:
  - Ctrl/Cmd+K open palette -> Tab/Shift+Tab stay inside modal, Esc closes, focus returns to trigger.
  - Open overlay A then B -> previous overlay auto closes (single-modal rule).

NOTES
- No new `innerHTML`/`insertAdjacentHTML` was introduced.
- Budget baseline for `modules/ui.bucket.core.js` was re-aligned to absorb modal helper footprint (`max_raw 232000`, `max_gzip 57000`).
