# AI Context Pack
Last updated: 2026-02-05

## Project goal
Stabilize a single-domain Blogger + Cloudflare Worker system so preview/prod behavior is deterministic, assets are same-domain, and CI-only deploys are reliable.

## Non-negotiables
- Branch: `main` only.
- Preview domain: `www.pakrpp.com` (no separate staging domain).
- DEV/PROD selection is manual by pasting the correct Blogger theme:
  - DEV = `index.dev.xml`
  - PROD = `index.prod.xml`
- Cloudflare Worker name: `gg`.
- Assets are served via Cloudflare Worker Static Assets binding (`ASSETS`) on the same domain.
- macOS 10.15 cannot run `wrangler` locally → deploy is CI-only.
- Apex redirect is via Cloudflare Redirect Rule (301) from `pakrpp.com/*` to `https://www.pakrpp.com/$1`.

## Environment model (DEV/PROD)
- DEV
  - Blogger theme: `index.dev.xml` (manual paste)
  - Assets: `/assets/latest/*` (same-domain, `no-store`)
  - Service Worker: OFF
- PROD
  - Blogger theme: `index.prod.xml` (manual paste)
  - Assets: `/assets/v/<RELEASE_ID>/*` (immutable)
  - Service Worker: ON

Current RELEASE_ID: `1ce85ce` (from `index.prod.xml` assets path)

## Asset contract summary
- DEV: `https://www.pakrpp.com/assets/latest/main.js` and `main.css` (no-store).
- PROD: `https://www.pakrpp.com/assets/v/<RELEASE_ID>/main.js` and `main.css` (immutable).
- `https://www.pakrpp.com/sw.js` and `https://www.pakrpp.com/gg-flags.json` must be `no-store`.
- All assets are served by the Worker `ASSETS` binding on `www.pakrpp.com`.

## CI-only deploy note
- Local `wrangler` deploy is blocked on macOS 10.15.
- Use GitHub Actions (`.github/workflows/deploy.yml`) for deploys.

## Critical URLs to verify
- `https://www.pakrpp.com/__gg_worker_ping`
- `https://www.pakrpp.com/gg-flags.json`
- `https://www.pakrpp.com/sw.js`
- `https://www.pakrpp.com/manifest.webmanifest`
- `https://www.pakrpp.com/offline.html`
- `https://www.pakrpp.com/assets/latest/main.js`
- `https://www.pakrpp.com/assets/v/<RELEASE_ID>/main.js`
- `https://www.pakrpp.com/blog`
- `https://www.pakrpp.com/?view=blog`

## Authority pointers
- `docs/DOCUMENTATION.md` (authority ladder)
- `docs/CLOUDFLARE_SETUP.md`
- `docs/LOCAL_DEV.md`
- `docs/ledger/GG_CAPSULE.md`
- `docs/roadmap.md` (secondary planning)
