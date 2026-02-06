TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.2
TITLE: CI Determinism Gate + Pinned Router Contract

TASK_SUMMARY
- Added CI + deploy determinism gate to fail when build would modify tracked files.
- Router contract verifier now validates pinned `public/assets/v/<REL>/core.js` from `index.prod.xml` (latest optional).
- Added VSCode extension recommendations.

CHANGES
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- tools/verify-router-contract.mjs
- .vscode/extensions.json
- .gitignore

NOTES
- Build not run locally for this task because release now requires a clean tree.
- CI/deploy will enforce determinism after build in their pipelines.

VERIFICATION COMMANDS (recommended)
- `npm run build`
- `npm run verify:assets`
- `node tools/verify-router-contract.mjs`
- `node tools/verify-headers.mjs --mode=config`
- `node tools/verify-budgets.mjs`

RISKS / ROLLBACK
- Risk: low; determinism gate only fails if generated artifacts are not committed.
- Rollback: revert this commit.
