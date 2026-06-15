# TASK-002N-F — Extract Offline/Error/Fallback Bridge Seam

## Purpose
Extract a small, safe Offline/Error/Fallback helper seam out of `src/modules/legacy-app/legacy-app.js` without rewriting public runtime behavior.

This is a **seam extraction task**, not a UI redesign task.

## Copy into repo

```bash
unzip gg-task-002n-f-extract-offline-error-fallback-bridge-seam.zip
cp -R gg-task-002n-f-extract-offline-error-fallback-bridge-seam/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002n-f-acceptance.sh
```

## Paste to Cline
Open `CLINE-PASTE-ME.txt` and paste it into Cline.

## Final validation

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-f-acceptance.sh
```

## Hard boundaries
- Do not rewrite offline UI rendering.
- Do not rewrite error/404 page rendering.
- Do not rewrite service worker/cache behavior.
- Do not touch Store/Landing logic except build module registration if needed.
- Do not delete `src/modules/legacy-app/` or `legacy-donor/`.
- Do not edit `dist/**` or `.cloudflare-build/**` manually.
