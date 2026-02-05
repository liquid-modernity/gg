TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0003
TITLE: Update deploy workflow (auto after CI + manual gated + smoke always)

TASK_SUMMARY
- Deploy workflow now triggers on CI workflow_run success for main and also allows manual dispatch with full preflight gate.
- Manual dispatch is constrained to main and uses the same preflight checks as auto deploy.
- Post-deploy smoke tests now run unconditionally and fail the workflow on any smoke failure.
- Added pipeline documentation and XML helper scripts to satisfy preflight commands.

FILES_CHANGED
- .github/workflows/deploy.yml
- docs/ci/PIPELINE.md
- package.json
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION
- Ran: `bash tools/check-links.sh`
- Ran: `node tools/validate-xml.js`
- Ran: `node tools/verify-assets.mjs`
- Result: PASSED

RISKS / ROLLBACK
- Risk: smoke tests depend on live endpoints; failures will block deploy until endpoints are fixed.
- Rollback: revert this commit.
