# Asset Release Contract (LATEST vs PINNED)
Last updated: 2026-02-05

## Purpose
Define a deterministic asset contract so DEV is fast and uncached (`/assets/latest/*`) and PROD is stable and immutable (`/assets/v/<RELEASE_ID>/*`). This is enforced at the Cloudflare Worker (`gg`) layer and by repo build outputs.

## Contract Rules
- **DEV**
  - Blogger theme: `index.dev.xml`
  - Assets: `/assets/latest/main.js` + `/assets/latest/main.css`
  - Cache: `Cache-Control: no-store, max-age=0`
  - SW: OFF (dev mode)

- **PROD**
  - Blogger theme: `index.prod.xml`
  - Assets: `/assets/v/<RELEASE_ID>/main.js` + `/assets/v/<RELEASE_ID>/main.css`
  - Cache: `Cache-Control: public, max-age=31536000, immutable`
  - SW: ON

- **Global (always)**
  - `/sw.js` and `/gg-flags.json` must be `Cache-Control: no-store`.

## Cache Header Enforcement (Worker `gg`)
- `/assets/latest/*` → no-store
  - `src/worker.js:220-223`
- `/assets/v/*` → immutable
  - `src/worker.js:223-225`
- `/sw.js` → no-store
  - `src/worker.js:225-228`
- `/gg-flags.json` → no-store
  - `src/worker.js:31-40`

## Build Output Layout
The repo build must produce **both**:
- `public/assets/latest/main.js`
- `public/assets/latest/main.css`
- `public/assets/v/<RELEASE_ID>/main.js`
- `public/assets/v/<RELEASE_ID>/main.css`

No symlinks are allowed.

## CI-Verifiable vs Manual-Only
**CI-verifiable (repo-level):**
- `npm run build` creates `public/assets/v/<RELEASE_ID>/` from `public/assets/latest/`.
- `npm run verify:assets` confirms both latest + versioned outputs exist.

**Manual-only (Blogger paste step):**
- Correct XML pasted into Blogger (DEV uses `index.dev.xml`, PROD uses `index.prod.xml`).
- Live domain uses `www.pakrpp.com` and Worker `gg` routes are active.

## Verification Commands
- `npm run build`
- `npm run verify:assets`

## Key URLs (runtime)
- DEV assets: `https://www.pakrpp.com/assets/latest/main.js`
- PROD assets: `https://www.pakrpp.com/assets/v/<RELEASE_ID>/main.js`
- Worker ping: `https://www.pakrpp.com/__gg_worker_ping`
- Flags: `https://www.pakrpp.com/gg-flags.json`
- SW: `https://www.pakrpp.com/sw.js`
