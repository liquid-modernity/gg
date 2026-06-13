#!/usr/bin/env bash
set -euo pipefail

run() {
  echo "\n>>> $*"
  "$@"
}

run npm run doctor
run npm run build
run npm run check
run npm run check:softcode
run npm run check:public-softcode
run npm run check:public-ui
run npm run console:check
run npm run studio:check
run npm run deploy:dry

required_paths=(
  ".cloudflare-build/public/__gg/assets/css/gg-app.min.css"
  ".cloudflare-build/public/__gg/assets/js/gg-app.dev.js"
  ".cloudflare-build/public/assets/gg-app.min.css"
  ".cloudflare-build/public/assets/gg-app.min.js"
  ".cloudflare-build/public/runtime/public-config.json"
)

for p in "${required_paths[@]}"; do
  if [ ! -f "$p" ]; then
    echo "FAIL: missing required runtime asset: $p" >&2
    exit 1
  fi
done

node - <<'NODE'
const fs = require('fs');
const css = fs.readFileSync('.cloudflare-build/public/__gg/assets/css/gg-app.min.css','utf8');
if (!css.includes('gg-icon')) throw new Error('built CSS does not include gg-icon');
if (!css.includes('Material Symbols')) throw new Error('built CSS does not bind gg-icon to Material Symbols');
const blog = fs.readFileSync('apps/blog/index.xml','utf8');
for (const icon of ['arrow_back_ios_new','ios_share']) {
  if (!blog.includes(icon)) throw new Error(`Blog template missing icon token: ${icon}`);
}
console.log('runtime icon/button contract smoke ok');
NODE

echo "\n=== TASK-002K ACCEPTANCE PASSED ==="
