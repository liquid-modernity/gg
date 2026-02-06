TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0006H
TITLE: True lazy UI (no forced timeout, no import auto-init)

TASK_SUMMARY
- UI module is now requested only on interceptable internal link clicks; pointerdown/keydown and idle timeouts removed.
- modules/ui.js no longer auto-runs boot init on import; init is explicit and idempotent.
- CRP plan updated for Phase 2H.

FILES_CHANGED
- public/assets/latest/core.js
- public/assets/latest/modules/ui.js
- docs/perf/CRP_PLAN.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `npm run build`
- `node tools/verify-budgets.mjs`
- `node tools/verify-headers.mjs --mode=config`

MANUAL SMOKE
1) Click internal link → dev log shows "UI module requested by internal click" and navigation works (SPA if ready, fallback if slow).
2) Confirm no pointerdown/keydown trigger loads UI module.
3) `rg -n "GG.boot.init" public/assets/latest/modules/ui.js` shows only function-body references.

RISKS / ROLLBACK
- Risk: first internal click may fall back to full navigation if UI module not ready.
- Rollback: revert this commit.
