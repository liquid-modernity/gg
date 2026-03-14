# GitHub Actions Cloudflare Deploy

This repo already separates validation from production deploy:

- `.github/workflows/ci.yml`
  Runs on `pull_request`, push to `main`, and manual dispatch.
  Validates template fingerprint, checks Worker syntax, and runs `wrangler deploy --dry-run`.
- `.github/workflows/deploy.yml`
  Runs automatically after a successful `CI` workflow on `main`.
  Can also be started manually with `workflow_dispatch`, but production deploy is guarded to `main` only.
  Deploys `src/worker.js` plus static assets from `public/`.

Required GitHub configuration:

- Repository secret `CLOUDFLARE_API_TOKEN`
  Use a token that can deploy Workers and update the production zone/routes for `pakrpp.com`.
- Repository secret `CLOUDFLARE_ACCOUNT_ID`
  Cloudflare account ID used by Wrangler deploy.
- Repository variable `GG_LIVE_BASE_URL`
  Recommended value: `https://www.pakrpp.com`
  Used by the post-deploy live smoke check. If missing, deploy falls back to `https://www.pakrpp.com`.

Expected deploy flow:

1. Push commits to `main`.
2. GitHub Actions runs `CI`.
3. If `CI` succeeds on `main`, GitHub Actions runs `Deploy Worker/Assets to Cloudflare`.
4. Deploy publishes Cloudflare Worker/assets only.
5. If `index.prod.xml` changed, Blogger template publish remains manual and must follow `qa/template-release-playbook.md`.

Notes:

- `npm run gaga` maps to `wrangler deploy --config wrangler.jsonc`.
- `npm run gaga:dry` maps to `wrangler deploy --dry-run --config wrangler.jsonc`.
- The deploy workflow now fails early with a clear message when the Cloudflare secrets are missing.
