#!/usr/bin/env bash
set -euo pipefail

echo "=== TASK-002M-G ACCEPTANCE ==="

required_files=(
  "config/public-dom-generation-policy.json"
  "docs/public-dom-generation-audit.md"
  "checks/public-dom.check.mjs"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "error: missing required file: $file" >&2
    exit 1
  fi
done

echo "ok: required files exist"

if ! grep -q "TASK-002M-G" docs/public-dom-generation-audit.md; then
  echo "error: docs/public-dom-generation-audit.md must document TASK-002M-G" >&2
  exit 1
fi

echo "ok: docs mention TASK-002M-G"

if ! grep -q "templateCompleteness" config/public-dom-generation-policy.json; then
  echo "error: config/public-dom-generation-policy.json must include templateCompleteness audit/rationale" >&2
  exit 1
fi

echo "ok: policy includes templateCompleteness rationale"

if grep -R -nE '<template[^>]+id="(gg-template-(div|link|element|button|generic)|.*generic.*template)' apps src 2>/dev/null; then
  echo "error: generic/universal template detected" >&2
  exit 1
fi

echo "ok: no generic/universal template names detected"

PUBLIC_DOM_OUTPUT="$(npm run check:public-dom 2>&1)"
echo "$PUBLIC_DOM_OUTPUT"

if ! printf '%s\n' "$PUBLIC_DOM_OUTPUT" | grep -q "public-dom ok:"; then
  echo "error: check:public-dom did not report ok" >&2
  exit 1
fi

if ! printf '%s\n' "$PUBLIC_DOM_OUTPUT" | grep -q "needsTemplate=0"; then
  echo "error: check:public-dom must keep needsTemplate=0" >&2
  exit 1
fi

if ! printf '%s\n' "$PUBLIC_DOM_OUTPUT" | grep -q "unclassified=0"; then
  echo "error: check:public-dom must keep unclassified=0" >&2
  exit 1
fi

echo "ok: public-dom remains needsTemplate=0 unclassified=0"

echo "=== TASK-002M-G ACCEPTANCE PASSED ==="
