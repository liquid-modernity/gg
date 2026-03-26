# GitHub Actions Cloudflare Deploy

## One true ship command

`npm run gaga` is the GitHub-first shipping command.

What it does locally:
- verifies git is installed and branch is `main`
- verifies `origin` exists
- runs lightweight preflight only (`node --check src/worker.js`, `node qa/template-fingerprint.mjs --check`)
- stages changes, creates release commit (default: `chore(release): ship latest GG changes`), pushes to `origin/main`

What it does **not** do locally:
- no local Wrangler deploy
- no local Playwright/browser proof

## Script contract

- `npm run gaga`: GitHub-first ship (push to `origin/main`)
- `npm run gaga:preflight`: lightweight local preflight only
- `npm run gaga:push`: same release orchestrator as `gaga`
- `npm run gaga:cf:deploy`: local direct Cloudflare deploy (capable machines)
- `npm run gaga:cf:dry`: local direct Cloudflare dry-run
- `npm run gaga:verify-worker`: worker-scope live smoke lane
- `npm run gaga:verify-template`: strict full public/template-sensitive lane

## Workflow scope

- `.github/workflows/ci.yml`
  - installs deps
  - builds Blogger publish artifact
  - runs `npm run gaga:preflight`
  - runs `npm run gaga:cf:dry`

- `.github/workflows/deploy.yml`
  - runs after CI success on `main` (or manual `workflow_dispatch`)
  - deploys Cloudflare Worker + static assets
  - does **not** publish Blogger template/theme

## Deploy lanes and hard gates

Always hard-gated:
- Cloudflare deploy
- worker rollout/version checks
- worker-scope smoke (`qa/live-smoke-worker.sh`)

Full public/template-sensitive smoke (`qa/live-smoke.sh`):
- if `index.prod.xml` did **not** change: runs as hard gate
- if `index.prod.xml` changed and no strict mode: skipped by design (Blogger publish out of scope)
- manual dispatch with `strict_template_parity=true`: runs as hard gate
- manual dispatch with `run_full_public_smoke=true`: runs in warning lane (informational)

## Required GitHub config

- secret `CLOUDFLARE_API_TOKEN`
- secret `CLOUDFLARE_ACCOUNT_ID`
- variable `GG_LIVE_BASE_URL` (recommended `https://www.pakrpp.com`)

## Blogger manual publish responsibilities

When `index.prod.xml` changes, Blogger template publish remains manual. Use:
- `qa/template-release-playbook.md`
- post-publish strict verify: `npm run gaga:verify-template`

## Interpreting deploy status

- Green + `Blogger manual publish pending=yes`
  - Worker release successful, public template parity still pending.
- Green + `Blogger manual publish pending=no`
  - Full public parity verified.
- Red
  - A hard gate failed (deploy, worker rollout, worker smoke, or strict full public smoke).
