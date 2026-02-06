TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0006H.1
TITLE: Ledger contract fix (single release truth)

TASK_SUMMARY
- TASK_LOG is no longer allowed to carry `RELEASE_ID` values; policy entry appended and a new policy doc added.
- `tools/verify-ledger.mjs` now enforces the policy and fails CI/deploy if `RELEASE_ID` appears after the policy marker.
- CI/deploy step names updated to reflect ledger + doc contract enforcement; pipeline docs updated.

FILES_CHANGED
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_LOG_POLICY.md
- tools/verify-ledger.mjs
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- docs/ci/PIPELINE.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `node tools/verify-ledger.mjs`

RISKS / ROLLBACK
- Risk: none; policy-only + deterministic verifier.
- Rollback: revert this commit.
