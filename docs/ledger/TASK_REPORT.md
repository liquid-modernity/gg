TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0006K.2
TITLE: Deploy gate parity proof (router verifier)

TASK_SUMMARY
- Documented that manual dispatch runs the same deploy preflight verifiers, including the router contract gate.
- Updated pipeline docs to list `tools/verify-router-contract.mjs` for CI and deploy.
- Added a negative-test proof procedure showing the router verifier fails on contract violations.

FILES_CHANGED
- .github/workflows/deploy.yml
- docs/ci/PIPELINE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

NEGATIVE TEST PROOF — ROUTER VERIFIER BLOCKS DEPLOY
1. Create a temporary local branch.
2. Introduce a violation (example: remove the /assets deny from router._shouldIntercept).
3. Run the verifier and confirm failure.
4. Revert the change and confirm pass.

Commands (example)
```sh
git checkout -b tmp/router-verifier-proof
perl -0pi -e 's#/assets/#/assets-disabled/#' public/assets/latest/core.js
node tools/verify-router-contract.mjs
# Expected output includes:
# VERIFY_ROUTER_CONTRACT: FAIL
# - router._shouldIntercept must deny /assets/*

git restore public/assets/latest/core.js
node tools/verify-router-contract.mjs
# Expected output includes:
# VERIFY_ROUTER_CONTRACT: PASS

git checkout main
git branch -D tmp/router-verifier-proof
```

VERIFICATION COMMANDS
- `node tools/verify-router-contract.mjs`

RISKS / ROLLBACK
- Risk: none; documentation + gate parity only.
- Rollback: revert this commit.
