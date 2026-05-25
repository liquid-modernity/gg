# TASK-CLEANUP-001 — Remove Unused Overrides After Asset Contract Is Locked


Baseline assumption: Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, comments proof, and current CI/CD hardening are already stable.

Global rule for every task:
- Treat this as hardening/audit/contract work.
- Work one task only; do not start the next task.
- Do not rewrite stable Store/Discovery/Shell/Preview controllers unless a guard proves a real defect.
- Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
- Do not hardblock post titles, URLs, or slugs.
- Do not weaken QA guards.
- Do not add override-only CSS/JS.
- Do not edit generated output as the only fix.

Rewrite definition:
- Rewrite means consolidate duplicated behavior/configuration into one documented contract.
- Rewrite does not mean rebuilding stable systems from scratch.

QA/CI rule:
- Any new major guard must be wired into package.json, ci:qa or the relevant aggregate script, and QA-COMMANDS.md per TASK-QA-CI-RECONCILIATION-001.


## Prerequisite

Run only after:

```txt
TASK-ASSET-ARCHITECTURE-001
```

## Strategic Purpose

Remove dead CSS/JS/HTML and stale override code after source/generated asset ownership is clear.

This task must not become a blind deletion spree.

## Cleanup Targets

Potential targets:

```txt
stale CSS overrides
duplicate selectors
old sheet controller remnants
legacy theme System public UI remnants
old Discovery filters exposed in UI
unused hardblock remnants
stale calendar_add_on marker if safe
dead JS helper functions
unused QA scripts
unused generated artifact leftovers
```

## Required Method

For each cleanup item, document:

```txt
file
selector/function/block
why it is unused
how usage was checked
guard that protects against regression
```

Create:

```txt
CLEANUP-REPORT.md
```

## Required Guard

Add or update:

```txt
qa/cleanup-regression-guard.mjs
```

Guard should check that removed legacy patterns do not return:

```txt
public System theme option
legacy-only landing sheet handles
old Discovery visitor filters if deprecated
hardblock title/slug logic
Store content rendered in root listing
```

Add script if stable:

```json
{
  "gaga:verify-cleanup": "node qa/cleanup-regression-guard.mjs"
}
```

## Guard Wiring Requirement

Any new guard added by this task must be wired into `package.json`, documented in `QA-COMMANDS.md`, and included in `ci:qa` if it protects a major contract. Do not leave orphaned guards.

## Deletion Proof Requirement

For every removed CSS/JS/HTML block, report:

```txt
file
selector/function/block
why it is unused or duplicated
how usage was checked
which guard prevents regression
```

Do not delete code only because it looks old.

## Acceptance Criteria

```txt
cleanup report exists
each deletion has proof
no stable feature regresses
comments proof remains PASS
Store/Discovery/Theme/Shell/Preview guards remain PASS
CI remains PASS
```


Minimum QA after every task:

```bash
git diff --check
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run gaga:verify-discovery-filters
npm run gaga:verify-store-isolation
npm run gaga:verify-theme
npm run gaga:verify-shell
npm run gaga:verify-preview-sheet
npm run store:build
npm run store:proof
npm run ci:qa
npm run ci:cloudflare
```

After `TASK-QA-CI-RECONCILIATION-001` lands, `npm run gaga:verify-ci-reconciliation` must exist and pass as part of `ci:qa`.

Run live smoke after deploy or when the task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` is not acceptable.
