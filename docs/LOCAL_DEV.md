# Local Development
Last updated: 2026-02-05

## Prereqs
- macOS 10.15 (Catalina) tested
- Node.js 20.x
- npm
- git
- ripgrep (`rg`)

## Core Commands
- Install deps: `npm ci`
- Deploy Worker: CI-only via GitHub Actions (`.github/workflows/deploy.yml`)
- Verify repo: `./scripts/gg verify`
- Smoke test: `./tools/smoke.sh`
- Worker header audit: `./tools/verify-worker.sh`

## Common Failures
- `rg` not found (PATH issues):
  - Set `RG_BIN` to the full path (for example `/opt/homebrew/bin/rg`).
- Worker route bypass:
  - Symptoms: `__gg_worker_ping` missing headers or origin HTML served directly.
  - Fix: ensure `www.pakrpp.com/*` routes to Worker `gg`.
- Apex redirect missing:
  - Symptoms: `pakrpp.com` serves content without redirect.
  - Fix: add Redirect Rule to `https://www.pakrpp.com/$1` (Cloudflare, 301).

## Notes
- Canonical host is `www.pakrpp.com`.
- `/_headers` and `/_redirects` must not be publicly served.
- macOS 10.15 cannot run `wrangler` locally → deploy is CI-only.
- macOS 10.15: `npm ci` should work normally now (no `--ignore-scripts` needed).
