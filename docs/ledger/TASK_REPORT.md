TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0004
TITLE: CI gate upgrade (build + verifiers)

TASK_SUMMARY
- Strengthened CI to run build + all verifiers; CI green now means build/verify passed.
- Added Node 20 + npm cache and npm ci install in CI.
- Documented CI as the primary gate in `docs/ci/PIPELINE.md`.

FILES_CHANGED
- .github/workflows/ci.yml
- docs/ci/PIPELINE.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

EXACT CI STEPS ADDED
- `npm ci` (generates temporary `package-lock.json` in CI if missing)
- `npm run build`
- `npm run verify:assets`
- `npm run build:xml`
- `npm run verify:xml`
- `node tools/verify-theme-diff.mjs` (if present)
- `bash tools/check-links.sh` (if present)
- XML well-formedness check (xmllint if available, else `node tools/validate-xml.js`)

HOW TO VERIFY IN GITHUB ACTIONS
1) Open Actions → workflow `CI`.
2) Run on a main push or PR.
3) Confirm these steps exist and pass: Install deps (npm ci), Build + verifiers, XML well-formedness.
4) Confirm deploy workflow triggers only after CI success (workflow_run).

RISKS / ROLLBACK
- Risk: CI runtime slightly longer due to build/verify steps.
- Rollback: revert this commit.
