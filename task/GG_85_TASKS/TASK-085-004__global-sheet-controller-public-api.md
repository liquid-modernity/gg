# TASK-085-004 — Global Sheet Controller Public API

Priority: **P0**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Create one public sheet/panel controller API that is stable across root, landing, and store. This is the main source-of-behaviour task. Without this, the system will keep drifting because every surface exposes different method names and snapshots.

## Current evidence from audit ZIP
Root exposes `GG.sheetController = GG.panelController`. Landing currently exposes `LandingSurface.snapshot()`. Store currently exposes `StoreSurface.snapshot()`. This means public API is close but not uniform enough for AI agents or non-technical debugging.

## Scope
Standardize the public API while preserving surface-specific adapters under it. The API must control open, close, toggle, focus, drag, inert, aria, escape key, backdrop, and snapshot behavior.

## Likely files / areas
- `src/js/gg-app.source.js`
- `src/js/modules/core/public-api.fragment.js`
- `src/js/modules/core/contracts.fragment.js`
- `landing.html` source/generator
- `src/store/store-core.js`
- `src/store/store-discovery.js`
- `qa/sheet-contract-smoke.sh`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Define `GG.sheetController.open(key, options)`.
2. Define `GG.sheetController.close(key, options)`.
3. Define `GG.sheetController.toggle(key, options)`.
4. Define `GG.sheetController.closeAll(options)`.
5. Define `GG.sheetController.snapshot()`.
6. Add backward-compatible aliases only if needed, but mark them deprecated inside docs.
7. Ensure handle click close routes through the drag/controller contract, never a bypass.
8. Update guard to fail if landing/store only expose standalone snapshots without global controller registration.

## Acceptance criteria
- Browser console contract works on `/`, `/landing`, and `/store`:
  - `GG.sheetController.snapshot()`
  - `GG.sheetController.open('more')`
  - `GG.sheetController.close('more')`
- Snapshots return a shared schema with `surface`, `activeSheet`, `registeredSheets`, `inertState`, `focusState`, `dragState`, and `lastAction`.
- Existing sheet smoke test passes.

## Required QA / proof
```bash
bash qa/sheet-contract-smoke.sh
npm run gaga:verify-sheet-contract
npm run ci:qa
```

## Notes
This is the highest-leverage task. If this is skipped, later cleanup will be fake because behavior still lives in multiple places.
