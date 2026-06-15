#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui
npm run check:public-dom
npm run check:legacy-bridge
npm run console:check
npm run studio:check
npm run deploy:dry

node --input-type=module <<'NODE'
import { readFile, stat } from 'node:fs/promises';

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

const helperPath = 'src/modules/saved-listing-bridge/saved-listing-bridge.js';
const contractPath = 'src/modules/saved-listing-bridge/saved-listing-bridge.contract.json';
const legacyPath = 'src/modules/legacy-app/legacy-app.js';
const maxLegacyBytes = 469827;
const maxLegacyLines = 11119;
const requiredExports = [
  'normalizeArticleUrl',
  'sanitizeSavedArticle',
  'parseSavedArticles',
  'stringifySavedArticles',
  'readSavedArticles',
  'writeSavedArticles',
  'isArticleSaved',
  'toggleSavedArticle'
];

if (!(await exists(helperPath))) throw new Error(`${helperPath} must exist`);
if (!(await exists(contractPath))) throw new Error(`${contractPath} must exist`);
if (!(await exists(legacyPath))) throw new Error(`${legacyPath} must exist`);
if (!(await exists('src/modules/legacy-app'))) throw new Error('src/modules/legacy-app/ must still exist');
if (!(await exists('legacy-donor'))) throw new Error('legacy-donor/ must still exist');

const helper = await readFile(helperPath, 'utf8');
const legacy = await readFile(legacyPath, 'utf8');
const registry = JSON.parse(await readFile('registry/modules.json', 'utf8'));
const build = await readFile('tools/build.mjs', 'utf8');
const bridgeMap = JSON.parse(await readFile('src/modules/legacy-app/bridge-map.json', 'utf8'));
const policy = JSON.parse(await readFile('config/legacy-app-bridge-policy.json', 'utf8'));
const legacyStat = await stat(legacyPath);
const legacyLines = legacy.split('\n').length - (legacy.endsWith('\n') ? 1 : 0);

for (const name of requiredExports) {
  if (!new RegExp(`export\\s+function\\s+${name}\\b`).test(helper)) {
    throw new Error(`saved-listing-bridge must export ${name}`);
  }
}

if (/document\.createElement\s*\(/.test(helper)) {
  throw new Error('saved-listing-bridge must not create DOM elements');
}
if (/\b(innerHTML|insertAdjacentHTML|outerHTML)\b/.test(helper)) {
  throw new Error('saved-listing-bridge must not use restricted HTML generation APIs');
}
if (!/GG\.savedListingBridge/.test(helper)) {
  throw new Error('saved-listing-bridge must attach GG.savedListingBridge');
}
if (!/GG\.savedListingBridge/.test(legacy) || !/savedListingBridge\./.test(legacy)) {
  throw new Error('legacy-app.js must consume GG.savedListingBridge');
}
if (/import\s+.*saved-listing-bridge/.test(legacy)) {
  throw new Error('legacy-app.js must not statically import saved-listing-bridge');
}

const usedHelpers = new Set();
for (const match of legacy.matchAll(/savedListingBridge\.([A-Za-z0-9_]+)/g)) {
  usedHelpers.add(match[1]);
}
if (usedHelpers.size < 2) {
  throw new Error(`legacy-app.js must use at least two savedListingBridge helpers, got ${Array.from(usedHelpers).join(',')}`);
}

if (legacyStat.size > maxLegacyBytes) {
  throw new Error(`legacy-app.js bytes must be <= ${maxLegacyBytes}, got ${legacyStat.size}`);
}
if (legacyLines > maxLegacyLines) {
  throw new Error(`legacy-app.js lines must be <= ${maxLegacyLines}, got ${legacyLines}`);
}

const order = registry.bundleOrder || [];
if (order.indexOf('saved-listing-bridge') < 0 || order.indexOf('legacy-app') < 0 || order.indexOf('saved-listing-bridge') > order.indexOf('legacy-app')) {
  throw new Error('saved-listing-bridge must be bundled before legacy-app');
}
if (!registry.modules?.['saved-listing-bridge']) throw new Error('registry.modules.saved-listing-bridge is missing');
if (!/saved-listing-bridge/.test(build)) throw new Error('tools/build.mjs must reference saved-listing-bridge');

if (!Array.isArray(bridgeMap.extractedSeams) || !bridgeMap.extractedSeams.some((entry) => entry.id === 'saved-listing-state')) {
  throw new Error('bridge map must document extracted saved-listing seam');
}
if (!Array.isArray(policy.extractedSeams) || !policy.extractedSeams.some((entry) => entry.id === 'saved-listing-state')) {
  throw new Error('bridge policy must document extracted saved-listing seam');
}

const bundle = await readFile('dist/prod/assets/gg-app.min.js', 'utf8');
if (/\bexport\s+function\s+normalizeArticleUrl\b/.test(bundle)) {
  throw new Error('generated browser bundle must not contain ESM export syntax from saved-listing-bridge');
}

const genericTemplates = policy.forbidden?.genericTemplates || [];
for (const surface of ['apps/blog/index.xml', 'apps/store/store.html']) {
  const markup = await readFile(surface, 'utf8');
  for (const id of genericTemplates) {
    const pattern = new RegExp(`\\bid\\s*=\\s*(['"])${id}\\1`);
    if (pattern.test(markup)) throw new Error(`forbidden generic template id found: ${id}`);
  }
}

console.log(JSON.stringify({
  ok: true,
  check: 'task002n-d-acceptance',
  helper: helperPath,
  exports: requiredExports,
  legacyUsesHelpers: Array.from(usedHelpers).sort(),
  legacy: {
    bytes: legacyStat.size,
    lines: legacyLines
  },
  genericTemplatesCreated: false
}, null, 2));
NODE
