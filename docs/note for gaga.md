# Note for GAGA
Last updated: 2026-02-05

chmod +x scripts/gg

GG_RUN.

Rules:
- Follow NEXT_TASK in @GG_CAPSULE_V1 (main.js) unless user overrides.
- Do ONE task only.
- Task logging is mandatory:
  - Append `docs/ledger/TASK_LOG.md` (never edit old entries).
  - Overwrite `docs/ledger/GG_CAPSULE.md` (NOW/NEXT/LAST_PATCH + RELEASE_ID).
  - Overwrite `docs/ledger/TASK_REPORT.md` (full details + verification steps).
- Then run: `./scripts/gg auto` (skip only if task is docs-only and verification is not applicable).
- If verify fails, stop and report what failed.
