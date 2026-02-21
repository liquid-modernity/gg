TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PERF-RESPONSIVE-THUMBS-SRCSET-20260221
TITLE: Add safe-only srcset/sizes for resizable thumbs + guardrails

SUMMARY
- Added reusable helper under `GG.services.images` in `public/assets/latest/modules/ui.bucket.core.js`:
  - `isResizableThumbUrl(url)`
  - `resizeThumbUrl(url, size, keepCrop)`
  - `buildSrcset(url, widths, opts)`
- Helper is safe-only and pure string replacement:
  - host allowlist: `blogger.googleusercontent.com` / `googleusercontent.com`
  - supported resize patterns:
    - `/sNNN/` and `/sNNN-c/`
    - `=sNNN` and `=sNNN-c`
  - unknown URL format => return `null` and keep original `src`.
- Applied guarded responsive thumbs in `public/assets/latest/modules/ui.bucket.listing.js`:
  - keeps TASK 35 LCP policy (first image eager + high, second eager + auto, rest lazy + auto)
  - adds `buildSrcset` widths `[320, 480, 640, 960, 1280]`
  - assigns `img.src/srcset/sizes` only inside `if (built && built.srcset)`.
- Applied guarded responsive thumbs in `public/assets/latest/modules/ui.bucket.mixed.js`:
  - keeps conservative mixed-first eager+auto policy from TASK 35
  - adds `buildSrcset` widths `[240, 360, 480, 720, 960, 1200]`
  - assigns `img.src/srcset/sizes` only inside `if (built && built.srcset)`.
- Added verifier `tools/verify-responsive-thumbs-policy.mjs` and wired to `tools/gate-prod.sh`.
- Added docs `docs/perf/RESPONSIVE_THUMBS.md`.

SAFE-ONLY CONTRACT CONFIRMED
- Resizing is attempted only when URL is recognized as Blogger/Googleusercontent resize format.
- Non-recognized URLs are not rewritten, so images do not break.

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- public/assets/latest/modules/ui.bucket.listing.js
- public/assets/latest/modules/ui.bucket.mixed.js
- tools/verify-responsive-thumbs-policy.mjs
- tools/verify-image-perf-policy.mjs
- tools/gate-prod.sh
- tools/perf-budgets.json
- docs/perf/RESPONSIVE_THUMBS.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-responsive-thumbs-policy.mjs`
```text
PASS: responsive thumbs policy (safe-only)
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
PASS: image perf policy
PASS: responsive thumbs policy (safe-only)
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=1 allowlisted_matches=1 violations=0
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=7260353)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual browser check:
  - listing + mixed thumbnails still load with no broken images
  - `srcset` + `sizes` appears only for recognized googleusercontent URLs
  - mobile viewport requests smaller variants
  - no CLS visual regressions
