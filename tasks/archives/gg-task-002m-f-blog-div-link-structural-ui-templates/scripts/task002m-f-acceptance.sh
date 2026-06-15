#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' '=== TASK-002M-F ACCEPTANCE ==='

npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui
npm run check:public-dom
npm run console:check
npm run studio:check
npm run deploy:dry

printf '%s\n' '--- Artifact checks ---'

BLOG_XML="apps/blog/index.xml"
LEGACY_JS="src/modules/legacy-app/legacy-app.js"

if [ ! -f "$BLOG_XML" ]; then
  echo "fail: missing $BLOG_XML" >&2
  exit 1
fi

if [ ! -f "$LEGACY_JS" ]; then
  echo "fail: missing $LEGACY_JS" >&2
  exit 1
fi

# Required purpose-specific templates. Keep these semantically named; agent may add more granular templates,
# but these families must be represented.
required_templates=(
  "gg-template-comment-reply-banner"
  "gg-template-comment-more-menu"
  "gg-template-comment-replies-context"
  "gg-template-popular-range-link"
)

for template_id in "${required_templates[@]}"; do
  if ! grep -q "id=\"$template_id\"\|id='$template_id'" "$BLOG_XML"; then
    echo "fail: required template missing: $template_id" >&2
    exit 1
  fi
done

echo 'ok: required purpose-specific templates are present'

# Do not allow universal/generic templates.
if grep -E "id=['\"]gg-template-(div|link|element|generic|action|button)['\"]" "$BLOG_XML" >/dev/null; then
  echo 'fail: universal/generic template found in apps/blog/index.xml' >&2
  exit 1
fi

echo 'ok: no universal/generic template introduced'

# Check that known structural classes are no longer assigned around createElement-created nodes.
# This is intentionally class-focused instead of line-number-focused.
node <<'NODE'
const fs = require('fs');
const file = 'src/modules/legacy-app/legacy-app.js';
const src = fs.readFileSync(file, 'utf8');

const suspicious = [
  'gg-comments__reply-banner',
  'gg-comment-more__menu',
  'gg-popular-controls__range'
];

let failed = false;
for (const cls of suspicious) {
  const idx = src.indexOf(cls);
  if (idx !== -1) {
    const window = src.slice(Math.max(0, idx - 900), Math.min(src.length, idx + 900));
    if (/createElement\s*\(\s*['\"](?:div|a)['\"]\s*\)/.test(window)) {
      console.error(`fail: ${cls} still appears near createElement('div'/'a')`);
      failed = true;
    }
  }
}

// Known structural creation must not remain as direct createElement+className patterns.
const directPatterns = [
  /createElement\s*\(\s*['\"]div['\"]\s*\)[\s\S]{0,700}gg-comments__reply-banner/,
  /createElement\s*\(\s*['\"]div['\"]\s*\)[\s\S]{0,700}gg-comment-more__menu/,
  /createElement\s*\(\s*['\"]a['\"]\s*\)[\s\S]{0,700}gg-popular-controls__range/
];
for (const re of directPatterns) {
  if (re.test(src)) {
    console.error(`fail: direct structural UI createElement pattern remains: ${re}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('ok: known structural div/link createElement patterns removed');
NODE

# Ensure audit doc was updated for this task.
if ! grep -q "TASK-002M-F" docs/public-dom-generation-audit.md; then
  echo 'fail: docs/public-dom-generation-audit.md missing TASK-002M-F section' >&2
  exit 1
fi

echo 'ok: audit doc updated'

printf '%s\n' '=== TASK-002M-F ACCEPTANCE PASSED ==='
