# TASK-085-010 — Performance Budget and Route Split Assets

Priority: **P1**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Move toward top-tier performance by setting budgets and splitting route/feature assets. The current JS/CSS weight is the main reason the project cannot honestly claim top-tier mobile performance yet.

## Current evidence from audit ZIP
Measured file sizes from ZIP: `src/js/gg-app.source.js` about 398 KB, `src/store/store-discovery.js` about 149 KB, `src/css/gg-app.source.css` about 89 KB, and `src/store/store.css` about 66 KB. Existing Lighthouse baselines show mobile performance is not yet top-tier.

## Scope
Define budgets for critical CSS, global JS, store JS, and per-surface optional modules. Split by route/intent without breaking Blogger SSR, comments, or Store isolation.

## Likely files / areas
- `src/js/gg-app.source.js`
- `src/js/modules/*`
- `src/store/store-discovery.js`
- `src/css/gg-critical.source.css`
- `src/css/gg-app.source.css`
- `tools/template-pack.mjs`
- `qa/perf-baseline/*`
- New: `qa/performance-budget-guard.mjs`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Write `docs/performance/performance-budget-v1.md`.
2. Define budgets:
   - critical CSS target
   - global JS target
   - store-only JS target
   - total blocking script budget
3. Identify modules that can lazy-load after first interaction.
4. Do not lazy-load primary crawlable content.
5. Add budget guard using built asset sizes.
6. Keep comments native plumbing safe.

## Acceptance criteria
- Asset budget report exists and fails on large regressions.
- Store-only logic is not loaded on general blog routes unless required.
- Root/landing global shell does not pay for Store discovery by default.
- Critical CSS contains only first-paint necessities.

## Required QA / proof
```bash
node qa/performance-budget-guard.mjs
npm run build
npm run ci:qa
npm run ci:store
```

## Notes
Do not chase fake 100 Lighthouse by breaking functionality. The real target is stable high mobile performance with crawlable content.
