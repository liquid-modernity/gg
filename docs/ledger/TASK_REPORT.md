TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PERF-RESPONSIVE-THUMBS-CROP-CORRECTNESS-20260221
TITLE: Preserve crop flag only (never force -c) + guardrails

SUMMARY
- Fixed crop semantics in `public/assets/latest/modules/ui.bucket.core.js` inside `services.images.resizeThumbUrl`:
  - before: `var useCrop = !!keepCrop || hadCrop;`
  - after: `var preserve = (keepCrop !== false); var useCrop = preserve && hadCrop;`
- Resulting policy is strict:
  - if original URL has `-c`, resized URL keeps `-c`
  - if original URL has no `-c`, resized URL never adds `-c`
- Kept safe-only responsive thumb behavior unchanged for listing/mixed callsites.
- Added verifier `tools/verify-responsive-thumbs-crop-policy.mjs` (static checks + runtime behavior checks from extracted function snippets).
- Wired new verifier into `tools/gate-prod.sh`.
- Updated `docs/perf/RESPONSIVE_THUMBS.md` with a dedicated crop semantics section.

WHY FORCED -C WAS REMOVED
- Forcing `-c` can tighten composition unexpectedly and cause visual mismatch against original thumbnails.
- Correct behavior is preservation-only: retain crop flag when it already exists, never introduce new crop mode.

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- tools/verify-responsive-thumbs-crop-policy.mjs
- tools/gate-prod.sh
- docs/perf/RESPONSIVE_THUMBS.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-responsive-thumbs-crop-policy.mjs`
```text
PASS: responsive thumbs does not force -c
```

- `node tools/verify-responsive-thumbs-policy.mjs`
```text
PASS: responsive thumbs policy (safe-only)
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
PASS: image perf policy
PASS: responsive thumbs policy (safe-only)
PASS: responsive thumbs does not force -c
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=1 allowlisted_matches=1 violations=0
VERIFY_BUDGETS: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual check (3 minutes): compare 2-3 thumbs before/after to ensure composition is not unexpectedly tighter-cropped.
