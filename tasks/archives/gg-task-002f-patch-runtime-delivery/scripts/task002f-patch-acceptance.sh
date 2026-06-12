#!/usr/bin/env bash
set -euo pipefail

fail() { echo "FAIL: $*" >&2; exit 1; }
ok() { echo "ok: $*"; }

if find . \( -name '.DS_Store' -o -name '._*' -o -name '__MACOSX' \) -print -quit | grep -q .; then
  fail "macOS junk files found"
fi
ok "repo hygiene"

npm run build >/tmp/gg-task002f-patch-build.log 2>&1 || { cat /tmp/gg-task002f-patch-build.log; fail "build failed"; }
ok "build"

npm run check:public-softcode >/tmp/gg-task002f-patch-check.log 2>&1 || { cat /tmp/gg-task002f-patch-check.log; fail "check:public-softcode failed"; }
ok "check:public-softcode"

[ -f dist/prod/runtime/public-config.json ] || fail "missing dist/prod/runtime/public-config.json"
[ -f .cloudflare-build/public/runtime/public-config.json ] || fail "missing .cloudflare-build/public/runtime/public-config.json"
node -e "JSON.parse(require('fs').readFileSync('dist/prod/runtime/public-config.json','utf8')); JSON.parse(require('fs').readFileSync('.cloudflare-build/public/runtime/public-config.json','utf8'))" || fail "runtime public-config invalid JSON"
ok "runtime public-config exists and parses"

# At least one deployable production JS asset must exist and include public softcode marker.
JS_ASSETS=$(find .cloudflare-build/public -type f \( -name '*.js' -o -path '*/assets/js/*' \) 2>/dev/null || true)
[ -n "$JS_ASSETS" ] || fail "no JS assets found in .cloudflare-build/public"
if ! grep -R "publicSoftcodeInit\|public-softcode\|data-gg-copy\|data-copy" .cloudflare-build/public --include='*.js' >/dev/null 2>&1; then
  fail "no public softcode marker found in delivered JS"
fi
ok "delivered JS contains public softcode marker"

# If templates reference canonical paths, those paths must exist in build output.
node <<'NODE'
const fs = require('fs');
const path = require('path');
const files = ['apps/blog/index.xml', 'apps/store/store.html', 'apps/landing/landing.html'];
const missing = [];
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  const re = /(?:href|src)=["']([^"']+\.(?:js|css))["']/g;
  for (const m of text.matchAll(re)) {
    const asset = m[1];
    if (/^https?:\/\//.test(asset)) continue;
    const clean = asset.split('?')[0].replace(/^\//, '');
    const candidates = [
      path.join('.cloudflare-build/public', clean),
      path.join('dist/prod', clean),
      path.join('dist/prod/assets', path.basename(clean)),
      path.join('.cloudflare-build/public/assets', path.basename(clean))
    ];
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      missing.push(`${file} references ${asset}, but no matching build asset exists`);
    }
  }
}
if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}
NODE
ok "referenced public JS/CSS assets exist"

echo "=== TASK-002F-PATCH ACCEPTANCE PASSED ==="
