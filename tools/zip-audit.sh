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

history=()
if [[ -f "$capsule" ]]; then
  in_history=0
  while IFS= read -r line; do
    if [[ "$line" =~ ^RELEASE_HISTORY: ]]; then
      in_history=1
      continue
    fi
    if [[ "$in_history" == "1" ]]; then
      if [[ "$line" =~ ^-[[:space:]]*([0-9a-f]+) ]]; then
        history+=("${BASH_REMATCH[1]}")
        continue
      fi
      break
    fi
  done < "$capsule"
fi

if [[ ${#history[@]} -eq 0 && -n "$current_id" ]]; then
  history=("$current_id")
fi

current_id="${history[0]:-$current_id}"
prev_id="${history[1]:-}"
v_root="$ROOT/public/assets/v"

include=(
  "src"
  "tools"
  "scripts"
  "index.dev.xml"
  "index.prod.xml"
  "wrangler.jsonc"
  "package.json"
  "package-lock.json"
  ".github/workflows"
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
