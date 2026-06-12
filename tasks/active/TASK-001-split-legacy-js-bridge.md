# TASK-001 — Split legacy JS bridge into source modules

## Goal
Gradually move behavior from `src/modules/legacy-app/legacy-app.js` into proper syntax-valid module JS files under `src/modules/<module>/<module>.js`.

## Allowed files

```txt
src/modules/**
registry/modules.json
checks/**
tools/build.mjs
```

## Forbidden files

```txt
dist/**
.cloudflare-build/**
legacy-donor/** as active import
```

## Notes
The old legacy fragments in `legacy-donor/js-fragments-reference` are reference-only and many are not standalone syntax-valid.
Do not import them directly.

## Validation

```bash
npm run doctor
npm run build
npm run check
```
