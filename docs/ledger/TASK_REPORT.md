TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0002A
TITLE: Contract cleanup (main-only, GG_CAPSULE md-only, asset path consistency)

TASK_SUMMARY
- Enforced main-only workflow in `tools/scripts:gg` and removed feature-branch auto-creation.
- Switched capsule parsing to `docs/ledger/GG_CAPSULE.md` (md-only) and updated related help text.
- Updated worker verification script to check `/assets/latest/*` instead of `/assets/dev/*`.
- Removed legacy capsule references from docs; added audit addendum about `/assets/latest`.

FILES_CHANGED
- docs/AGENTS.md
- docs/tech-stack.md
- docs/roadmap.md
- docs/note for gaga.md
- tools/scripts:gg
- tools/verify-worker.sh
- docs/audit/AUDIT_REPORT.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION
- Ran: `bash tools/check-links.sh`
- Ran: `node tools/validate-xml.js`
- Ran: `node tools/verify-assets.mjs`
- Result: PASSED

RISKS / ROLLBACK
- Risk: None (workflow/tooling/doc consistency only).
- Rollback: revert this commit.
