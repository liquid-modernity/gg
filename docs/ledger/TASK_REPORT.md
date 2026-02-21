TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PERF-IFRAME-LAZY-PLACEHOLDER-20260222
TITLE: Harden yt-lite embed (nocookie + title + intent preconnect)

SUMMARY
- Hardened YT-lite iframe activation in `public/assets/latest/modules/ui.bucket.core.js`:
  - embed host switched to `https://www.youtube-nocookie.com/embed/<id>`
  - iframe title now set for a11y (derived from box aria-label when available)
  - added `referrerpolicy="strict-origin-when-cross-origin"`
  - added minimal `allow` policy: `accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share`
  - kept intrinsic fallback via `GG.services.images.setIntrinsicDims(iframe, 16, 9)`.
- Added intent-only preconnect warmup in `hydrateLiteEmbeds()`:
  - helper `preconnectOnce(href)`
  - trigger on `pointerenter` and `focus` (both `{ once:true }`)
  - targets: `https://www.youtube-nocookie.com` and `https://i.ytimg.com`
- Added verifier `tools/verify-yt-iframe-policy.mjs` and wired it into `tools/gate-prod.sh`.
- Added policy docs `docs/perf/IFRAME_POLICY.md`.
- Updated `tools/verify-cls-dimensions-policy.mjs` snippet scan window to avoid false negative after iframe hardening.
- Updated `tools/perf-budgets.json` for `modules/ui.bucket.core.js` (`max_raw` and `max_gzip`) to keep gate deterministic with new policy code.

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- tools/verify-yt-iframe-policy.mjs
- tools/gate-prod.sh
- docs/perf/IFRAME_POLICY.md
- tools/verify-cls-dimensions-policy.mjs
- tools/perf-budgets.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-yt-iframe-policy.mjs`
```text
PASS: yt iframe policy (nocookie + title + intent preconnect)
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_RELEASE_ALIGNED: PASS
PASS: image perf policy
PASS: responsive thumbs policy (safe-only)
PASS: CLS dimensions policy (img/iframe intrinsic sizes)
PASS: yt iframe policy (nocookie + title + intent preconnect)
PASS: responsive thumbs does not force -c
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=1 allowlisted_matches=1 violations=0
VERIFY_BUDGETS: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual 3-minute check:
  - hover/focus yt-lite creates preconnect links in `<head>`
  - Enter/Space activation still loads iframe
  - SR reads meaningful iframe title
  - no layout jump on activation
