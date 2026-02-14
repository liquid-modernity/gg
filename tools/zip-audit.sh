#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/dist"
OUT_ZIP="$OUT_DIR/gg-audit.zip"

mkdir -p "$OUT_DIR"
rm -f "$OUT_ZIP"

current_id=""
capsule="$ROOT/docs/ledger/GG_CAPSULE.md"
if [[ -f "$capsule" ]]; then
  current_id="$(grep -m1 '^RELEASE_ID:' "$capsule" | awk '{print $2}')"
fi

v_root="$ROOT/public/assets/v"
prev_id=""
if [[ -n "$current_id" && -d "$v_root" ]]; then
  for d in "$v_root"/*; do
    [[ -d "$d" ]] || continue
    base="$(basename "$d")"
    [[ "$base" == "$current_id" ]] && continue
    prev_id="$base"
    break
  done
fi

include=(
  "src"
  "tools"
  "scripts"
  "index.dev.xml"
  "index.prod.xml"
  "wrangler.jsonc"
  "package.json"
  "package-lock.json"
  "docs/ledger/GG_CAPSULE.md"
  "public/assets/latest"
  "public/sw.js"
  "public/manifest.webmanifest"
  "public/offline.html"
  "public/gg-pwa-icon"
)

if [[ -n "$current_id" && -d "$v_root/$current_id" ]]; then
  include+=("public/assets/v/$current_id")
fi

if [[ -n "$prev_id" && -d "$v_root/$prev_id" ]]; then
  include+=("public/assets/v/$prev_id")
fi

(
  cd "$ROOT"
  zip -r "$OUT_ZIP" "${include[@]}" \
    -x "**/node_modules/**" \
    -x "**/.git/**" \
    -x "**/__MACOSX/**"
)

echo "Wrote $OUT_ZIP"
