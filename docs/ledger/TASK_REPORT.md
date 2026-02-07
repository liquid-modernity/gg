TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008B.2.2
TITLE: Fix tools/smoke.sh Location parsing (preserve full URL value containing https://)

TASK_SUMMARY
- Fix Location parsing so https:// URLs are preserved in full.
- Keep redirect assertions and failure diagnostics intact.

RATIONALE
- Splitting on ':' truncates absolute URLs; smoke should validate the full Location value.

BEHAVIOR
- Redirect check passes for Location: https://www.pakrpp.com/blog or /blog.
- Redirect check still fails if status is not 301, Location is missing, or Location contains view=blog.
- Debug output prints the full Location value.

CHANGES
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; local tooling only.
- Rollback: revert this commit.
