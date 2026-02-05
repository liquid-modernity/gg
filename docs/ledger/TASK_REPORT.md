TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0002
TITLE: Implement asset release contract (latest vs pinned)

TASK_SUMMARY
- Switched DEV theme to same-domain `/assets/latest/*` and removed jsdelivr dependency in `index.dev.xml`.
- Enforced cache policy in Worker for `/assets/latest/*`, `/assets/v/*`, `/sw.js`, and `/gg-flags.json`.
- Updated build tooling to emit versioned assets from `public/assets/latest/` and added asset verification script + npm scripts.
- Added release contract documentation with line references to Worker policy.

FILES_CHANGED
- index.dev.xml
- index.prod.xml (release id updated by build)
- package.json
- public/_headers
- public/sw.js (VERSION updated by build)
- src/worker.js (cache policy + VERSION updated by build)
- tools/release.js
- tools/verify-assets.mjs
- docs/release/ASSET_CONTRACT.md
- public/assets/v/c21421c/main.js
- public/assets/v/c21421c/main.css
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION
- Ran: `npm run build`
- Ran: `npm run verify:assets`
- Result: PASSED
  - RELEASE_ID=c21421c

RISKS / ROLLBACK
- Risk: Manual paste mismatch (dev/prod) can still violate the contract.
- Rollback: revert this commit and re-run `npm run build` for the prior release id.
