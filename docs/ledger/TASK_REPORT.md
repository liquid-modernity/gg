TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0006
TITLE: CRP plan + perf budgets + CI budget guard

TASK_SUMMARY
- Added a CRP doctrine in `docs/perf/CRP_PLAN.md`.
- Added performance budgets in `tools/perf-budgets.json` and a deterministic verifier `tools/verify-budgets.mjs`.
- Wired budget checks into CI and deploy preflight.
- Updated pipeline docs and ledger state.

FILES_CHANGED
- docs/perf/CRP_PLAN.md
- tools/perf-budgets.json
- tools/verify-budgets.mjs
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- docs/ci/PIPELINE.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `node tools/verify-budgets.mjs`

CI/DEPLOY HOOKS
- CI runs: `node tools/verify-budgets.mjs` after build (deterministic).
- Deploy preflight runs: `node tools/verify-budgets.mjs`.

BUDGETS ENFORCED (HIGHLIGHTS)
- `main.js` and `main.css` raw + gzip size budgets (15% buffer).
- `sw.js` and `offline.html` raw size budgets.

HOW TO VERIFY IN ACTIONS
1) CI → step “Verify performance budgets” should pass.
2) Deploy → step “Verify performance budgets” should pass during preflight.

RISKS / ROLLBACK
- Risk: budgets too tight can block releases; adjust intentionally when assets grow.
- Rollback: revert this commit.
