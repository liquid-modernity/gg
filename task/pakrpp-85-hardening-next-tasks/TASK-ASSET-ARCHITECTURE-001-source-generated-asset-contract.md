# TASK-ASSET-ARCHITECTURE-001 — Source/Generated Asset Contract, Loading Strategy, and Parity Guards


Baseline assumption: Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, and CI/CD hardening are already stable.

Global rule for every task:
- Treat this as hardening/audit/contract work.
- Do not rewrite stable Store/Discovery/Shell/Preview controllers unless a guard proves a real defect.
- Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
- Do not hardblock post titles, URLs, or slugs.
- Do not weaken QA guards.


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
npm run ci:cloudflare
```

Run live smoke after deploy or when the task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` is not acceptable.
