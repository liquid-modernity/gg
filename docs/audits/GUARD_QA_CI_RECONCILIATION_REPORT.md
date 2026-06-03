# Guard QA CI Reconciliation Report

Reconciliation date: 2026-06-03
Task: `task/task-002-reconcile.md`
Evidence: `docs/audits/LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md`

## Summary

This reconciliation adds documentation for the blocker/warning/info validation model and documents the local macOS 10.15.x `npm ci` failure as:

- `LOCAL ENVIRONMENT BLOCKER`
- `CI NON-BLOCKING LOCAL ISSUE`

No dependency versions, package scripts, lockfile entries, GitHub Actions Node versions, Wrangler version, esbuild version, source code, or production flags were changed.

## Files Changed

| File | Change |
|---|---|
| `docs/ci-guard-policy.md` | Added blocker/warning/info guard policy, CI authority, local command expectations, release/deploy command policy, and future guard classification rules. |
| `docs/local-development.md` | Added local macOS 10.15.x esbuild/Wrangler compatibility guidance, validation authority, recommended Linux/Docker/newer macOS path, and downgrade warning. |
| `QA-COMMANDS.md` | Linked guard policy and local development docs; documented macOS 10.15.x `npm ci` local-only classification and validation authority. |
| `SOURCE-OF-TRUTH.md` | Added `docs/ci-guard-policy.md` and `docs/local-development.md` as source-of-truth docs; added local npm/esbuild caveat near release validation commands. |
| `docs/audits/GUARD_QA_CI_RECONCILIATION_REPORT.md` | Added this report. |

## Commands Run

| Command | Result | Classification |
|---|---|---|
| `sed -n '1,280p' task/task-002-reconcile.md` | Pass | Inspection |
| `sed -n '1,260p' docs/audits/LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md` | Pass | Evidence inspection |
| `sed -n '1,260p' docs/local-development.md` | Pass | Documentation inspection |
| `rg -n "npm ci\|esbuild\|macOS\|local development\|Docker\|Node 20\|GitHub Actions\|validation authority\|wrangler\|LOCAL ENVIRONMENT" ...` | Pass | Documentation search |
| `git diff --check` | Pass | Formatting validation |
| `npm ci` | Fail | Local environment blocker |
| `npm run gaga:verify-docs-contract` | Pass | Documentation guard |
| `npm run gaga:verify-ci-reconciliation` | Pass | CI/package/workflow reconciliation guard |
| `git diff -- package.json package-lock.json .github/workflows/ci.yml .github/workflows/deploy-cloudflare.yml .github/workflows/lighthouse-ci.yml` | Pass; no output | Confirmed package files and workflows were not changed |
| `git status --short` | Pass | Status inspection |

## Pass/Fail Results

| Required Command | Result | Notes |
|---|---|---|
| `npm ci` | Failed | Known local macOS 10.15.x esbuild native binary failure. |
| `npm run build` | Not run | Not run because fresh local install failed first. |
| `npm run ci:qa` | Not run | Not run because fresh local install failed first. |
| `npm run ci:85` | Not run | Not run because fresh local install failed first. |
| `npm run ci:95` | Not run | Not run because fresh local install failed first. |

The `npm ci` failure is not hidden and is not reclassified as success. It is treated as a local environment blocker based on the compatibility audit.

## Failed Commands

| Command | Failure | Classification |
|---|---|---|
| `npm ci` | `node_modules/esbuild/bin/esbuild --version` failed with `dyld: Symbol not found: _SecTrustCopyCertificateChain`; binary was built for Mac OS X 12.0 while local host is macOS 10.15.8. | `LOCAL ENVIRONMENT BLOCKER`; `CI NON-BLOCKING LOCAL ISSUE` |

## Guards Reclassified

| Item | Previous Treatment | Reconciled Treatment |
|---|---|---|
| Local macOS 10.15.x `npm ci` failure from `@esbuild/darwin-x64@0.27.0` | Reported as failed local clean install. | Local environment blocker and CI non-blocking local issue when GitHub Actions/Linux Node 20 validation passes. |
| GitHub Actions/Linux Node 20 `npm ci` failure | Blocker. | Remains blocker. |
| Advisory CSS/JS budgets, visual rhythm, Lighthouse, non-critical a11y warnings | Warning. | Remains warning unless explicit release mode promotes them. |
| Source/generated boundary, route truth, schema, Worker syntax, production flags, Store isolation/readiness | Blocker. | Remains blocker. |

## Workflows Created/Updated

No GitHub Actions workflows were created or updated.

Existing workflow policy remains:

- CI authority: `ubuntu-latest`, Node 20, `npm ci`, aggregate package scripts.
- Deploy workflow: `npm ci`, `npm run ci:cloudflare`, prepared Cloudflare deploy, strict live smoke.
- Lighthouse: advisory/non-blocking by default.

## Package Scripts Changed

None.

The following were intentionally not changed:

- `package.json`
- `package-lock.json`
- `wrangler` version
- `esbuild` version
- GitHub Actions Node version

## Docs Updated

- `docs/ci-guard-policy.md`
- `docs/local-development.md`
- `QA-COMMANDS.md`
- `SOURCE-OF-TRUTH.md`

## Remaining Blockers

| Blocker | Scope |
|---|---|
| Local `npm ci` cannot run on macOS 10.15.8 with current `wrangler -> esbuild` native binary chain. | Local environment only, based on current evidence. |
| Full local acceptance sequence could not be run after `npm ci` failure. | Local validation only. |

## Remaining Warnings

| Warning | Scope |
|---|---|
| Maintainers on macOS 10.15.x need GitHub Actions, Linux/Docker Node 20, or newer macOS for clean validation. | Local development |
| Package downgrade is not recommended without a dedicated dependency-risk task. | Dependency management |
| Documentation-only reconciliation depends on existing CI guards for enforcement. | Process |

## Risks Requiring Human Review

- Whether to add a future non-mutating `doctor:local` script for macOS compatibility warnings.
- Whether to standardize a Docker validation command for this repo.
- Whether local macOS 10.15.x support is still a requirement. If it is, a separate dependency strategy task is needed.

## Intentional Non-Changes

- No production flags changed.
- No package versions changed.
- No package scripts changed.
- No GitHub Actions workflows changed.
- No source/generated runtime artifacts changed.
- No guard was weakened.
