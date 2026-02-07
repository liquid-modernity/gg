TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0007C.1.1
TITLE: Harden tools/smoke.sh: SMOKE_LIVE_HTML uses expected_release

TASK_SUMMARY
- Resolved expected_release once (SMOKE_EXPECT -> GG_CAPSULE -> worker header).
- Live HTML checks now reuse the resolved expected_release (no second capsule read).
- Logs clearly show the source of expected_release.

WHY
- Prevents false failures when GG_CAPSULE is missing but worker header is available.

BEHAVIOR
- INFO: expected RELEASE_ID (SMOKE_EXPECT|GG_CAPSULE|WORKER_HEADER): <id>
- WARN when falling back to worker header due to missing/unparseable capsule.
- SMOKE_LIVE_HTML uses expected_release directly.

CONSTRAINTS CONFIRMED
- Local tool only; no workflow changes.

CHANGES
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `tools/smoke.sh`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; log-only/tooling behavior.
- Rollback: revert this commit.
