#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILES=("${ROOT}/index.prod.xml" "${ROOT}/index.dev.xml")
PATTERN="href=['\"]#?www\\."

RG_RESOLVED=""
if [[ -n "${RG_BIN:-}" ]]; then
  if [[ -x "${RG_BIN}" ]]; then
    RG_RESOLVED="${RG_BIN}"
  else
    echo "WARN: RG_BIN set but not executable: ${RG_BIN}"
  fi
fi

if [[ -z "${RG_RESOLVED}" ]]; then
  if command -v rg >/dev/null 2>&1; then
    RG_RESOLVED="$(command -v rg)"
  fi
fi

if [[ -z "${RG_RESOLVED}" ]]; then
  if [[ -x "/opt/homebrew/bin/rg" ]]; then
    RG_RESOLVED="/opt/homebrew/bin/rg"
  elif [[ -x "/usr/local/bin/rg" ]]; then
    RG_RESOLVED="/usr/local/bin/rg"
  fi
fi

SEARCH_TOOL=""
if [[ -n "${RG_RESOLVED}" ]]; then
  SEARCH_TOOL="rg"
elif command -v grep >/dev/null 2>&1; then
  SEARCH_TOOL="grep"
fi

if [[ -z "${SEARCH_TOOL}" ]]; then
  echo "FAIL: no search tool available (rg not found and grep missing)."
  exit 1
fi

violations=0
for file in "${FILES[@]}"; do
  if [[ ! -f "${file}" ]]; then
    echo "FAIL: missing ${file}"
    exit 1
  fi
  if [[ "${SEARCH_TOOL}" == "rg" ]]; then
    if "${RG_RESOLVED}" -n -e "${PATTERN}" "${file}"; then
      violations=1
    fi
  else
    if grep -nE "${PATTERN}" "${file}"; then
      violations=1
    fi
  fi
done

if [[ "${violations}" -ne 0 ]]; then
  echo "FAIL: malformed hrefs detected (href='www.' or href='#www.')"
  exit 1
fi

echo "PASS: link hygiene (${SEARCH_TOOL})"
