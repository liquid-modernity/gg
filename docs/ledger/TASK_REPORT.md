TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0007B.1
TITLE: Deploy verifies live HTML pins release

TASK_SUMMARY
- Added a deploy workflow gate that checks live HTML for pinned /assets/v/<REL>/main.css and /assets/v/<REL>/boot.js on home and /blog.
- Optional local smoke mode validates live HTML pins against the capsule release id.

CHANGES
- .github/workflows/deploy.yml
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

NOTES
- Deploy now fails with an actionable message until index.prod.xml is pasted into Blogger.

RISKS / ROLLBACK
- Risk: low; adds a post-deploy gate only.
- Rollback: revert this commit.
