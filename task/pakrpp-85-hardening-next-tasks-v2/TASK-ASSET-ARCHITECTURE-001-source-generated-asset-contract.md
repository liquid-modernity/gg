# TASK-ASSET-ARCHITECTURE-001 — Source/Generated Asset Contract, Loading Strategy, and Parity Guards


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


## Strategic Purpose

Create a clear asset architecture so CSS/JS/static files have obvious ownership, route loading, cache policy, and parity checks.

Do not aggressively split assets before proving safe.

## Definition

Asset architecture covers:

```txt
CSS source files
critical CSS
external CSS
JS source files
Store JS/CSS
icons/images
manifest/service worker
Cloudflare public assets
Blogger template publish artifact
store static artifacts
route-specific loading
cache/no-store policy
hash/fingerprint parity
```

## Required Documentation

Create or update:

```txt
ASSET-ARCHITECTURE.md
```

It must explain:

```txt
source files
generated files
which files are edited manually
which files are never edited manually
template-pack output
store-build output
cloudflare-prepare output
critical CSS purpose
external CSS purpose
route asset map
cache policy in development
production switch expectations
```

## Route Asset Map

Document current loading for:

```txt
/
 /landing
 /store
 post detail
 static page
 store category
```

Do not change loading yet unless a safe improvement is obvious and guarded.

## Source/Generated Guard

Add or update:

```txt
qa/asset-architecture-guard.mjs
```

Guard should check:

```txt
source/staged/dev/dist CSS hash parity
source/staged/dev/dist JS hash parity
dist/blogger-template publish parity
critical CSS source exists
external CSS href exists
generated assets are fresh after template-pack
store assets are fresh after store build
```

Add script if stable:

```json
{
  "gaga:verify-asset-architecture": "node qa/asset-architecture-guard.mjs"
}
```

## Critical CSS Budget

Document:

```txt
what is critical
what is non-critical
what remains inline for no-flash/shell safety
what remains external
what should not be duplicated
```

Do not perform broad CSS cleanup in this task unless guard-proven and safe.

## Deployment Artifact Discipline

```txt
Verified artifact should be the deployed artifact, or every rebuild must be proven deterministic.
If CI, Cloudflare prepare, and deploy rebuild artifacts more than once, document why outputs cannot drift.
Do not manually patch .cloudflare-build, dist, __gg/assets, or store/data as the fix.
```

## Acceptance Criteria

```txt
asset source/generated boundary is documented
route asset map is documented
parity guard exists or existing guard is strengthened
critical/external CSS roles are clear
no aggressive unsafe asset split
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
