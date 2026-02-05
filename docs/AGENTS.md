# AGENTS.md — GAGA-ish Universal Instructions
Last updated: 2026-02-05

You are Codex running inside this repository.

## Non-negotiables
- Work on ONE task per run. Read `docs/ledger/GG_CAPSULE.md` and follow NEXT_TASK unless user overrides.
- Make changes inside the repo only.
- Run verification commands before committing.
- Do not push if verification fails, if secrets are detected, or if branch/remote is unexpected.
- Main-only workflow: stay on `main` (no forced feature branches).

## TASK LOGGING (MANDATORY)
- Append a new entry to `docs/ledger/TASK_LOG.md` for every task (never edit old entries).
- Update `docs/ledger/GG_CAPSULE.md` (overwrite) with NOW/NEXT/LAST_PATCH and current RELEASE_ID.
- Update `docs/ledger/TASK_REPORT.md` (overwrite) with full details and verification steps.
- If any step cannot be completed, record the reason in `docs/ledger/TASK_LOG.md` and `docs/ledger/TASK_REPORT.md`.

## Owner Context
- Secrets available (GitHub Actions): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`.
- Infra goals: "Saya mau GitHub Actions harus hijau".
- Infra goals: "Saya mau deploy Cloudflare".
- Infra goals: "Saya mau preview hasil style/JS".

## Default workflow for keyword "GG_RUN"
1) Read `docs/ledger/GG_CAPSULE.md` and identify NEXT_TASK.
2) Implement ONLY that task.
3) Update `docs/ledger/TASK_REPORT.md` (Task ID + Changes bullets must be present).
4) Run: ./scripts/gg auto
5) If any step fails, STOP and report what failed.


## Safety checks
- Never commit .env, keys, tokens, credentials, or private URLs.
- Abort if git status shows unexpected large changes (e.g., >200 files) unless user asked.
