# TASK-002N-B — Extract Template Hydration Helpers from legacy-app

## Fast Use

```bash
unzip gg-task-002n-b-extract-template-hydration-helpers.zip
cp -R gg-task-002n-b-extract-template-hydration-helpers/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002n-b-acceptance.sh
```

Then paste `CLINE-PASTE-ME.txt` into Cline.

## Goal

Extract the stable template-hydration helper seam out of `src/modules/legacy-app/legacy-app.js` into a small public module, without changing public runtime behavior.

This is the first real split after `TASK-002N`.

## Target Principle

The public UI is now template-first. JavaScript should mostly:

- clone purpose-specific templates,
- fill text/attributes,
- set aria/state/icon,
- wire behavior,
- avoid generating user-visible chrome structure directly.

## Strict Scope

Allowed:

- Create a focused helper module for template lookup/cloning/hydration.
- Move only stable, low-risk helper functions from `legacy-app.js`.
- Update `legacy-app.js` to use/import the helper module.
- Update policy/inventory docs and bridge map.
- Add acceptance script.

Not allowed:

- Do not split comments/replies business logic yet.
- Do not split saved listing, popular controls, related posts, or Blogger parsing yet.
- Do not delete `legacy-app.js`.
- Do not delete `legacy-donor/`.
- Do not restructure Store folders.
- Do not implement OAuth/Blogger API.
- Do not install dependencies.
- Do not manually edit `dist/**` or `.cloudflare-build/**`.

## Expected New Module

Preferred path:

```txt
src/modules/template-hydration/template-hydration.js
```

If the current build architecture absolutely requires the helper to live under the legacy folder, stop and explain; otherwise use the preferred path.

## Required Commands

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-b-acceptance.sh
```
