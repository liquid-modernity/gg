# Local Development

## Prereqs
- macOS 10.15 (Catalina) tested
- Node.js 20.x
- npm
- git
- ripgrep (`rg`)

## Core Commands
- Install deps: `npm ci`
- Deploy Worker: `npm run deploy`
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
  - Fix: add Redirect Rule to `https://www.pakrpp.com/$1` or handle redirect in Worker.

## Notes
- Canonical host is `www.pakrpp.com`.
- `/_headers` and `/_redirects` must not be publicly served.
