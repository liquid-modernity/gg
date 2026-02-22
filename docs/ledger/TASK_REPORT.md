TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-UX-LISTING-LOADMORE-FIX-20260222
TITLE: Restore Load More Articles (pager-based fetch + safe append + rehydrate)

ROOT CAUSE CHECK
- Selector and binding (before fix):
  - Wrapper selector: `[data-gg-module="loadmore"]`
  - Button selector: `#loadmore`
  - Handler function: `fetchNext()` inside legacy `GG.modules.LoadMore` block in `public/assets/latest/modules/ui.bucket.core.js`
  - Fetch URL source: `button[data-next]` then fallback `#more-fallback` (template fallback selector was stale), not canonical Blogger pager first.
- Failure mode (reproduced from code path + runtime contract mismatch):
  - Legacy bind marked `btn.__ggLoadMoreBound = true` before list readiness check; if list container was not ready at init moment, click handler could end up effectively unavailable/stale.
  - Next-page discovery relied on stale fallback selector instead of canonical `.blog-pager-older-link`, causing next URL state to become fragile/stuck.
  - Rehydrate path called `LoadMore.init()` only; no dedicated `rehydrate` contract to guarantee deterministic rebind after SPA navigation.

SUMMARY OF FIX
- Moved robust loadmore implementation into listing module contract:
  - Added `GG.modules.listingLoadMore` in `public/assets/latest/modules/ui.bucket.listing.js` with:
    - idempotent bind guard `data-gg-bound-load-more` (`dataset.ggBoundLoadMore`),
    - in-flight guard (`state.loading`) to prevent double-load,
    - loading state (`aria-busy`, `gg-is-loading`) and retryable inline error status,
    - canonical pager discovery via `.blog-pager-older-link` / `#blog-pager`,
    - safe append (`cloneNode(true)` + `appendChild`) and script neutralization,
    - duplicate card-key filtering and duplicate id cleanup,
    - explicit `init(root)` and `rehydrate(root)` entrypoints.
- Updated core module wiring in `public/assets/latest/modules/ui.bucket.core.js`:
  - `GG.modules.LoadMore` is now a proxy to listing implementation (`GG.modules.listingLoadMore`) with lazy module load fallback.
  - Rehydrate pipeline now prefers `LoadMore.rehydrate(document)`.
  - Exported parser contract for listing fetch parse path: `GG.core.parseHtmlDoc`.
- Added guardrail verifier:
  - `tools/verify-loadmore-contract.mjs`
  - Wired into `tools/gate-prod.sh`.
- Adjusted budget ceiling for `modules/ui.bucket.listing.js` in `tools/perf-budgets.json` to match current deterministic artifact size after loadmore hardening.

FILES CHANGED
- public/assets/latest/modules/ui.bucket.listing.js
- public/assets/latest/modules/ui.bucket.core.js
- tools/verify-loadmore-contract.mjs
- tools/gate-prod.sh
- tools/perf-budgets.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*
- removed old pinned release dirs: public/assets/v/92a57d2/* and public/assets/v/b869b6d/*

VERIFICATION OUTPUTS
- `node tools/verify-loadmore-contract.mjs`
```text
PASS: loadmore contract
```

- `npm run gate:prod`
```text
PASS: loadmore contract
VERIFY_PERF_BUDGETS: PASS
PASS: gate:prod
```

NOTES
- Manual browser sanity checks for `/blog` and home listing (multi-click loadmore and SPA navigation path) remain required on target runtime browser.
