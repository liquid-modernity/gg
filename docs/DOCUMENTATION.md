# Documentation
Last updated: 2026-02-05

## Authority Ladder
If any document conflicts, follow the highest authority below.

1) `docs/ledger/GG_CAPSULE.md` (live state: NOW/NEXT/RELEASE_ID, endpoints)
2) `docs/AI/CONTEXT_PACK.md` (stable rules and constraints)
3) `docs/release/ASSET_CONTRACT.md` (asset/cache contract details)
4) `docs/ci/PIPELINE.md` (pipeline reference)
5) Everything else (supporting, may be stale)

Conflict rule: **GG_CAPSULE wins for state**. **Contracts win for behavior**.

## What This Repo Is
This repo contains the Blogger theme assets and the Cloudflare Worker that fronts the Blogger origin. The Worker serves root assets (`/sw.js`, `/manifest.webmanifest`, `/offline.html`), proxies Blogger pages, and adds required headers.

## Canonical Domain
Canonical host is `www.pakrpp.com`. The apex `pakrpp.com` must redirect via a **Cloudflare Redirect Rule (301)** to `https://www.pakrpp.com/$1` (preserve path + query). Do not serve content on both hosts.

## Detailed Docs
- `docs/AI/CONTEXT_PACK.md`
- `docs/CLOUDFLARE_SETUP.md`
- `docs/LOCAL_DEV.md`
- `docs/tech-stack.md`

## Production Invariants (Checklist)
- `www.pakrpp.com/*` is routed to Worker `gg`.
- Apex `pakrpp.com/*` redirects to `https://www.pakrpp.com/$1` via Cloudflare Redirect Rule (301).
- `/blog` is the canonical blog home on production only when `__gg_worker_ping` returns `x-gg-worker-version`; otherwise use `/?view=blog`.
- `__gg_worker_ping` returns 200 with `x-gg-worker-version`.
- Service Worker and `gg-flags.json` are enabled only when the Worker ping is healthy.
- `sw.js` and `gg-flags.json` are `Cache-Control: no-store`.
- DEV assets: `/assets/latest/*` is `Cache-Control: no-store`.
- PROD assets: `/assets/v/<RELEASE_ID>/*` is `Cache-Control: immutable`.
- `/_headers` and `/_redirects` are not publicly served (404/410).
- Run `./tools/smoke.sh` and `./tools/verify-worker.sh` before deploy.
- `./scripts/gg verify` must pass before shipping.
