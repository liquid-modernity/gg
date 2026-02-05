TASK_SUMMARY
- Removed heredocs from deploy workflow by switching to `python3 -c` with `$'...'` strings.
- Kept CI XML validation using `tools/validate-xml.js` (no heredoc usage).

FILES_CHANGED
- .github/workflows/deploy.yml
- docs/TASK_report.md

VERIFICATION
- Not run locally; workflow change only.
- Expected: no `<<'PY'`/`<<'NODE'` heredocs in workflows.

RISKS / ROLLBACK
- Risk: If runner shell does not support `$'...'` (unlikely on Ubuntu bash), the deploy route audit could fail.
- Rollback: revert `.github/workflows/deploy.yml` and `docs/TASK_report.md`.
