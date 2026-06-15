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

const legacyPath = 'src/modules/legacy-app/legacy-app.js';
const policyPath = 'config/legacy-app-bridge-policy.json';
const registryPath = 'registry/modules.json';
const buildPath = 'tools/build.mjs';
const bridgeMapPath = 'src/modules/legacy-app/bridge-map.json';
const inventoryPath = 'docs/legacy-app-bridge-inventory.md';

const policy = JSON.parse(await readFile(policyPath, 'utf8'));
const registry = JSON.parse(await readFile(registryPath, 'utf8'));
const bridgeMap = JSON.parse(await readFile(bridgeMapPath, 'utf8'));
const build = await readFile(buildPath, 'utf8');
const inventory = await readFile(inventoryPath, 'utf8');
const legacy = await readFile(legacyPath, 'utf8');
const legacyStat = await stat(legacyPath);
const legacyLines = legacy.split('\n').length - (legacy.endsWith('\n') ? 1 : 0);

const budget = policy.legacyAppBudget || {};
const requiredBridgeModules = [
  'template-hydration',
  'comments-bridge',
  'saved-listing-bridge',
  'popular-related-bridge',
  'offline-fallback-bridge'
];

for (const [key, expected] of Object.entries({
  baselineBytes: 471126,
  maxBytes: 471126,
  baselineLines: 11116,
  maxLines: 11116,
  createElement: 6,
  allowedSmall: 0,
  allowedReviewed: 6,
  needsTemplate: 0,
  unclassified: 0,
  buckets: 9
})) {
  if (budget[key] !== expected) throw new Error(`legacyAppBudget.${key} must be ${expected}, got ${budget[key]}`);
}

if (legacyStat.size !== budget.baselineBytes) {
  throw new Error(`${legacyPath} bytes must equal baseline ${budget.baselineBytes}, got ${legacyStat.size}`);
}
if (legacyLines !== budget.baselineLines) {
  throw new Error(`${legacyPath} lines must equal baseline ${budget.baselineLines}, got ${legacyLines}`);
}
if (!Array.isArray(policy.extractionBuckets) || policy.extractionBuckets.length !== budget.buckets) {
  throw new Error(`policy extractionBuckets must equal ${budget.buckets}`);
}

const legacyIndex = registry.bundleOrder.indexOf('legacy-app');
if (legacyIndex < 0) throw new Error('legacy-app missing from registry bundleOrder');
for (const id of requiredBridgeModules) {
  const moduleConfig = registry.modules[id];
  const index = registry.bundleOrder.indexOf(id);
  if (!moduleConfig) throw new Error(`registry missing required bridge module ${id}`);
  if (moduleConfig.enabled !== true) throw new Error(`required bridge module ${id} must be enabled`);
  if (moduleConfig.type !== 'runtime-helper') throw new Error(`required bridge module ${id} must be runtime-helper`);
  if (index < 0 || index >= legacyIndex) throw new Error(`required bridge module ${id} must bundle before legacy-app`);
}

const helperSetMatch = build.match(/CLASSIC_RUNTIME_HELPER_MODULES\s*=\s*new Set\(\s*\[([\s\S]*?)\]\s*\)/);
if (!helperSetMatch) throw new Error('tools/build.mjs must expose literal CLASSIC_RUNTIME_HELPER_MODULES');
const actualHelpers = Array.from(helperSetMatch[1].matchAll(/['"]([^'"]+)['"]/g)).map((match) => match[1]).sort();
const expectedHelpers = requiredBridgeModules.slice().sort();
if (JSON.stringify(actualHelpers) !== JSON.stringify(expectedHelpers)) {
  throw new Error(`CLASSIC_RUNTIME_HELPER_MODULES mismatch: expected ${expectedHelpers.join(',')} got ${actualHelpers.join(',')}`);
}

if (JSON.stringify((policy.classicRuntimeHelperModules || []).slice().sort()) !== JSON.stringify(expectedHelpers)) {
  throw new Error('policy.classicRuntimeHelperModules must match required bridge modules');
}
if (JSON.stringify((bridgeMap.requiredBridgeModules || []).slice().sort()) !== JSON.stringify(expectedHelpers)) {
  throw new Error('bridge-map requiredBridgeModules must match required bridge modules');
}
if (!inventory.includes('## Bridge Budget') || !inventory.includes('471126') || !inventory.includes('allowedReviewed')) {
  throw new Error('legacy bridge inventory must document the active budget');
}
if (!/GG\.offlineFallbackBridge/.test(legacy) || !/GG\.popularRelatedBridge/.test(legacy)) {
  throw new Error('legacy-app must still consume extracted bridge globals');
}

console.log(JSON.stringify({
  ok: true,
  check: 'task002n-g-acceptance',
  legacyApp: {
    bytes: legacyStat.size,
    lines: legacyLines
  },
  publicDomBudget: {
    createElement: budget.createElement,
    allowedReviewed: budget.allowedReviewed,
    needsTemplate: budget.needsTemplate,
    unclassified: budget.unclassified
  },
  bridgeModules: requiredBridgeModules
}, null, 2));
NODE
