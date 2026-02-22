# PERF_HISTORY.md
Last updated: 2026-02-22

## What It Is
- Perf history is persisted on a dedicated append-only branch: `perf-history`.
- Main branch stays clean; history data is not committed to `main`.

## Dashboard Pointers
- Perf Dashboard (GitHub Pages): `https://liquid-modernity.github.io/gg/perf/index.html`
- Perf History Branch: `perf-history`
- Latest snapshot JSON: `perf/latest.json` (inside `perf-history` branch)
- Note: this URL is the stable public dashboard endpoint.

## Branch Contents (`perf-history`)
- `perf/history.ndjson`
  - One JSON object per Lighthouse run (one line per run).
- `perf/latest.json`
  - Latest snapshot extracted from history.
- `perf/index.html`
  - Static dashboard built from history (last 20 runs + metric sparklines).

## Record Fields
- `generated_at`
- `commit` (short SHA)
- `run_url`
- `urls` (from `docs/perf/URLS.json`)
- `results[]` (`home|listing|post` metrics + ratchet pass/reasons)
- `ratchet` (copied from `docs/perf/BUDGETS.json`)
- `overall_pass` (true/false)

## How It Is Written
- Workflow `perf-lighthouse.yml` generates `.lighthouseci/trend.json`.
- CI appends one normalized line to `perf/history.ndjson`.
- CI rebuilds `perf/latest.json` and `perf/index.html`.
- CI commits and pushes only to `perf-history`.

## How To View
- GitHub branch browser: `perf-history` branch files under `perf/`.
- Optional: enable GitHub Pages on `perf-history` and serve `perf/index.html`.

## GitHub Pages Setup (Manual)
1. Open repo `Settings` -> `Pages`.
2. Source: `Deploy from a branch`.
3. Branch: `perf-history`.
4. Folder: `/(root)`.
5. Save and wait for publish status.
6. Dashboard file is served from `perf/index.html`:
   - `https://<owner>.github.io/<repo>/perf/index.html`

## Bootstrap Branch (Automatic)
- If `perf-history` is missing, run workflow: `Perf History Bootstrap`.
- The workflow creates/updates:
  - `perf/history.ndjson`
  - `perf/latest.json`
  - `perf/index.html`
- After bootstrap succeeds, configure Pages with branch `perf-history` and folder `/(root)`.

## Growth / Rotation Policy
- Current mode: append-only, no rotation.
- If file grows too large, plan a dedicated maintenance task to archive or keep rolling windows (e.g., 365 days) without rewriting history silently.
