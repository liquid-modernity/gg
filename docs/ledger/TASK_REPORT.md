TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PERF-IMAGE-LCP-POLICY-20260221
TITLE: Prioritize LCP candidate image (eager + fetchpriority) + add guardrails

SUMMARY
- Updated `public/assets/latest/modules/ui.bucket.listing.js` in `addTile()` to enforce deterministic image loading policy:
  - `img.decoding = 'async'`
  - tile index policy based on render queue length:
    - first tile: `loading='eager'` + `fetchpriority='high'`
    - second tile: `loading='eager'` + `fetchpriority='auto'`
    - remaining tiles: `loading='lazy'` + `fetchpriority='auto'`
  - added `sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 25vw"`
- Updated `public/assets/latest/modules/ui.bucket.mixed.js` in `appendCardThumb()`:
  - keep `decoding='async'` baseline
  - default lazy loading
  - one conservative first-thumb boost: `loading='eager'` + `fetchpriority='auto'`
- Added verifier `tools/verify-image-perf-policy.mjs` and wired it into `tools/gate-prod.sh`.
- Added policy doc `docs/perf/IMAGE_POLICY.md` to lock contract and rationale.
- No markup injection and no allowlist changes introduced.

WHAT CHANGED
- Listing:
  - deterministic eager/high only for first candidate
  - explicit eager/auto for second candidate
  - explicit lazy/auto for the rest
  - async decode + conservative `sizes`
- Mixed:
  - async decode maintained
  - default lazy policy retained
  - only one eager+auto thumbnail boost

FILES CHANGED
- public/assets/latest/modules/ui.bucket.listing.js
- public/assets/latest/modules/ui.bucket.mixed.js
- tools/verify-image-perf-policy.mjs
- tools/gate-prod.sh
- docs/perf/IMAGE_POLICY.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-image-perf-policy.mjs`
```text
PASS: image perf policy
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
PASS: shortcodes a11y contract
PASS: image perf policy
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=1 allowlisted_matches=1 violations=0
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=e95d010)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual browser/Lighthouse check:
  - listing first tile not lazy; only first tile fetchpriority=high
  - no CLS regressions
  - compare LCP before/after on listing page
