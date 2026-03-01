TASK_REPORT
Last updated: 2026-03-01

TASK_ID: TASK-P0-TAXONOMY-NORMALIZATION
PARENT: TASK-P0-XML-ROUTER-TAXONOMY-AND-GATING
TITLE: Normalize taxonomy gates for mixed init and search/label attributes

SYMPTOM
- Mixed-media init gate still treated empty surface as allowed (`!surface || landing/home`), so `/blog` could be misclassified in edge timing and mixed module could initialize incorrectly.
- Audit required strict taxonomy proof for search vs label attributes (`data-gg-query` vs `data-gg-label`).

ROOT CAUSE
- Mixed module gate in listing bundle used permissive fallback on missing surface instead of strict surface allowlist.
- Router-contract verifier did not explicitly fail permissive empty-surface gate.

PATCH
- `public/assets/latest/modules/ui.bucket.listing.js`
  - Mixed init gate changed to strict surface gating:
    - allow only `landing` or `home`
    - deny empty/unknown surface
- `public/assets/v/ee58d86/modules/ui.bucket.listing.js`
  - Same strict gate patch applied to pinned active release to keep contract checks and runtime in sync.
- `tools/verify-router-contract.mjs`
  - Extended mixed gate checks to fail if gate allows empty surface (`!v` path).
  - Keeps assertions that mixed gate reads `data-gg-surface` / `routerCtx.surface` and is not keyed by `view==='home'`.

PROOF
- `node tools/verify-router-contract.mjs` → PASS
- `rg -n "data-gg-label|data-gg-query" index.prod.xml index.dev.xml` confirms:
  - `data-gg-query` only when `isSearch && !isLabelSearch`, value `data:view.search.query`
  - `data-gg-label` only when `isLabelSearch`, value `data:view.search.label`
- `tools/smoke.sh` (run in gate) includes router-contract and live taxonomy checks.

BACKWARD COMPATIBILITY
- Existing router contract markers unchanged:
  - `data-gg-page`
  - `data-gg-surface`
- No schema rename or control-plane change.
