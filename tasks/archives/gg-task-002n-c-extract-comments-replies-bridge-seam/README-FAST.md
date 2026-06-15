# TASK-002N-C — Extract Comments/Replies Bridge Seam

## Fast Use

```bash
unzip gg-task-002n-c-extract-comments-replies-bridge-seam.zip
cp -R gg-task-002n-c-extract-comments-replies-bridge-seam/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002n-c-acceptance.sh
```

Then paste `CLINE-PASTE-ME.txt` into Cline.

## Goal

Extract a small, low-risk comments/replies bridge seam out of:

```txt
src/modules/legacy-app/legacy-app.js
```

into a focused module:

```txt
src/modules/comments-bridge/comments-bridge.js
```

This is **not** a full comments rewrite. It is a seam extraction task so the large legacy bridge can start shrinking safely.

## Current Context

- Public DOM is already template-first.
- `check:public-dom` should remain: `needsTemplate=0`, `unclassified=0`.
- `template-hydration` already exists and is bundled before `legacy-app`.
- `legacy-app.js` remains the temporary orchestrator.

## Strict Scope

Allowed:

- Create `src/modules/comments-bridge/comments-bridge.js`.
- Create `src/modules/comments-bridge/comments-bridge.contract.json`.
- Move **small, stable, low-risk comments/replies helper functions** out of `legacy-app.js`.
- Prefer pure helpers: ID normalization, comment/reply URL/hash helpers, selector helpers, state-shape helpers, class/aria helper utilities, safe text helpers.
- Keep `legacy-app.js` as orchestrator and have it call `GG.commentsBridge.*` helpers.
- Update bundle/build order so `comments-bridge` loads before `legacy-app`.
- Update bridge map, policy, inventory docs, registry/build metadata, and acceptance script.

Not allowed:

- Do not rewrite comments/replies flow.
- Do not change Blogger comment semantics.
- Do not change direct comment-link resolver behavior.
- Do not change UI templates unless a tiny contract marker is required.
- Do not create new user-visible DOM with `createElement`.
- Do not add `innerHTML`, `insertAdjacentHTML`, or `outerHTML`.
- Do not split saved listing, popular controls, related posts, Store, or Landing.
- Do not delete `legacy-app.js`.
- Do not delete `legacy-donor/`.
- Do not install dependencies.
- Do not manually edit `dist/**` or `.cloudflare-build/**`.

## Important Build Note

The repo currently uses a classic browser bundle. Follow the existing `template-hydration` pattern:

- expose a global namespace like `GG.commentsBridge`, and/or
- use `export` only if `tools/build.mjs` already handles stripping/concatenating that module safely.

Do **not** force static ESM imports into `legacy-app.js` if the runtime bundle cannot support them.

## Required Commands

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-c-acceptance.sh
```
