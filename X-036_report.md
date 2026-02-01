# X-036 Report

## Diff summary
- Added Worker route for `/__gg_worker_ping` on `www.pakrpp.com` in `wrangler.jsonc`.

## Expected curl result
- `https://www.pakrpp.com/__gg_worker_ping?x=1` returns `200` and includes headers:
  - `x-gg-worker: assets`
  - `x-gg-worker-version: X-035`
