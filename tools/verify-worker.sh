#!/usr/bin/env bash
set -euo pipefail

base="https://www.pakrpp.com"
SW_JS_URL="${base}/sw.js?x=1"

REL="$(curl -sL "$SW_JS_URL" \
  | grep -oE 'const[[:space:]]+VERSION[[:space:]]*=[[:space:]]*"[^"]+"' \
  | head -n 1 \
  | sed -E 's/.*"([^"]+)".*/\1/')"
if [[ -z "${REL}" ]]; then
  echo "ERROR: failed to extract VERSION from ${SW_JS_URL}"
  curl -sL "$SW_JS_URL" | head -n 20
  exit 1
fi

echo "RELEASE_ID ${REL}"

urls=(
  "${base}/assets/dev/main.css?x=1"
  "${base}/assets/dev/main.js?x=1"
  "${base}/assets/v/${REL}/main.css?x=1"
  "${base}/assets/v/${REL}/main.js?x=1"
  "${base}/sw.js?x=1"
  "${base}/manifest.webmanifest?x=1"
  "${base}/offline.html?x=1"
  "${base}/__gg_worker_ping?x=1"
  "${base}/gg-flags.json?x=1"
)

for url in "${urls[@]}"; do
  echo "==> ${url}"
  curl -sSI "$url" \
    | tr -d '\r' \
    | grep -i -E '^(HTTP/|x-gg-worker:|x-gg-worker-version:|cache-control:|content-type:)'
  echo
done

flags_headers="$(curl -sSI "${base}/gg-flags.json?x=1" | tr -d '\r')"
flags_status="$(echo "${flags_headers}" | head -n 1)"
if ! echo "${flags_status}" | grep -q " 200"; then
  echo "ERROR: gg-flags.json must return 200 (got: ${flags_status})"
  exit 1
fi
if ! echo "${flags_headers}" | grep -qi '^cache-control:.*no-store'; then
  echo "ERROR: gg-flags.json must be no-store"
  exit 1
fi

headers_url="${base}/_headers?x=1"
echo "==> ${headers_url}"
headers_resp="$(curl -sSI "${headers_url}" | tr -d '\r')"
status_line="$(echo "${headers_resp}" | head -n 1)"
echo "${status_line}"
if echo "${status_line}" | grep -q " 200"; then
  echo "ERROR: /_headers should not be publicly served"
  echo "${headers_resp}" | grep -i -E '^(x-gg-worker|x-gg-worker-version|content-type|cache-control|server):' || true
  exit 1
fi
