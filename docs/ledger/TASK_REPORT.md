TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0007C.1
TITLE: Make tools/smoke.sh read RELEASE_ID from GG_CAPSULE with fallback logs

TASK_SUMMARY
- Added capsule-first RELEASE_ID detection in tools/smoke.sh.
- Improved logs to explain when fallback to worker header is used.
- Kept deploy workflow unchanged.

BEHAVIOR
- If GG_CAPSULE has a valid RELEASE_ID:
  - INFO: expected RELEASE_ID from GG_CAPSULE: <id>
  - smoke uses that id.
- If GG_CAPSULE missing/unparseable:
  - WARN: GG_CAPSULE missing/unparseable; falling back to worker header
  - WARN: could not parse RELEASE_ID from docs/ledger/GG_CAPSULE.md; using worker header: <id>

EXAMPLE OUTPUT (capsule ok)
- DEBUG: GG_CAPSULE present: yes (<abs path>)
- INFO: expected RELEASE_ID from GG_CAPSULE: 1a2b3c4

EXAMPLE OUTPUT (capsule missing)
- DEBUG: GG_CAPSULE present: no (<abs path>)
- WARN: GG_CAPSULE missing/unparseable; falling back to worker header
- WARN: could not parse RELEASE_ID from docs/ledger/GG_CAPSULE.md; using worker header: 1a2b3c4

CONSTRAINTS CONFIRMED
- Local tool only; no workflow changes.

CHANGES
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `tools/smoke.sh`
- `SMOKE_EXPECT=<id> tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; log-only/tooling behavior.
- Rollback: revert this commit.
