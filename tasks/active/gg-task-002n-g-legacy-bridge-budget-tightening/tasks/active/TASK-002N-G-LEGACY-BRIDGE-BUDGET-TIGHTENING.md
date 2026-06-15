# TASK-002N-G — Legacy Bridge Budget Tightening

## Status
Active.

## Objective
Close the 002N bridge-splitting phase by locking the `legacy-app` baseline and tightening guards before new public feature work begins.

## Why
The repo now has a template-first public DOM contract and several extracted bridge seams. Before adding features such as smart back/share, contact CTA, and rich detail media utilities, the legacy bridge must be protected from silent growth.

## Baseline from prior task

```txt
legacy-app bytes: 471126
legacy-app lines: 11116
createElement: 6
allowedSmall: 0
allowedReviewed: 6
needsTemplate: 0
unclassified: 0
buckets: 9
```

## Required bridge modules

```txt
template-hydration
comments-bridge
saved-listing-bridge
popular-related-bridge
offline-fallback-bridge
legacy-app
```

All extracted bridge modules must be registered and bundled before `legacy-app`.

## Acceptance criteria

- `npm run check:legacy-bridge` validates bytes/lines budget.
- `npm run check:legacy-bridge` validates no public DOM regression.
- `npm run check:legacy-bridge` validates bridge registry/build order.
- `docs/legacy-app-bridge-inventory.md` documents current baseline and budget policy.
- `src/modules/legacy-app/README.md` warns that feature work must not grow the bridge.
- `src/modules/legacy-app/bridge-map.json` reflects extracted bridges and current baseline.
- Full final command passes.

## Non-goals

- No feature work.
- No new bridge extraction.
- No rendering/orchestration rewrite.
- No `legacy-donor` deletion.
- No generated output edits.
