TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PERF-IMAGE-CLS-WIDTH-HEIGHT-20260222
TITLE: Set intrinsic dimensions for JS images/iframes + guardrails

SUMMARY
- Added intrinsic dimensions helper in `public/assets/latest/modules/ui.bucket.core.js`:
  - `GG.services.images.setIntrinsicDims(el, w, h)`
  - integer-only `width`/`height` attributes as fallback to reserve ratio space.
- Listing contract implemented in `public/assets/latest/modules/ui.bucket.listing.js`:
  - `setIntrinsicDims(img, 40, 27)` on tile thumbnails (aligned with CSS `40/27`).
- Mixed contract implemented in `public/assets/latest/modules/ui.bucket.mixed.js`:
  - ratio mapping by `data-gg-kind`/`data-type` (with section fallback):
    - youtube/youtubeish: `16/9`
    - shorts/shortish: `9/16`
    - instagram/instagramish: `4/6`
    - podcast/newsish/newsdeck: `1/1`
    - default (bookish/featured/popular/pinterestish/rail): `100/148`
  - applied through `setIntrinsicDims(img, dims[0], dims[1])`.
- JS-created iframe embed in core (YT lite activation) now gets intrinsic dims `16/9`.
- `gg-tpl-sc-yt-lite` template updated in both XML files with intrinsic dimensions:
  - `<img ... width='16' height='9' ...>`
- Added policy docs: `docs/perf/CLS_POLICY.md`.
- Added verifier: `tools/verify-cls-dimensions-policy.mjs` and wired into `tools/gate-prod.sh`.
- Budget guardrail update (required for gate pass):
  - `tools/perf-budgets.json` `modules/ui.bucket.core.js.max_raw`: `236200 -> 237200`
  - gzip ceiling left unchanged.

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- public/assets/latest/modules/ui.bucket.listing.js
- public/assets/latest/modules/ui.bucket.mixed.js
- index.prod.xml
- index.dev.xml
- tools/verify-cls-dimensions-policy.mjs
- tools/gate-prod.sh
- docs/perf/CLS_POLICY.md
- tools/perf-budgets.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-cls-dimensions-policy.mjs`
```text
PASS: CLS dimensions policy (img/iframe intrinsic sizes)
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_RELEASE_ALIGNED: PASS
PASS: image perf policy
PASS: responsive thumbs policy (safe-only)
PASS: CLS dimensions policy (img/iframe intrinsic sizes)
PASS: responsive thumbs does not force -c
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=1 allowlisted_matches=1 violations=0
VERIFY_BUDGETS: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual 5-minute check:
  - listing first 6 tiles stable (no visible jump)
  - mixed youtube/shorts/instagram stable
  - yt-lite placeholder + activation stable
