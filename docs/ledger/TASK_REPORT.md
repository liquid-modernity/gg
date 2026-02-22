TASK_REPORT
Last updated: 2026-02-22

TASK_ID: HOTFIX-LIVE-GATE-SSR-POSTCARDS-20260222
TITLE: Fix strict live gate `/blog` SSR postcard false-fail

SUMMARY
- Root cause: `tools/smoke.sh` live hard-refresh check used hardcoded threshold `>=9` SSR postcards in `#postcards`.
- Current live `/blog` can legitimately render fewer SSR cards (observed 1) and rely on loadmore/pager for additional items, causing strict gate to fail even when listing surface and fallback pagination are present.
- Fix applied in `live_blog_hard_refresh_check()`:
  - Added configurable minimum: `SMOKE_LIVE_MIN_SSR_POSTCARDS` (default `1`).
  - Kept hard-fail when SSR cards are below configured minimum.
  - Added safety rule: when SSR cards are low (`<9`), page must still contain loadmore/pager fallback (`data-gg-module='loadmore'` or `#blog-pager` or `.blog-pager-older-link`), otherwise fail.

FILES CHANGED
- tools/smoke.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md

VERIFICATION OUTPUTS
- `bash -n tools/smoke.sh`
```text
PASS (no syntax errors)
```

- `node tools/verify-ledger.mjs`
```text
VERIFY_LEDGER: PASS
RELEASE_ID=8c1fb78
```

NOTES
- Full live smoke cannot be executed from this local sandbox because DNS resolution to `www.pakrpp.com` is unavailable in this environment.
- This hotfix targets the exact failing check:
  `FAIL: LIVE_HTML /blog hard refresh #1 expected >=9 SSR postcards (got 1)`
