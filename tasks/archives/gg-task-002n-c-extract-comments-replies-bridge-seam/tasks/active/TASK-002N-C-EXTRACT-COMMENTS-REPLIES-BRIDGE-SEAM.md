# TASK-002N-C — Extract Comments/Replies Bridge Seam

## Status

Ready for Cline.

## Problem

`src/modules/legacy-app/legacy-app.js` is still the primary public runtime bridge. TASK-002N-B extracted the stable template hydration seam. The next safe split is a small comments/replies helper seam.

Comments/replies is a high-risk area, so this task must **not** rewrite flow. It only extracts small helper functions while keeping `legacy-app.js` as orchestrator.

## Goal

Create:

```txt
src/modules/comments-bridge/comments-bridge.js
src/modules/comments-bridge/comments-bridge.contract.json
```

and move a small set of stable comments/replies helpers from `legacy-app.js` into that module.

## Non-Goals

- No full comments/replies rewrite.
- No Blogger comment iframe/form behavior change.
- No direct comment-link resolver behavior change.
- No saved listing split.
- No popular controls split.
- No related posts split.
- No Store/Landing work.
- No OAuth.
- No dependency install.
- No `legacy-donor/` deletion.
- No `legacy-app.js` deletion.

## Acceptance Criteria

- `src/modules/comments-bridge/comments-bridge.js` exists.
- `src/modules/comments-bridge/comments-bridge.contract.json` exists.
- The new module exposes/defines `commentsBridge`.
- `legacy-app.js` calls at least two distinct `GG.commentsBridge.*` helpers.
- Build metadata includes the comments bridge before/as dependency of legacy-app.
- No new restricted DOM APIs are introduced.
- No new user-visible DOM generation is introduced.
- `check:public-dom` remains `needsTemplate=0` and `unclassified=0`.
- `check:legacy-bridge` remains green.
- Full pipeline passes.
- Generated output is not manually edited.

## Command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-c-acceptance.sh
```
