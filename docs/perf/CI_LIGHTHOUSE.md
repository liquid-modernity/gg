# CI_LIGHTHOUSE.md
Last updated: 2026-02-22

## What It Measures
- Live Lighthouse checks run against:
  - `https://www.pakrpp.com/`
  - `https://www.pakrpp.com/blog`
  - one stable post URL (see `docs/perf/URLS.json`)
- Metrics/assertions are enforced from `docs/perf/BUDGETS.json` ratchet ceilings:
  - LCP
  - CLS
  - INP
  - TBT
  - total byte weight

## Workflow Triggers
- `workflow_run` after deploy workflow (`Deploy to Cloudflare Workers`) succeeds on `main`.
- `schedule` daily at 02:30 Asia/Jakarta (`30 19 * * *` UTC).
- `workflow_dispatch` for manual runs.

## Artifacts And Summary
- Raw Lighthouse outputs are stored in `.lighthouseci`.
- Workflow uploads `.lighthouseci` as a GitHub Actions artifact.
- `tools/perf/lhci-summary.mjs` writes a readable metrics table into GitHub Step Summary.
- `tools/perf/lhci-trend.mjs` writes `.lighthouseci/trend.json` and a ratchet delta table to GitHub Step Summary.
- Workflow also uploads a dedicated artifact for `.lighthouseci/trend.json`.

## Trend JSON
- Path: `.lighthouseci/trend.json`
- Core fields:
  - `generated_at`, `commit`
  - `urls` (copied from `docs/perf/URLS.json`)
  - `results[]` per key (`home|listing|post`): score, LCP, CLS, INP, TBT, transfer KB, ratchet pass/fail + reasons
  - `ratchet` (copied from `docs/perf/BUDGETS.json`)
- Compare runs by downloading artifacts from two workflow runs and diffing `results`.

## Temporary Public Storage (Optional)
- Workflow includes an optional LHCI upload step to temporary public storage for quick share links.
- This storage is not the source of truth and links are temporary (typically around 7 days).
- Source-of-truth evidence remains the workflow artifact + step summary.

## URL Governance
- URLs are sourced from `docs/perf/URLS.json` (single source).
- Lighthouse config (`lighthouse/lighthouserc.ci.js`) reads `docs/perf/URLS.json` only (key: `urls.home|urls.listing|urls.post`).
- Update URLs only via explicit perf task and keep them in sync with `docs/perf/BASELINE.md`.
