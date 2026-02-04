#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILES=("${ROOT}/index.prod.xml" "${ROOT}/index.dev.xml")
PATTERN="href=['\"]#?www\\."

violations=0
for file in "${FILES[@]}"; do
  if [[ ! -f "${file}" ]]; then
    echo "FAIL: missing ${file}"
    exit 1
  fi
  if rg -n "${PATTERN}" "${file}"; then
    violations=1
  fi
done

if [[ "${violations}" -ne 0 ]]; then
  echo "FAIL: malformed hrefs detected (href='www.' or href='#www.')"
  exit 1
fi

echo "OK: link hygiene"
