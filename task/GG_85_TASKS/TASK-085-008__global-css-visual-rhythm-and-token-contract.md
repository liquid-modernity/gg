# TASK-085-008 — Global CSS Visual Rhythm and Token Contract

Priority: **P1**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Create one visual rhythm for spacing, radius, typography, sheet width, dock width, panel head, and mobile/desktop behavior. This prevents quiet-luxury design from degrading into per-surface CSS improvisation.

## Current evidence from audit ZIP
Current CSS sizes are substantial: `src/css/gg-app.source.css` around 89 KB and `src/store/store.css` around 66 KB. Store and global surfaces may visually align today, but the token contract needs to be explicit to prevent future drift.

## Scope
Move repeated visual constants into shared tokens and enforce surface adapters/components to consume those tokens. Store may keep surface-specific CSS, but not conflicting rhythm.

## Likely files / areas
- `src/css/gg-critical.source.css`
- `src/css/gg-app.source.css`
- `src/store/store.css`
- `src/store/store.critical.css`
- `landing.html` critical styles/source
- `qa/verify-css-sot.mjs`
- New: `qa/css-rhythm-guard.mjs`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Write `docs/architecture/global-style-rhythm-contract.md`.
2. Define token groups:
   - spacing
   - radius
   - sheet width
   - dock width
   - panel head
   - typography scale
   - z-index layers
   - safe-area spacing
3. Replace repeated hardcoded values where safe.
4. Add CSS guard for duplicate token-like values outside allowed token files.
5. Keep critical CSS small and only for first paint.

## Acceptance criteria
- Root, landing, and store visually share one rhythm.
- CSS custom properties are the source of truth for spacing/radius/panel widths.
- No new `!important` is introduced unless explicitly documented and justified.
- Critical CSS remains minimal.

## Required QA / proof
```bash
node qa/verify-css-sot.mjs
node qa/css-rhythm-guard.mjs
npm run build
npm run ci:qa
```

## Notes
- Keep the implementation boring, explicit, and reversible. Do not add clever abstractions unless they reduce duplicated behavior across `/`, `/landing`, and `/store`.
