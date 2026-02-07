TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008B.2.1
TITLE: Fix tools/smoke.sh redirect assertion (Location may be absolute URL)

TASK_SUMMARY
- Make redirect smoke check tolerant of absolute or relative Location values by substring matching /blog.
- Strip CR from headers and extract Location case-insensitively.
- On failure, print Location and the first 30 header lines for diagnostics.

RATIONALE
- Live redirects can return absolute URLs; the smoke check should validate intent, not URL form.

BEHAVIOR
- Redirect check passes for Location: /blog or https://www.pakrpp.com/blog.
- Redirect check still fails if status is not 301, Location is missing, or Location contains view=blog.
- Failure logs include Location plus the first 30 response header lines.

CHANGES
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; local tooling only.
- Rollback: revert this commit.
