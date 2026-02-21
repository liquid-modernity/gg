TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-A11Y-KEYBOARD-TRAP-SWEEP-20260221
TITLE: Keep palette as combobox/listbox (no modal) + add keyboard trap sweep guardrails

SUMMARY
- Removed semantic mistake: command/search palette (`#gg-palette-list`) is no longer treated as modal dialog.
- Retained true modal behavior for real dialogs (share sheet, comments help, overlay, panels flow unchanged).
- Hardened `GG.services.a11y.modalOpen` so listbox/palette cannot be modalized accidentally in future.
- Added static guardrails and wired them into `gate:prod`.
- Added manual QA checklist for consistent keyboard-trap sweep.

WHAT WAS REMOVED (PALETTE MODALIZATION)
- Deleted palette modal patch block in `public/assets/latest/modules/ui.bucket.core.js`:
  - `ggPaletteOverlay()`
  - `patchSearchOverlayModalBindings()`
  - `bindSearchOverlayModal()`
  - `gg:search-open` listener that called `GG.services.a11y.modalOpen(panel, ...)` for `#gg-palette-list`

CHANGES
- `public/assets/latest/modules/ui.bucket.core.js`
  - removed modal binding for palette/listbox.
  - added `modalOpen` guard:
    - if `modalEl.id === "gg-palette-list"` or `role="listbox"` => return false (no dialog role/aria-modal/focusTrap).
- `tools/verify-palette-not-modal.mjs` (new)
- `tools/verify-modal-open-close-parity.mjs` (new)
- `tools/gate-prod.sh` (wire new verifiers)
- `docs/a11y/KEYBOARD_TRAP_SWEEP.md` (new manual checklist)
- `docs/ledger/TASK_LOG.md`
- `docs/ledger/TASK_REPORT.md`
- `docs/ledger/GG_CAPSULE.md`
- `index.prod.xml`
- `public/sw.js`
- `src/worker.js`
- `public/assets/v/<RELEASE_ID>/*`

VERIFICATION OUTPUTS
- `node tools/verify-palette-not-modal.mjs`
```text
VERIFY_PALETTE_NOT_MODAL: PASS
```

- `node tools/verify-modal-open-close-parity.mjs`
```text
VERIFY_MODAL_OPEN_CLOSE_PARITY: PASS modalOpen=3 modalClose=6
```

- `node tools/verify-palette-a11y.mjs --mode=repo`
```text
PASS: palette a11y contract (mode=repo, release=d80ee2d)
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=42 allowlisted_matches=42 violations=0
VERIFY_SKIP_LINK_CONTRACT: PASS
VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=69 labeled=69 unlabeledSuspects=0
VERIFY_PALETTE_NOT_MODAL: PASS
VERIFY_MODAL_OPEN_CLOSE_PARITY: PASS modalOpen=3 modalClose=6
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

- `bash tools/gate-release.sh`
```text
VERIFY_PALETTE_NOT_MODAL: PASS
VERIFY_MODAL_OPEN_CLOSE_PARITY: PASS modalOpen=3 modalClose=6
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

MANUAL SWEEP ARTIFACT
- Added `docs/a11y/KEYBOARD_TRAP_SWEEP.md` with repeatable checkbox flow for:
  - post panels
  - share sheet
  - comments help modal
  - overlay
  - search dock combobox/listbox (explicitly no trap)
