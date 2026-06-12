#!/usr/bin/env bash
set -euo pipefail
echo "=== TASK-002I Public Runtime Asset Root Fix — Acceptance ==="
echo ""

# 1) Run full pipeline
echo "--- Running full build pipeline ---"
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run console:check
npm run studio:check
npm run deploy:dry
echo ""

# 2) Assert required Cloudflare public output files exist
echo "--- Verifying .cloudflare-build/public runtime assets ---"
REQUIRED=(
  ".cloudflare-build/public/assets/gg-app.min.js"
  ".cloudflare-build/public/assets/gg-app.min.css"
  ".cloudflare-build/public/assets/store/store.css"
  ".cloudflare-build/public/assets/store/store-core.js"
  ".cloudflare-build/public/assets/store/store-discovery.js"
  ".cloudflare-build/public/__gg/assets/css/gg-app.min.css"
  ".cloudflare-build/public/__gg/assets/js/gg-app.min.js"
  ".cloudflare-build/public/__gg/assets/js/gg-app.dev.js"
  ".cloudflare-build/public/runtime/public-config.json"
  ".cloudflare-build/public/manifest.webmanifest"
  ".cloudflare-build/public/sw.js"
  ".cloudflare-build/public/offline.html"
  ".cloudflare-build/public/landing.html"
  ".cloudflare-build/public/store.html"
)

FAILED=0
for f in "${REQUIRED[@]}"; do
  if [ -f "$f" ]; then
    echo "  ok: $f"
  else
    echo "  FAIL: $f MISSING"
    FAILED=$((FAILED + 1))
  fi
done
echo ""

# 3) Assert no build assets are stranded outside .cloudflare-build/public without mirror
echo "--- Checking for stranded assets ---"
STRANDED=0
# Check if .cloudflare-build has assets outside public/
for dir in .cloudflare-build/assets .cloudflare-build/__gg .cloudflare-build/runtime; do
  if [ -d "$dir" ]; then
    echo "  WARN: $dir exists outside .cloudflare-build/public/ (may be a stale legacy copy)"
    STRANDED=$((STRANDED + 1))
  fi
done
if [ "$STRANDED" -eq 0 ]; then
  echo "  ok: no stranded directories outside .cloudflare-build/public/"
fi
echo ""

# 4) Print paths for production smoke test
echo "--- Production smoke test URLs ---"
echo "  https://www.pakrpp.com/runtime/public-config.json"
echo "  https://www.pakrpp.com/assets/gg-app.min.js"
echo "  https://www.pakrpp.com/assets/gg-app.min.css"
echo "  https://www.pakrpp.com/assets/store/store-core.js"
echo "  https://www.pakrpp.com/assets/store/store-discovery.js"
echo "  https://www.pakrpp.com/assets/store/store.css"
echo "  https://www.pakrpp.com/__gg/assets/css/gg-app.min.css"
echo "  https://www.pakrpp.com/__gg/assets/js/gg-app.min.js"
echo "  https://store.pakrpp.com/runtime/public-config.json"
echo ""

if [ "$FAILED" -gt 0 ]; then
  echo "=== ACCEPTANCE FAILED: $FAILED missing file(s) ==="
  exit 1
fi

echo "=== TASK-002I acceptance passed ==="