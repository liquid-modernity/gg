# TASK-002N-D-PATCH-2 — Saved Listing Exclusive Mode Runtime Fix

## Goal
Fix the remaining runtime/visual contract bug in Saved mode: Saved must behave as an exclusive listing mode, not an appended block below Latest/native rows.

## Current symptom
After TASK-002N-D-PATCH, the saved rows functionally render and `Details` is no longer visible, but in manual testing:

- native/latest posts are still visible,
- saved rows still appear below native/latest posts,
- the top mode label still says `Latest`,
- Saved mode is not visually exclusive.

## Use
Copy `CLINE-PASTE-ME.txt` into Cline from repo root.

## Final validation

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-d-patch-2-acceptance.sh
```

## Scope
Patch only Saved listing presentation/runtime contract. Do not proceed to Popular/Related extraction yet.
