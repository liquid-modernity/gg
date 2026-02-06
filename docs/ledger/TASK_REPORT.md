TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0006E.1
TITLE: Deploy parity (no manual bypass)

TASK_SUMMARY
- Deploy preflight now runs the same CRP/inline/header config guards as CI.
- Manual dispatch cannot bypass CRP/inline/ledger/budget checks.
- Pipeline docs updated to list deploy verifiers explicitly.

FILES_CHANGED
- .github/workflows/deploy.yml
- docs/ci/PIPELINE.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `node tools/verify-inline-css.mjs`
- `node tools/verify-crp.mjs`

HOW TO VERIFY DEPLOY BLOCKS (DRY RUN)
1) Temporarily edit `index.prod.xml` to add a blocking font CSS link:
   - Change the fonts preload link to `rel='stylesheet'`.
2) Run deploy workflow via manual dispatch.
3) Confirm the deploy job fails at step `Verify CRP regressions`.
4) Revert the temporary change.

CI/DEPLOY GATES (DEPLOY PRECHECK)
- `npm ci`
- `npm run build`
- `npm run verify:assets`
- `npm run build:xml`
- `npm run verify:xml`
- `node tools/verify-ledger.mjs`
- `node tools/verify-budgets.mjs`
- `node tools/verify-inline-css.mjs`
- `node tools/verify-crp.mjs`
- `node tools/verify-headers.mjs --mode=config`

RISKS / ROLLBACK
- Risk: stricter preflight blocks deploy if CRP rules are violated.
- Rollback: revert this commit.
