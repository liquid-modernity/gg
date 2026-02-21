TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-RULEBOOK-20260221
TITLE: Sync AGENTS + NAMING + add verify-rulebooks guardrail

TASK_SUMMARY
- Overwrite `docs/AGENTS.md` as the operational rulebook and explicitly enforce `docs/NAMING.md` as mandatory.
- Create/sync `docs/NAMING.md` as the naming/contract source of truth.
- Add `tools/verify-rulebooks.mjs` with hard-fail checks for rulebook existence, mandatory reference, and date lock (`2026-02-21`).
- Wire guardrail into verification pipeline via `package.json` (`verify:rulebooks` + chain into `verify:release`).
- Update ledger artifacts (`GG_CAPSULE`, `TASK_LOG`, `TASK_REPORT`).
- Validation result during this task: AGENTS/NAMING/verifier/package/GG_CAPSULE targets were already in the expected state in `HEAD`, so no additional net diff was required on those files.

CHANGES
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION EVIDENCE (manual)
- `node tools/verify-rulebooks.mjs` -> PASS
- `ALLOW_DIRTY_RELEASE=1 npm run build` -> PASS (`RELEASE_ID 23dc4a0`)
- `npm run verify:release` -> PASS
- `npm run verify:assets` -> PASS
- `node tools/verify-template-contract.mjs` -> PASS
- `node tools/verify-router-contract.mjs` -> PASS
- `node tools/verify-budgets.mjs` -> PASS
- `node tools/verify-inline-css.mjs` -> PASS
- `node tools/verify-crp.mjs` -> PASS
- `SMOKE_LIVE_HTML=1 tools/smoke.sh` -> FAIL (expected local release `23dc4a0`, live worker still `09e2ce4`)
- `SMOKE_EXPECT=live SMOKE_LIVE_HTML=1 tools/smoke.sh` -> PASS (full live smoke checks passed)

RISKS / ROLLBACK
- Risk: low/med; release id is now `23dc4a0` in repo, while live remains `09e2ce4` until deployment runs.
- Rollback: revert this commit to restore previous docs/verifier/pipeline/ledger state.
