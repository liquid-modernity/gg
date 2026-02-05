# Cloudflare Setup (Worker + Routes)
Last updated: 2026-02-05

## 1) Domain + DNS
- Ensure `pakrpp.com` is on Cloudflare.
- DNS records must point to the Blogger origin (per existing setup).
- Canonical host is `www.pakrpp.com`.

## 2) Worker
- Worker name: `gg`.
- Deploy via GitHub Actions using `wrangler` with `wrangler.jsonc` (CI-only on macOS 10.15).
- Static assets are served from `public/` via the `ASSETS` binding.

## 3) Routes (HTTP Routes)
Required route:
- `www.pakrpp.com/*` -> Worker `gg`

Apex handling (required):
- Cloudflare Redirect Rule 301 from `pakrpp.com/*` to `https://www.pakrpp.com/$1` (preserve path + query).

Only one canonical host must serve content. Do not allow both `www` and apex to serve pages.

## 4) SSL/TLS + HTTPS
- SSL/TLS mode: **Full (strict)**.
- Enable **Always Use HTTPS**.

## 5) API Token (wrangler deploy)
Use an API Token scoped to the `pakrpp.com` account/zone. Minimum scopes for this repo’s workflow:
- Account: Workers Scripts (Edit)
- Account: Workers Routes (Edit)
- Zone: Zone (Read)
- Zone: Workers Routes (Read)

Environment variables / GitHub Secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 6) GitHub Actions (optional)
The workflow in `.github/workflows/deploy.yml` expects the secrets above. It also audits Worker routes and performs post-deploy smoke checks.
