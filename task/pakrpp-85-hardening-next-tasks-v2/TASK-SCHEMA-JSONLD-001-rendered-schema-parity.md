# TASK-SCHEMA-JSONLD-001 — Rendered Schema and JSON-LD Parity


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

Ensure JSON-LD/schema matches what each page actually renders.

Do not add decorative schema that contradicts the page.

## Route Schema Contract

```txt
/landing = WebPage + WebSite + Person/Organization identity
/        = Blog or CollectionPage + ItemList of non-Store articles
/store   = CollectionPage/Store-like product collection + ItemList of Store products
post     = Article for editorial posts, Product for Store posts
page     = WebPage
```

## Root `/` Requirements

```txt
root visual listing excludes Store
root ItemList excludes Store
root Discovery Articles/Topics exclude Store
Store may appear only as route/action
```

## Store `/store` Requirements

```txt
products = Store-domain products
categories = Store categories
non-Store editorial posts excluded
Product JSON-LD valid where product detail/static data exists
```

## Landing `/landing` Requirements

```txt
WebPage describes Home/identity surface
WebSite describes pakrpp.com
Person/Organization identity consistent
Contact anchor consistent
No public Landing label as user-facing IA
```

## Detail Requirements

Editorial posts should use Article/BlogPosting where applicable.
Store posts should use Product where applicable.

Never break canonical Blogger post URL.

## Required Guard

Add or update:

```txt
qa/schema-jsonld-guard.mjs
```

Guard should check:

```txt
valid JSON parse for JSON-LD blocks in artifacts/source
root ItemList excludes Store product titles/slugs where available
store ItemList includes products from manifest
Store Product schema exists for Store detail/static content where applicable
landing identity schema exists
no schema/content mismatch for root Store isolation
```

Add script if stable:

```json
{
  "gaga:verify-schema-jsonld": "node qa/schema-jsonld-guard.mjs"
}
```

## Guard Wiring Requirement

Any new guard added by this task must be wired into `package.json`, documented in `QA-COMMANDS.md`, and included in `ci:qa` if it protects a major contract. Do not leave orphaned guards.

## Acceptance Criteria

```txt
root schema matches root rendered content
store schema matches store rendered content
landing schema matches identity surface
Store product schema remains valid
Blog1 detail not broken
comments not broken
schema guard passes
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
