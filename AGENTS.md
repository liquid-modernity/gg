# AGENTS.md — GAGA-ish Universal Instructions

You are Codex running inside this repository.

## Non-negotiables
- Work on ONE task per run. Read @GG_CAPSULE_V1 in main.js and follow NEXT_TASK unless user overrides.
- Make changes inside the repo only.
- Run verification commands before committing.
- Do not push if verification fails, if secrets are detected, or if branch/remote is unexpected.

## Default workflow for keyword "GG_RUN"
1) Read @GG_CAPSULE_V1 in main.js and identify NEXT_TASK.
2) Implement ONLY that task.
3) Update TASK_report.md (Task ID + Changes bullets must be present).
4) Run: ./scripts/gg auto
5) If any step fails, STOP and report what failed.


## Safety checks
- Never commit .env, keys, tokens, credentials, or private URLs.
- Abort if git status shows unexpected large changes (e.g., >200 files) unless user asked.
