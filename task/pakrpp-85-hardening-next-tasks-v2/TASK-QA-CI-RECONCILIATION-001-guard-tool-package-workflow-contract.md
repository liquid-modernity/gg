# TASK-QA-CI-RECONCILIATION-001 — Guard, Tool, Package Script, and GitHub Actions Reconciliation

## Strategic Purpose

Prevent drift between `qa/*.mjs` guards, `tools/*.mjs` build scripts, `package.json` scripts, aggregate CI commands, and GitHub Actions deploy workflows.

A guard that is not wired into the executable QA chain is decoration, not protection.

## Scope

Audit and reconcile:

```txt
qa/*.mjs
tools/*.mjs
package.json scripts
ci:qa
ci:cloudflare
.github/workflows/ci.yml
.github/workflows/deploy-cloudflare.yml
QA-COMMANDS.md
SOURCE-OF-TRUTH.md
READINESS-85 documentation/guard if present
```

## Required Audit

Check:

```txt
every major qa/*.mjs guard has a package.json script or is explicitly documented as advisory/manual
every major contract guard is included in ci:qa or the relevant aggregate command
ci:cloudflare calls the correct aggregate QA chain
deploy-cloudflare.yml verifies before deploy
deploy-cloudflare.yml live-smokes after deploy
GitHub Actions call aggregate npm scripts rather than duplicating stale manual guard lists
build tools are separated from read-only guards
generated artifacts are rebuilt from source, not manually patched
```

## Required Documentation

Create or update:

```txt
QA-COMMANDS.md
SOURCE-OF-TRUTH.md
ARCHITECTURE.md if needed
AGENTS.md if needed
READINESS-85.md or equivalent readiness document if present
```

Document:

```txt
which scripts are local QA
which scripts are CI QA
which scripts are deploy QA
which scripts are live smoke
which guards are mandatory
which guards are advisory/manual
which tools mutate generated artifacts
which guards must remain read-only
```

## Required Guard

Add or update:

```txt
qa/ci-reconciliation-guard.mjs
```

Add package script:

```json
{
  "gaga:verify-ci-reconciliation": "node qa/ci-reconciliation-guard.mjs"
}
```

Wire the guard into the aggregate chain if stable:

```txt
ci:qa must include npm run gaga:verify-ci-reconciliation
```

The guard should check:

```txt
package.json has ci:qa
package.json has ci:cloudflare
package.json has store:build
package.json has store:proof
package.json has gaga:template:pack
package.json has gaga:verify-worker-live:strict
package.json has gaga:verify-ci-reconciliation
important qa/*.mjs guards are referenced by npm scripts or documented as manual/advisory
ci:cloudflare includes ci:qa or otherwise proves aggregate QA coverage
GitHub Actions workflows call aggregate npm scripts
deploy workflow verifies before deploy
deploy workflow includes live smoke after deploy
no known major guard is orphaned
```

## Guard Design Rules

```txt
The guard must be deterministic.
The guard must be read-only.
The guard must not write source or generated files.
The guard must not depend on live network.
The guard must print PASS, PASS_WITH_WARNINGS, or CONTRACT_FAILURE.
The guard must exit non-zero on CONTRACT_FAILURE.
The guard may allow explicit advisory/manual exceptions only when documented.
```

## GitHub Actions Rule

Do not rewrite CI/CD unless needed. Prefer thin workflows that call package scripts.

Allowed changes:

```txt
add missing aggregate script call
remove stale duplicated manual command only if package aggregate already covers it
add comments/summary docs if helpful
verify deploy step uses the checked build/deploy chain
```

Forbidden changes:

```txt
large workflow rewrite without defect proof
changing Cloudflare credentials/secrets names
removing live smoke
removing ci:qa
removing ci:cloudflare
changing production deploy target
```

## Deployment Artifact Discipline

```txt
Verified artifact should be the deployed artifact, or every rebuild must be proven deterministic.
If npm run build is called more than once across CI/deploy, document whether outputs are deterministic and why drift is not expected.
Do not manually patch .cloudflare-build, dist, __gg/assets, or store/data artifacts.
```

## Minimum QA

```bash
git diff --check
npm run gaga:verify-ci-reconciliation
npm run ci:qa
npm run ci:cloudflare
```

If the task edits workflows, also check shell/YAML syntax where available and run the normal full QA chain from README.

## Acceptance Criteria

```txt
no orphaned major guard
no undocumented new QA command
new ci-reconciliation guard exists
gaga:verify-ci-reconciliation exists and passes
ci:qa includes the reconciliation guard or documents why not
GitHub Actions remain thin and script-driven
deploy workflow verifies before deploy and smoke-tests after deploy
source/generated boundary remains clear
current CI remains PASS
```

## Final Report Format

```txt
TASK-QA-CI-RECONCILIATION-001 completed.
Files changed:
Guards added/updated:
package.json scripts changed:
ci:qa changed: yes/no
ci:cloudflare changed: yes/no
GitHub Actions changed: yes/no + why
Docs updated:
QA commands run:
PASS/FAIL:
Warnings:
Known non-blocking limitations:
```
