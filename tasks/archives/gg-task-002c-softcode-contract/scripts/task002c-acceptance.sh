#!/usr/bin/env bash
set -euo pipefail

printf 'TASK-002C acceptance: start\n'

missing=0
for file in \
  config/softcode.inventory.json \
  registry/surfaces.json \
  registry/theme-tokens.json \
  registry/navigation.json \
  registry/seo.json \
  checks/softcode.check.mjs
  do
  if [ ! -f "$file" ]; then
    printf 'missing required file: %s\n' "$file" >&2
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  exit 1
fi

if find . \( -path './node_modules' -o -path './.git' \) -prune -o \( -name '.DS_Store' -o -name '._*' -o -name '__MACOSX' \) -print | grep -q .; then
  printf 'macOS zip hygiene failed: remove .DS_Store, ._* or __MACOSX files\n' >&2
  find . \( -path './node_modules' -o -path './.git' \) -prune -o \( -name '.DS_Store' -o -name '._*' -o -name '__MACOSX' \) -print >&2
  exit 1
fi

node <<'NODE'
const fs = require('fs');
const requiredCategories = [
  'microcopy',
  'routesDomains',
  'themeTokens',
  'navigation',
  'seo',
  'storeCategories',
  'featureFlags',
  'icons',
  'bloggerTargets',
  'cachePolicy',
];
const requiredSurfaces = ['blog', 'landing', 'store', 'console', 'studio'];
function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
const inventory = readJson('config/softcode.inventory.json');
if (!inventory.categories || typeof inventory.categories !== 'object') {
  throw new Error('softcode.inventory.json must have categories object');
}
for (const key of requiredCategories) {
  if (!inventory.categories[key]) throw new Error(`missing softcode category: ${key}`);
  const item = inventory.categories[key];
  for (const field of ['status', 'owner', 'sourceOfTruth', 'surfaces', 'notes']) {
    if (!(field in item)) throw new Error(`category ${key} missing field ${field}`);
  }
}
const surfaces = readJson('registry/surfaces.json');
const surfaceMap = surfaces.surfaces || surfaces;
for (const id of requiredSurfaces) {
  const item = Array.isArray(surfaceMap) ? surfaceMap.find((x) => x.id === id) : surfaceMap[id];
  if (!item) throw new Error(`missing surface: ${id}`);
  for (const field of ['id', 'label', 'kind', 'hosts', 'routes', 'entry', 'configRefs', 'cacheProfile', 'status']) {
    if (!(field in item)) throw new Error(`surface ${id} missing field ${field}`);
  }
  if (!Array.isArray(item.hosts) || item.hosts.length < 1) throw new Error(`surface ${id} must have hosts`);
  if (!Array.isArray(item.routes) || item.routes.length < 1) throw new Error(`surface ${id} must have routes`);
  if (item.kind === 'private') {
    const profile = String(item.cacheProfile).toLowerCase();
    if (!profile.includes('no-store')) throw new Error(`private surface ${id} must have no-store cacheProfile`);
  }
}
const tokens = readJson('registry/theme-tokens.json');
for (const group of ['color', 'radius', 'spacing', 'typography', 'motion', 'shadow']) {
  if (!tokens.tokens || !tokens.tokens[group]) throw new Error(`theme tokens missing ${group}`);
}
const navigation = readJson('registry/navigation.json');
for (const group of ['publicPrimary', 'storePrimary', 'adminPrimary']) {
  if (!navigation[group]) throw new Error(`navigation missing ${group}`);
}
const seo = readJson('registry/seo.json');
for (const id of ['blog', 'landing', 'store']) {
  const item = seo.surfaces ? seo.surfaces[id] : seo[id];
  if (!item) throw new Error(`seo missing ${id}`);
  for (const field of ['titleKey', 'descriptionKey', 'canonicalRef', 'robots', 'jsonLdEnabled']) {
    if (!(field in item)) throw new Error(`seo ${id} missing ${field}`);
  }
}
console.log('task002c JSON contract ok');
NODE

npm run check:softcode

printf 'TASK-002C acceptance: ALL GREEN\n'
