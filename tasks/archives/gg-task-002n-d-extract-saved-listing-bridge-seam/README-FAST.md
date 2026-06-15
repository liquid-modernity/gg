# TASK-002N-D — Extract Saved Listing Bridge Seam

Sniper task pack untuk Cline/AI Code Agent.

Tujuan: mulai memecah bucket **saved listing** dari `src/modules/legacy-app/legacy-app.js` ke module bridge kecil tanpa rewrite flow besar dan tanpa mengubah behavior publik.

## Cara pakai

```bash
unzip gg-task-002n-d-extract-saved-listing-bridge-seam.zip
cp -R gg-task-002n-d-extract-saved-listing-bridge-seam/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002n-d-acceptance.sh
```

Paste isi `CLINE-PASTE-ME.txt` ke Cline.

## Target akhir

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-d-acceptance.sh
```

## Scope sempit

Create:

```txt
src/modules/saved-listing-bridge/saved-listing-bridge.js
src/modules/saved-listing-bridge/saved-listing-bridge.contract.json
```

Update:

```txt
src/modules/legacy-app/legacy-app.js
registry/modules.json
tools/build.mjs
src/modules/legacy-app/bridge-map.json
src/modules/legacy-app/README.md
config/legacy-app-bridge-policy.json
config/public-dom-generation-policy.json
docs/legacy-app-bridge-inventory.md
docs/public-dom-generation-audit.md
scripts/task002n-d-acceptance.sh
```

Do not remove `legacy-app` or `legacy-donor`.
