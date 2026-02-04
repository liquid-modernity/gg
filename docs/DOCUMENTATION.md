# Documentation

## What This Repo Is
This repo contains the Blogger theme assets and the Cloudflare Worker that fronts the Blogger origin. The Worker serves root assets (`/sw.js`, `/manifest.webmanifest`, `/offline.html`), proxies Blogger pages, and adds required headers.

## Canonical Domain
Canonical host is `www.pakrpp.com`. The apex `pakrpp.com` must redirect to `www.pakrpp.com` or be redirected by the Worker. Do not serve content on both hosts.

## Detailed Docs
- `docs/CLOUDFLARE_SETUP.md`
- `docs/LOCAL_DEV.md`
- `tech-stack.md`

## Production Invariants (Checklist)
- `www.pakrpp.com/*` is routed to Worker `gg`.
- Apex `pakrpp.com/*` redirects to `https://www.pakrpp.com/$1` or is handled by Worker with a 301 to `www`.
- `/blog` is the canonical blog home on production only when `__gg_worker_ping` returns `x-gg-worker-version`; otherwise use `/?view=blog`.
- `__gg_worker_ping` returns 200 with `x-gg-worker-version`.
- Service Worker and `gg-flags.json` are enabled only when the Worker ping is healthy.
- `sw.js` and `gg-flags.json` are `Cache-Control: no-store`.
- `/assets/v/<RELEASE_ID>/main.js` is `Cache-Control: immutable`.
- `/_headers` and `/_redirects` are not publicly served (404/410).
- Run `./tools/smoke.sh` and `./tools/verify-worker.sh` before deploy.
- `./scripts/gg verify` must pass before shipping.
