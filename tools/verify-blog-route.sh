#!/usr/bin/env bash
set -euo pipefail

url="https://www.pakrpp.com/blog?x=1"
body="$(curl -sL "${url}")"

echo "==> ${url}"

echo "data-gg-home-root occurrences:"
echo "${body}" | grep -n "data-gg-home-root" || true

echo "gg-home-landing occurrences:"
echo "${body}" | grep -n "gg-home-landing" || true

if echo "${body}" | grep -q "data-gg-home-root" && echo "${body}" | grep -q "gg-home-landing"; then
  echo "PASS"
  exit 0
fi

echo "FAIL"
exit 1
