TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0004.1
TITLE: Lockfile policy fix (commit lockfile + enforce npm ci)

TASK_SUMMARY
- Committed `package-lock.json` to make installs deterministic.
- Added lockfile guard steps in CI and deploy workflows (fail fast if lockfile missing).
- Updated pipeline documentation with lockfile policy and update procedure.

FILES_CHANGED
- package-lock.json
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- docs/ci/PIPELINE.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

COMMANDS RUN
- `npm install --package-lock-only --ignore-scripts`

CI/DEPLOY EXPECTATIONS
- CI (`CI` workflow) fails immediately if `package-lock.json` is missing.
- CI runs `npm ci` and all verifiers; green means build/verify passed.
- Deploy workflow also fails if lockfile is missing and uses `npm ci` only.

HOW TO VERIFY IN GITHUB ACTIONS
1) Open Actions → `CI` workflow.
2) Confirm a step named “Guard lockfile” fails if `package-lock.json` is removed.
3) Confirm “Install deps (npm ci)” runs without lockfile generation.
4) Confirm deploy workflow still runs only after CI success.

RISKS / ROLLBACK
- Risk: none (workflow + lockfile + docs only).
- Rollback: revert this commit.
