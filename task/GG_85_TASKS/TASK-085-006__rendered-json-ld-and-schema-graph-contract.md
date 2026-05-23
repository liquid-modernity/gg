# TASK-085-006 — Rendered JSON LD and Schema Graph Contract

Priority: **P1**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Make JSON-LD predictable after render, not just present in static source. The goal is Article/Breadcrumb/Organization/WebSite for content surfaces and Product/ItemList/Breadcrumb for Store surfaces, without overusing structured data as an AI-search gimmick.

## Current evidence from audit ZIP
Static pages contain JSON-LD, and Store build outputs ItemList/product data. However, Blogger XML expressions require rendered validation, and Store product quality still depends on real product data and images.

## Scope
Define schema graph per route type and add proof tooling that parses rendered/static artifacts. Do not add unnecessary schema types just to look advanced.

## Likely files / areas
- `index.xml`
- `landing.html`
- `store.html`
- `store-*.html`
- `src/store/*`
- `tools/build-store-static.mjs` / existing store build tooling
- New: `qa/jsonld-render-guard.mjs`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Write `docs/architecture/schema-graph-contract.md`.
2. Define allowed schema types per surface.
3. Ensure `@id`, canonical URL, breadcrumb order, image fields, and dates are consistent.
4. Add a parser guard that extracts all `application/ld+json` blocks from built/static artifacts.
5. For Blogger XML, validate template placeholders structurally and require live/rendered validation later.

## Acceptance criteria
- JSON-LD parses without syntax error in static artifacts.
- `/landing` breadcrumb semantics preserve Home behavior.
- `/` remains Blog listing, not confused with landing.
- `/store` has ItemList and product references without placeholder production images.
- No fake schema stuffing.

## Required QA / proof
```bash
node qa/jsonld-render-guard.mjs
npm run store:check:ci
npm run ci:qa
```

## Notes
Release-only: validate live rendered post/detail pages with Rich Results Test or equivalent external tooling.
