TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-UX-COMMENTS-SINGLE-CTA-20260222
TITLE: Single-CTA comment loading (auto-load + hide internal load button)

SUMMARY
- Added `GG.modules.Comments.ensureLoaded()` in `public/assets/latest/modules/ui.bucket.core.js` as a dedicated primary comment CTA loader.
- Updated post detail comment button flow (`data-gg-postbar='comments'`) so opening comments panel now calls `GG.modules.Comments.ensureLoaded({ fromPrimaryAction:true })`.
- Internal comments gate button (`[data-gg-comments-load]`) is auto-triggered once when primary comment button is used, then hidden and state-marked with `data-gg-comments-loaded='1'`.
- Added scroll-to-comments behavior only for explicit primary comment button click path.
- Preserved native Blogger comments as black-box content (no rewrite of native internal comment markup/flows).
- Added guardrail verifier `tools/verify-comments-single-cta.mjs` and wired it into `tools/gate-prod.sh`.
- Bumped core raw perf budget ceiling minimally due deterministic code-size increase from new comments single-cta path.

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- public/assets/latest/main.css
- tools/verify-comments-single-cta.mjs
- tools/gate-prod.sh
- tools/perf-budgets.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md

VERIFICATION OUTPUTS
- `node tools/verify-comments-single-cta.mjs`
```text
PASS: comments single-cta contract
```

- `npm run gate:prod`
```text
PASS: comments single-cta contract
VERIFY_PERF_BUDGETS: PASS
PASS: gate:prod
```

MANUAL SANITY TARGET
- Open post detail -> click comment button once -> comments load and appear in comments panel without showing a second “Load comments” step.
