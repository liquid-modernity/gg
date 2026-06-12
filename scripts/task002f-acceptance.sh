#!/usr/bin/env bash
set -euo pipefail

echo "=== TASK-002F ACCEPTANCE ==="
echo ""

echo "--- npm run doctor ---"
npm run doctor

echo ""
echo "--- npm run build ---"
npm run build

echo ""
echo "--- npm run check ---"
npm run check

echo ""
echo "--- npm run check:softcode ---"
npm run check:softcode

echo ""
echo "--- npm run check:public-softcode ---"
npm run check:public-softcode

echo ""
echo "--- npm run console:check ---"
npm run console:check

echo ""
echo "--- npm run studio:check ---"
npm run studio:check

echo ""
echo "--- npm run deploy:dry ---"
npm run deploy:dry

echo ""
echo "--- Verify runtime/public-config.json exists ---"
if [ -f "dist/prod/runtime/public-config.json" ]; then
  echo "ok: dist/prod/runtime/public-config.json exists"
else
  echo "FAIL: dist/prod/runtime/public-config.json missing"
  exit 1
fi

echo ""
echo "--- Verify public-config.json has no obvious secret values ---"
# The JS check (check:public-softcode) already validates this deeply.
# Here we do a simple sanity: config must exist and be valid JSON.
if node -e "JSON.parse(require('fs').readFileSync('dist/prod/runtime/public-config.json','utf8'))" >/dev/null 2>&1; then
  echo "ok: public-config.json is valid JSON (deep secret check done by check:public-softcode)"
else
  echo "FAIL: public-config.json is not valid JSON"
  exit 1
fi

echo ""
echo "=== TASK-002F ACCEPTANCE PASSED ==="