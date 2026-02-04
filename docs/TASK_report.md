TASK_SUMMARY
- Added a CI workflow that runs link checks and XML well-formedness validation without any Cloudflare secrets.
- Restricted Deploy workflow to `workflow_dispatch` only and kept RUN_SMOKE opt-in.

FILES_CHANGED
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- docs/TASK_report.md

VERIFICATION
- Not run (workflow changes only).
- Expected: CI green on PRs without Cloudflare secrets; Deploy is manual with optional smoke test.

RISKS / ROLLBACK
- Risk: Naive XML validator may reject malformed XML differently than `xmllint`.
- Rollback: revert `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, and `docs/TASK_report.md`.
