TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.1
TITLE: Immutable Release Enforcement + Pinned-Artifact Verification

TASK_SUMMARY
- Added release preflight: dirty tree fails unless ALLOW_DIRTY_RELEASE=1; existing v/<REL> cannot be overwritten if contents differ.
- Upgraded asset verifier to validate pinned release artifacts from `index.prod.xml` (core + modules in v/<REL>), not just latest.
- Built release `4139dc4` and verified pinned artifacts, headers, budgets, and router contract.

RELEASE DISCIPLINE
- `tools/release.js` now refuses dirty trees:
  "Release requires clean tree. Commit first. Set ALLOW_DIRTY_RELEASE=1 only for emergency."
- Existing `public/assets/v/<REL>/` cannot be overwritten if any file differs from current build output.

PINNED-ARTIFACT VERIFICATION
- `tools/verify-assets.mjs` now enforces:
  - `public/assets/v/<REL>/core.js` exists
  - `public/assets/v/<REL>/app.js` exists
  - `public/assets/v/<REL>/modules/*.js` includes all modules present in `public/assets/latest/modules`

PROOF COMMANDS (local)
```sh
git status -sb
npm run build
npm run verify:assets
node tools/verify-router-contract.mjs
node tools/verify-headers.mjs --mode=config
node tools/verify-budgets.mjs
```

RESULTS
- `npm run build` → RELEASE_ID 4139dc4
- `npm run verify:assets` → PASS (pinned release verified)
- `node tools/verify-router-contract.mjs` → PASS
- `node tools/verify-headers.mjs --mode=config` → PASS
- `node tools/verify-budgets.mjs` → PASS

NOTES
- Manual smoke checks are not run here (requires browser UI). Please run them locally.

RISKS / ROLLBACK
- Risk: low; release guard prevents overwrites, verifiers ensure pinned artifacts exist.
- Rollback: revert this commit and rebuild.
