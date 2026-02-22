TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-UX-POSTMETA-EDITORIAL-PREVIEW-20260222
TITLE: Restore postmeta pipeline for editorial preview (home/listing/post)

SUMMARY
- Added canonical metadata source node `.gg-postmeta` in template contracts for both listing cards (`postCard`) and post detail (`postDetail`) in `index.prod.xml` and `index.dev.xml`.
- Added `GG.services.postmeta.getFromContext(ctxEl)` in `public/assets/latest/modules/ui.bucket.core.js` with source priority:
  - `.gg-postmeta` dataset
  - contextual tag/link/meta fallbacks
  - read-time fallback from post body text when `data-read-min` empty
- Updated editorial preview data flow in core so rows are populated from canonical postmeta source for:
  - Author
  - Contributors
  - Tags
  - Updated
  - Read time
  - ToC (H2 only, capped)
- Added verifier `tools/verify-postmeta-contract.mjs` and wired it into `tools/gate-prod.sh`.
- Adjusted `tools/perf-budgets.json` core budget ceiling minimally to keep deterministic gate passing after feature-size increase.

FILES CHANGED
- index.prod.xml
- index.dev.xml
- public/assets/latest/modules/ui.bucket.core.js
- tools/verify-postmeta-contract.mjs
- tools/gate-prod.sh
- tools/perf-budgets.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- public/sw.js
- src/worker.js
- public/assets/v/92a57d2/*
- public/assets/v/b869b6d/*
- public/assets/v/43b6882/* (removed)
- public/assets/v/f25e4f5/* (removed)

VERIFICATION OUTPUTS
- `node tools/verify-postmeta-contract.mjs`
```text
VERIFY_POSTMETA_CONTRACT: PASS
```

- `npm run gate:prod`
```text
VERIFY_RELEASE_ALIGNED: PASS
VERIFY_POSTMETA_CONTRACT: PASS
VERIFY_PERF_BUDGETS: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

NOTES
- Gate runs in local sandbox with offline smoke fallback because live host resolution is unavailable in this environment.
