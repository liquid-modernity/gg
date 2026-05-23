# TASK-085-003 — Unified Registry Contract for Copy Icons Routes Sheets and Actions

Priority: **P0**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Make registry the true configuration layer for microcopy, icons, routes, dock items, sheets, actions, Discovery, and Store categories. This reduces manual editing risk and makes the code easier for non-technical vibe coding and AI agents to inspect.

## Current evidence from audit ZIP
The ZIP already contains registry files such as `src/registry/gg-actions.registry.js`, `gg-dock.registry.js`, `gg-more.registry.js`, `gg-routes.registry.js`, `gg-system-registry.js`, and Store configs. However, large inline logic remains in `landing.html` and Store surface code, so the registry contract is not yet the single source of configuration.

## Scope
Centralize configurable labels, icons, route keys, sheet keys, action keys, and surface capability declarations. Runtime code should read registry values, not hardcode duplicate literals across surfaces.

## Likely files / areas
- `src/registry/*`
- `registry/copy/*`
- `registry/runtime/*`
- `src/store/store-categories.config.mjs`
- `src/js/gg-app.source.js`
- `landing.html` generated/source path
- `assets/store/store-discovery.js` / `src/store/store-discovery.js`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Create `docs/architecture/registry-contract-v1.md`.
2. Define canonical keys for routes, panels/sheets, dock items, icons, and copy.
3. Replace duplicated user-facing microcopy literals with registry references where safe.
4. Keep generated HTML allowed, but source configuration must live in registry/config files.
5. Add `qa/registry-contract-guard.mjs` to detect duplicate route/sheet/action literals outside allowed source-of-truth files.

## Acceptance criteria
- A coder can change label/icon/microcopy in one registry location.
- `/`, `/landing`, and `/store` use the same route/sheet/action vocabulary.
- Guard fails on new hardcoded public microcopy or icon literals in runtime code unless whitelisted.
- Existing copy registry guard still passes.

## Required QA / proof
```bash
node qa/copy-registry-guard.mjs
node qa/registry-contract-guard.mjs
npm run ci:qa
```

## Notes
- Keep the implementation boring, explicit, and reversible. Do not add clever abstractions unless they reduce duplicated behavior across `/`, `/landing`, and `/store`.
