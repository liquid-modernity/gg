# AI Context Pack
Last updated: 2026-02-05

## Purpose
Stabilize a single-domain Blogger + Cloudflare Worker system so preview/prod behavior is deterministic, assets are same-domain, and CI-only deploys are reliable.

## Non-negotiables (Stable Rules)
- Branch: `main` only.
- Canonical host: `https://www.pakrpp.com` (no separate staging domain).
- Apex `https://pakrpp.com` must 301 redirect to `https://www.pakrpp.com/` via Cloudflare Redirect Rule.
- DEV/PROD selection is manual by pasting the correct Blogger theme:
  - DEV = `index.dev.xml`
  - PROD = `index.prod.xml`
- Cloudflare Worker name: `gg`.
- Assets are served via the Worker Static Assets binding (`ASSETS`) on the same domain.
- macOS 10.15 cannot run `wrangler` locally → deploy is CI-only.

## Environment Model (DEV vs PROD)
- DEV
  - Blogger theme: `index.dev.xml` (manual paste)
  - Assets: `/assets/latest/*` (same-domain, `no-store`)
  - Service Worker: OFF
- PROD
  - Blogger theme: `index.prod.xml` (manual paste)
  - Assets: `/assets/v/<RELEASE_ID>/*` (immutable)
  - Service Worker: ON

## Asset Contract Summary
- DEV: `https://www.pakrpp.com/assets/latest/main.js` and `main.css` (no-store).
- PROD: `https://www.pakrpp.com/assets/v/<RELEASE_ID>/main.js` and `main.css` (immutable).
- `https://www.pakrpp.com/sw.js` and `https://www.pakrpp.com/gg-flags.json` must be `no-store`.
- All assets are served by the Worker `ASSETS` binding on `www.pakrpp.com`.

## CI-only Deploy Note
- Local `wrangler` deploy is blocked on macOS 10.15.
- Use GitHub Actions for deploys (see `docs/ci/PIPELINE.md`).

## Where To Find Live State (Only These)
- `docs/ledger/GG_CAPSULE.md` for NOW/NEXT/RELEASE_ID and live endpoints.
- `index.prod.xml` for the currently pinned `/assets/v/<RELEASE_ID>/` path.

## Fast Start (Read These Two)
1) `docs/AI/CONTEXT_PACK.md` (stable rules)
2) `docs/ledger/GG_CAPSULE.md` (live state)
