# PakRPP Next Tasks — Order and Execution Notes

## Recommended order

0. **Commit the current green baseline first** if it is not committed yet.
   - Current Discovery first-render fix should be frozen before larger IA/shell/theme work.

1. **TASK-STORE-ISOLATION-001**
   - Separate Store content from root Blog and Global Discovery.
   - This must come first because it defines the content-domain boundary.

2. **TASK-DISCOVERY-002**
   - Consolidate the Global Discovery builder for `/` and `/landing`.
   - This should consume the domain classifier from Store Isolation.

3. **TASK-DISCOVERY-003**
   - Remap Discovery filters from developer taxonomy to visitor taxonomy.
   - Do this after the builder is shared, otherwise you will remap two drifting systems.

4. **TASK-THEME-001**
   - Collapse Appearance to Kindle-like Light/Dark.
   - Do this before shell polish so shell tokens use the final theme system.

5. **TASK-SHELL-001**
   - Standardize global Dock, Outline, Sheet surface, focus trap, and drag-to-close.
   - Do this last because it depends on stable IA and final theme tokens.

## Hard rule

Do not touch or weaken Blog1 detail rendering, native Blogger comments, threaded comment behavior, `parentID`, composer movement, or post canonical logic unless the task explicitly says so. Store isolation is listing/index/domain filtering, not canonical rewriting.

## Required common verification after each task

Run at minimum:

```bash
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run store:build
npm run store:proof
npm run ci:cloudflare
git diff --check
```

If a task adds a dedicated guard, run it too.

## Commit discipline

Commit one task at a time. Do not bundle all five tasks into one commit. If a later task breaks the system, you need a clean rollback point.
