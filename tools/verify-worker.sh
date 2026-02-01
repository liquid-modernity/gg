#!/usr/bin/env bash
set -euo pipefail

urls=(
  "https://www.pakrpp.com/assets/dev/main.css?x=1"
  "https://www.pakrpp.com/assets/dev/main.js?x=1"
  "https://www.pakrpp.com/sw.js?x=1"
)

for url in "${urls[@]}"; do
  echo "==> ${url}"
  curl -sSI "$url" | grep -i -E '^(HTTP/|cache-control:|x-gg-worker:|cf-ray:|server:)'
  echo
done
