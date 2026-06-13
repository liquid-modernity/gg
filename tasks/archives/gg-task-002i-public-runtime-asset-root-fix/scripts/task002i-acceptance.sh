#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002I ACCEPTANCE ===\n'

run() {
  printf '\n$ %s\n' "$*"
  "$@"
}

run npm run doctor
run npm run build
run npm run check
run npm run check:softcode
run npm run check:public-softcode
run npm run console:check
run npm run studio:check
run npm run deploy:dry

required=(
  ".cloudflare-build/public/assets/gg-app.min.js"
  ".cloudflare-build/public/assets/gg-app.min.css"
  ".cloudflare-build/public/assets/store/store.css"
  ".cloudflare-build/public/assets/store/store-core.js"
  ".cloudflare-build/public/assets/store/store-discovery.js"
  ".cloudflare-build/public/__gg/assets/css/gg-app.min.css"
  ".cloudflare-build/public/__gg/assets/js/gg-app.min.js"
  ".cloudflare-build/public/__gg/assets/js/gg-app.dev.js"
  ".cloudflare-build/public/runtime/public-config.json"
)

printf '\nChecking required Cloudflare public output files...\n'
for file in "${required[@]}"; do
  if [ ! -s "$file" ]; then
    echo "FAIL: missing or empty $file" >&2
    exit 1
  fi
  echo "ok: $file"
done

printf '\nChecking dist public roots...\n'
for file in \
  "dist/prod/public/assets/gg-app.min.js" \
  "dist/prod/public/assets/gg-app.min.css" \
  "dist/prod/public/runtime/public-config.json"; do
  if [ ! -s "$file" ]; then
    echo "FAIL: missing or empty $file" >&2
    exit 1
  fi
  echo "ok: $file"
done

if [ -e ".cloudflare-build/assets/gg-app.min.js" ] && [ ! -e ".cloudflare-build/public/assets/gg-app.min.js" ]; then
  echo "FAIL: asset stranded outside public root: .cloudflare-build/assets/gg-app.min.js" >&2
  exit 1
fi

if [ -e ".cloudflare-build/__gg/assets/js/gg-app.min.js" ] && [ ! -e ".cloudflare-build/public/__gg/assets/js/gg-app.min.js" ]; then
  echo "FAIL: __gg asset stranded outside public root" >&2
  exit 1
fi

node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('.cloudflare-build/public/runtime/public-config.json','utf8')); console.log('ok: runtime public-config JSON valid')"

printf '\nProduction smoke URLs after deploy:\n'
printf '%s\n' \
  'https://www.pakrpp.com/runtime/public-config.json' \
  'https://store.pakrpp.com/runtime/public-config.json' \
  'https://www.pakrpp.com/__gg/assets/css/gg-app.min.css' \
  'https://www.pakrpp.com/__gg/assets/js/gg-app.dev.js' \
  'https://store.pakrpp.com/assets/store/store.css' \
  'https://store.pakrpp.com/assets/store/store-core.js' \
  'https://store.pakrpp.com/assets/store/store-discovery.js'

printf '\n=== TASK-002I ACCEPTANCE PASSED ===\n'
