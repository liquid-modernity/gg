#!/usr/bin/env bash
set -euo pipefail

SOURCE_FILE="${GG_TEMPLATE_SOURCE_FILE:-index.prod.xml}"
OUT_DIR="${GG_TEMPLATE_OUT_DIR:-dist}"
ARTIFACT_FILE="${OUT_DIR}/blogger-template.publish.xml"
META_FILE="${OUT_DIR}/blogger-template.publish.txt"
VERIFY_BASE_URL="${GG_LIVE_BASE_URL:-https://www.pakrpp.com}"

if [[ ! -f "$SOURCE_FILE" ]]; then
  printf 'TEMPLATE PACK: ERROR source file not found: %s\n' "$SOURCE_FILE" >&2
  exit 2
fi

repo_expected="$(node qa/template-fingerprint.mjs --value --file "$SOURCE_FILE" 2>/dev/null || true)"
repo_embedded="$(node qa/template-fingerprint.mjs --embedded --file "$SOURCE_FILE" 2>/dev/null || true)"

if [[ -z "$repo_expected" || -z "$repo_embedded" ]]; then
  printf 'TEMPLATE PACK: ERROR unable to read template fingerprint from %s\n' "$SOURCE_FILE" >&2
  exit 2
fi

if [[ "$repo_expected" != "$repo_embedded" ]]; then
  printf 'TEMPLATE PACK: ERROR source marker stale (embedded=%s expected=%s)\n' "$repo_embedded" "$repo_expected" >&2
  printf 'TEMPLATE PACK: FIX run: node qa/template-fingerprint.mjs --write --file %s\n' "$SOURCE_FILE" >&2
  exit 2
fi

mkdir -p "$OUT_DIR"
cp "$SOURCE_FILE" "$ARTIFACT_FILE"

artifact_embedded="$(node qa/template-fingerprint.mjs --embedded --file "$ARTIFACT_FILE" 2>/dev/null || true)"
if [[ "$artifact_embedded" != "$repo_expected" ]]; then
  printf 'TEMPLATE PACK: ERROR artifact fingerprint mismatch (artifact=%s expected=%s)\n' "$artifact_embedded" "$repo_expected" >&2
  exit 2
fi

artifact_size="$(wc -c < "$ARTIFACT_FILE" | tr -d '[:space:]')"
artifact_sha256="$(shasum -a 256 "$ARTIFACT_FILE" | awk '{print $1}')"
generated_at_utc="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

cat > "$META_FILE" <<EOF
template_fingerprint=${repo_expected}
generated_at_utc=${generated_at_utc}
source_file=${SOURCE_FILE}
artifact_file=${ARTIFACT_FILE}
artifact_sha256=${artifact_sha256}
artifact_size_bytes=${artifact_size}
manual_publish_step=Blogger Theme -> Edit HTML -> replace with artifact content -> Save/Publish
verify_command_1=npm run gaga:template:status -- ${VERIFY_BASE_URL}
verify_command_2=npm run gaga:template:proof -- ${VERIFY_BASE_URL}
verify_command_3=npm run gaga:verify-template
EOF

printf 'TEMPLATE PACK\n'
printf 'source=%s\n' "$SOURCE_FILE"
printf 'artifact=%s\n' "$ARTIFACT_FILE"
printf 'metadata=%s\n' "$META_FILE"
printf 'fingerprint=%s\n' "$repo_expected"
printf 'artifact_sha256=%s\n' "$artifact_sha256"
printf 'artifact_size_bytes=%s\n' "$artifact_size"
printf 'release_state=worker_assets_deployed_only__blogger_template_publish_required\n'
printf 'next_step=Manual Blogger publish required (Theme -> Edit HTML -> replace with %s -> Save/Publish).\n' "$ARTIFACT_FILE"
printf 'verify_after_publish_1=npm run gaga:template:status -- %s\n' "$VERIFY_BASE_URL"
printf 'verify_after_publish_2=npm run gaga:template:proof -- %s\n' "$VERIFY_BASE_URL"
printf 'verify_after_publish_3=npm run gaga:verify-template\n'
