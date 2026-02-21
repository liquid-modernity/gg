TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-RECONCILE-GATE-PROOF-20260221
TITLE: Reconcile rulebooks, authors contract, gate parity, and proof workflow

TASK_SUMMARY
- Re-confirm operational sources exist and are enforceable: `docs/AGENTS.md`, `docs/NAMING.md`, `docs/release/DISTRIBUTION.md`, and `docs/pages/p-author.html`.
- Tighten `tools/verify-authors-dir-contract.mjs` to enforce exact contract: `authors.pakrpp.href` must equal `/p/pak-rpp.html`.
- Enforce gate order in `tools/gate-prod.sh` by adding `verify-rulebooks` and `verify-authors-dir-contract` right after `verify-ledger`.
- Make local workflow parity explicit: `./scripts/gg verify` now runs `npm run -s gate:prod` in `verify_repo()`.
- Update ledger capsule/task docs and release alignment to current computed release id.

FILES CHANGED
- tools/verify-authors-dir-contract.mjs
- tools/gate-prod.sh
- tools/scripts:gg
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/e0ff634/*
- public/assets/v/3f9a7f9/* (removed)

VERIFICATION COMMANDS + OUTPUTS
- `node tools/verify-rulebooks.mjs`
  - `VERIFY_RULEBOOKS: PASS`
- `node tools/verify-authors-dir-contract.mjs`
  - `VERIFY_AUTHORS_DIR_CONTRACT: PASS`
- `npm run gate:prod`
  - `VERIFY_RULEBOOKS: PASS`
  - `VERIFY_AUTHORS_DIR_CONTRACT: PASS`
  - `VERIFY_RELEASE_ALIGNED: PASS`
  - `VERIFY_ASSETS: PASS`
  - `VERIFY_LEDGER: PASS`
  - `VERIFY_ROUTER_CONTRACT: PASS`
  - `VERIFY_UI_GUARDRAILS: PASS`
  - `VERIFY_TEMPLATE_CONTRACT: PASS`
  - `VERIFY_TEMPLATE_FINGERPRINT: PASS`
  - `VERIFY_BUDGETS: PASS`
  - `VERIFY_INLINE_CSS: PASS`
  - `VERIFY_CRP: PASS`
  - `PASS: smoke tests (offline fallback)`
  - `PASS: gate:prod`
- `bash tools/gate-release.sh`
  - Ran successfully up to strict smoke stage (all config/local verifiers pass).
  - Final result: FAIL on strict live smoke due DNS (`Could not resolve host: www.pakrpp.com`).

ARTIFACT PLAN
- `npm run zip:audit` must run on clean tree post-commit.
- Archive content proof will verify required files are present:
  - `docs/AGENTS.md`
  - `docs/NAMING.md`
  - `docs/release/DISTRIBUTION.md`
  - `docs/pages/p-author.html`
  - `tools/verify-rulebooks.mjs`
  - `tools/verify-authors-dir-contract.mjs`

RISKS / ROLLBACK
- Risk: strict live gate depends on external DNS/network availability.
- Rollback: revert this commit to restore previous gate/verifier/workflow behavior.
