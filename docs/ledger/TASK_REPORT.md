TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0004B.2
TITLE: Auto-sync GG_CAPSULE release id + enforce ledger consistency

TASK_SUMMARY
- Added AUTOGEN block in `docs/ledger/GG_CAPSULE.md` and removed manual RELEASE_ID section.
- Updated `tools/release.js` to sync the AUTOGEN block on every `npm run build`.
- Added `tools/verify-ledger.mjs` and wired it into CI + deploy to fail on drift.
- Documented ledger sync policy in `docs/ci/PIPELINE.md`.

FILES_CHANGED
- docs/ledger/GG_CAPSULE.md
- tools/release.js
- tools/verify-ledger.mjs
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- docs/ci/PIPELINE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `node tools/verify-ledger.mjs`
- (recommended) `npm run build` → verify GG_CAPSULE AUTOGEN, index.prod.xml, sw.js, worker.js are in sync

HOW TO VERIFY IN GITHUB ACTIONS
1) Open Actions → `CI` workflow.
2) Confirm step “Verify ledger sync” runs after build and fails on mismatch.
3) Confirm deploy workflow also runs “Verify ledger sync” after preflight build.

EXPECTED OUTCOMES
- GG_CAPSULE has exactly one RELEASE_ID in the AUTOGEN block.
- CI/deploy fail with a single instruction if release ids drift.

RISKS / ROLLBACK
- Risk: none (tooling + docs only).
- Rollback: revert this commit.
