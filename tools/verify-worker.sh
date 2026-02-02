#!/usr/bin/env bash
set -euo pipefail

urls=(
  "https://www.pakrpp.com/assets/dev/main.css?x=1"
  "https://www.pakrpp.com/assets/dev/main.js?x=1"
  "https://www.pakrpp.com/assets/v/bb9d16b/main.css?x=1"
  "https://www.pakrpp.com/assets/v/bb9d16b/main.js?x=1"
  "https://www.pakrpp.com/sw.js?x=1"
  "https://www.pakrpp.com/manifest.webmanifest?x=1"
  "https://www.pakrpp.com/offline.html?x=1"
  "https://www.pakrpp.com/__gg_worker_ping?x=1"
)

for url in "${urls[@]}"; do
  echo "==> ${url}"
  curl -sSI "$url" | grep -i -E '^(HTTP/|cf-cache-status:|cache-control:|content-type:|x-gg-assets:)'
  echo
done

headers_url="https://www.pakrpp.com/_headers?x=1"
echo "==> ${headers_url}"
status_line="$(curl -sSI "${headers_url}" | head -n 1)"
echo "${status_line}"
if echo "${status_line}" | grep -q " 200"; then
  echo "ERROR: /_headers should not be publicly served"
  exit 1
fi
