TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-PERF-FONTS-CLS-INP-20260222
TITLE: Preload critical woff2 + swap + guardrails

SUMMARY
- Hardened font loading to reduce CLS/perceived jank with a single critical `woff2` preload for above-the-fold iconography.
- Removed Google Fonts stylesheet preload dependency in templates and switched to explicit `as='font'` preload for Material Symbols Rounded.
- Added `@font-face` in `public/assets/latest/main.css` with `font-display: swap` and a `.material-symbols-rounded` baseline style block.
- Added deterministic verifier `tools/verify-font-policy.mjs` and wired it into `tools/gate-prod.sh`.
- Added policy doc `docs/perf/FONTS_POLICY.md`.

FONTS IN USE (NO GUESSING)
- UI text stack (system): `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial`.
- Icon font: `Material Symbols Rounded` (custom font) referenced throughout `public/assets/latest/main.css` via `font-family: "Material Symbols Rounded"`.
- Critical preloaded file (1 total):
  - `https://fonts.gstatic.com/s/materialsymbolsrounded/v317/syl7-zNym6YjUruM-QrEh7-nyTnjDwKNJ_190FjpZIvDmUSVOK7BDB_Qb9vUSzq3wzLK-P0J-V_Zs-obHph2-jOcZTKPq8a9A5M.woff2`

FILES CHANGED
- index.prod.xml
- index.dev.xml
- public/assets/latest/main.css
- tools/verify-font-policy.mjs
- tools/gate-prod.sh
- docs/perf/FONTS_POLICY.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-font-policy.mjs`
```text
PASS: font policy
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_RELEASE_ALIGNED: PASS
PASS: font policy
VERIFY_BUDGETS: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual browser sanity for CLS/first paint icon rendering outside sandbox.
