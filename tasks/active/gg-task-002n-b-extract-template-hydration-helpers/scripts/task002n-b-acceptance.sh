#!/usr/bin/env bash
set -euo pipefail

echo "=== TASK-002N-B ACCEPTANCE ==="

ROOT="$(pwd)"
HELPER="src/modules/template-hydration/template-hydration.js"
LEGACY="src/modules/legacy-app/legacy-app.js"

if [ ! -f "$HELPER" ]; then
  echo "fail: missing $HELPER"
  exit 1
fi
echo "ok: helper module exists"

if ! grep -Eq "export[[:space:]]+function[[:space:]]+cloneTemplateElement|export[[:space:]]*\\{[^}]*cloneTemplateElement" "$HELPER"; then
  echo "fail: $HELPER must export cloneTemplateElement"
  exit 1
fi
echo "ok: cloneTemplateElement exported"

if ! grep -Eq "template-hydration|cloneTemplateElement" "$LEGACY"; then
  echo "fail: $LEGACY does not appear to use template hydration helper"
  exit 1
fi

if grep -Eq "function[[:space:]]+cloneTemplateElement[[:space:]]*\\(" "$LEGACY"; then
  echo "fail: inline function cloneTemplateElement still exists in legacy-app.js"
  exit 1
fi
echo "ok: inline cloneTemplateElement removed from legacy-app.js"

if grep -R "gg-template-button\\|gg-template-div\\|gg-template-link\\|gg-template-element\\|gg-template-generic" apps src 2>/dev/null; then
  echo "fail: generic/universal template found"
  exit 1
fi
echo "ok: no generic/universal templates"

DOM_OUTPUT="$(npm run check:public-dom 2>&1)"
echo "$DOM_OUTPUT"
if ! printf "%s" "$DOM_OUTPUT" | grep -q "needsTemplate=0"; then
  echo "fail: check:public-dom must report needsTemplate=0"
  exit 1
fi
if ! printf "%s" "$DOM_OUTPUT" | grep -q "unclassified=0"; then
  echo "fail: check:public-dom must report unclassified=0"
  exit 1
fi
echo "ok: public DOM remains template-clean"

npm run check:legacy-bridge
echo "ok: legacy bridge check passed"

if git diff --name-only | grep -Eq '^(dist|\.cloudflare-build)/'; then
  echo "fail: generated output was edited manually"
  exit 1
fi
echo "ok: no generated output edits detected"

echo "=== TASK-002N-B ACCEPTANCE PASSED ==="
