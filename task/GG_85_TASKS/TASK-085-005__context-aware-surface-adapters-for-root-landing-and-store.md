# TASK-085-005 — Context Aware Surface Adapters for Root Landing and Store

Priority: **P0**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Create explicit adapters for `/`, `/landing`, and `/store` so every surface can keep its own DOM reality while obeying the same global controller and registry contracts.

## Current evidence from audit ZIP
Current root, landing, and store surfaces have different runtime entry points and public snapshots. The Store runtime is large and isolated; landing has inline controller logic; root uses the main GG app controller.

## Scope
Add a surface adapter layer with a predictable shape. Each adapter declares supported sheets, DOM selectors, capabilities, and constraints. The global controller calls adapters; adapters do not invent public APIs.

## Likely files / areas
- `src/js/gg-app.source.js`
- `src/registry/gg-system-registry.js`
- `src/store/store-core.js`
- `src/store/store-discovery.js`
- `landing.html` source/generator
- New: `src/surfaces/*` if useful

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Define adapter interface:
   - `surfaceKey`
   - `routeMatch()`
   - `registerSheets()`
   - `openSheet(key, options)`
   - `closeSheet(key, options)`
   - `snapshot()`
2. Implement root adapter.
3. Implement landing adapter.
4. Implement store adapter.
5. Register adapters under `GG.surfaces`.
6. Ensure Store isolation is declared as adapter capability, not scattered conditionals.

## Acceptance criteria
- `GG.surfaces.root`, `GG.surfaces.landing`, and `GG.surfaces.store` exist where relevant.
- Each surface snapshot has the same top-level fields.
- Surface-specific behavior is behind adapters, not global if/else sprawl.
- Root behavior remains the reference behavior.

## Required QA / proof
```bash
npm run gaga:verify-sheet-contract
npm run gaga:verify-store-isolation
npm run gaga:verify-discovery-contract
npm run ci:qa
```

## Notes
- Keep the implementation boring, explicit, and reversible. Do not add clever abstractions unless they reduce duplicated behavior across `/`, `/landing`, and `/store`.
