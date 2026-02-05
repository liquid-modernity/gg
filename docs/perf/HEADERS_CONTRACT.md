# Headers Contract
Last updated: 2026-02-05

## Purpose
Make cache behavior deterministic and verifiable in CI (config) and deploy (live).

## Core Rules
- Canonical host: `https://www.pakrpp.com`.
- Apex `https://pakrpp.com` must 301/308 redirect to `https://www.pakrpp.com/`.
- `/assets/latest/*` must be **no-store** (DEV should always fetch fresh).
- `/assets/v/<RELEASE_ID>/*` must be **public, immutable, max-age=31536000**.
- `/sw.js` and `/gg-flags.json` must be **no-store**.
- `/manifest.webmanifest` and `/offline.html` are **no-store** (avoid stale shell).

## Why These Rules
- **latest** assets are for DEV and must never stick in cache.
- **pinned** assets are immutable for stable prod performance.
- `sw.js` and flags must be fresh to allow fast kill-switch and updates.

## Verification
- Config mode (CI, deterministic):
  - `node tools/verify-headers.mjs --mode=config`
  - Validates header intent against `src/worker.js` and `tools/headers-contract.json`.
- Live mode (Deploy):
  - `node tools/verify-headers.mjs --mode=live --base=https://www.pakrpp.com`
  - Hits production and checks status + headers.

## Source of Truth
- `tools/headers-contract.json`
- Release ID for pinned checks is read from `index.prod.xml`.
