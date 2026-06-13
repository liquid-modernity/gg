#!/usr/bin/env bash
set -euo pipefail

echo "=== TASK-002K Public UI Icon/Button Contract Repair Acceptance ==="
echo ""

echo "--- doctor ---"
npm run doctor
echo ""

echo "--- build ---"
npm run build
echo ""

echo "--- check ---"
npm run check
echo ""

echo "--- check:softcode ---"
npm run check:softcode
echo ""

echo "--- check:public-softcode ---"
npm run check:public-softcode
echo ""

echo "--- check:public-ui ---"
npm run check:public-ui
echo ""

echo "--- console:check ---"
npm run console:check
echo ""

echo "--- studio:check ---"
npm run studio:check
echo ""

echo "--- deploy:dry ---"
npm run deploy:dry
echo ""

echo "--- verify build output assets ---"
for asset in \
  ".cloudflare-build/public/__gg/assets/css/gg-app.min.css" \
  ".cloudflare-build/public/__gg/assets/js/gg-app.dev.js"; do
  if [ -f "$asset" ]; then
    echo "ok: $asset exists"
  else
    echo "FAIL: Missing $asset"
    exit 1
  fi
done

echo ""
echo "=== TASK-002K acceptance complete ==="