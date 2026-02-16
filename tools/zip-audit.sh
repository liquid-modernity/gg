#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/dist"
OUT_ZIP="$OUT_DIR/gg-audit.zip"
TMP_ZIP="$OUT_DIR/.gg-audit.tmp.zip"
MANIFEST="$OUT_DIR/gg-audit.integrity.txt"

mkdir -p "$OUT_DIR"
rm -f "$OUT_ZIP" "$TMP_ZIP" "$MANIFEST"

cd "$ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "FAIL: working tree must be clean before zip:audit (integrity guardrail)" >&2
  git status --short >&2
  exit 1
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "FAIL: unable to resolve git HEAD" >&2
  exit 1
fi

commit_sha="$(git rev-parse HEAD)"
commit_short="$(git rev-parse --short HEAD)"
release_id="$(grep -oE '/assets/v/[A-Za-z0-9._-]+' index.prod.xml | head -n 1 | sed -E 's#/assets/v/##')"

if [[ -z "$release_id" ]]; then
  echo "FAIL: release id not found in index.prod.xml" >&2
  exit 1
fi

if [[ ! -f "public/assets/v/${release_id}/main.css" ]]; then
  echo "FAIL: public/assets/v/${release_id}/main.css missing" >&2
  exit 1
fi

if [[ ! -f "public/assets/v/${release_id}/main.js" ]]; then
  echo "FAIL: public/assets/v/${release_id}/main.js missing" >&2
  exit 1
fi

git archive --format=zip --output "$TMP_ZIP" HEAD

{
  echo "COMMIT_SHA=${commit_sha}"
  echo "COMMIT_SHORT=${commit_short}"
  echo "RELEASE_ID=${release_id}"
  echo "GENERATED_AT_UTC=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "TRACKED_FILES_COUNT=$(git ls-files | wc -l | tr -d ' ')"
  echo
  echo "[SHA256]"
  for f in \
    index.prod.xml \
    docs/ledger/GG_CAPSULE.md \
    public/assets/latest/main.css \
    "public/assets/v/${release_id}/main.css" \
    "public/assets/v/${release_id}/main.js" \
    src/worker.js \
    tools/smoke.sh \
    tools/verify-ui-guardrails.mjs \
    tools/verify-infopanel-toc-contract.mjs; do
    if [[ -f "$f" ]]; then
      echo "$(shasum -a 256 "$f" | awk '{print $1}')  $f"
    fi
  done
} > "$MANIFEST"

zip -q -j "$TMP_ZIP" "$MANIFEST"
mv "$TMP_ZIP" "$OUT_ZIP"
rm -f "$MANIFEST"

echo "PASS: wrote $OUT_ZIP (commit=${commit_short} release=${release_id})"
