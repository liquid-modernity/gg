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

const modulePath = 'src/modules/popular-related-bridge/popular-related-bridge.js';
const contractPath = 'src/modules/popular-related-bridge/popular-related-bridge.contract.json';
const legacyPath = 'src/modules/legacy-app/legacy-app.js';
const registryPath = 'registry/modules.json';
const buildPath = 'tools/build.mjs';
const bridgeMapPath = 'src/modules/legacy-app/bridge-map.json';
const policyPath = 'config/legacy-app-bridge-policy.json';

for (const path of [modulePath, contractPath, legacyPath, registryPath, buildPath, bridgeMapPath, policyPath]) {
  if (!(await exists(path))) throw new Error(`${path} must exist`);
}
if (!(await exists('legacy-donor'))) throw new Error('legacy-donor/ must still exist');
if (!(await exists('src/modules/legacy-app'))) throw new Error('src/modules/legacy-app/ must still exist');

const moduleSource = await readFile(modulePath, 'utf8');
const legacy = await readFile(legacyPath, 'utf8');
const registry = JSON.parse(await readFile(registryPath, 'utf8'));
const build = await readFile(buildPath, 'utf8');
const bridgeMap = JSON.parse(await readFile(bridgeMapPath, 'utf8'));
const policy = JSON.parse(await readFile(policyPath, 'utf8'));
const contract = JSON.parse(await readFile(contractPath, 'utf8'));

const expectedExports = [
  'normalizePopularRange',
  'getPopularRangeFromHash',
  'getPopularRangeHref',
  'getPopularRangeLabel',
  'getRelatedDateScore',
  'normalizeRelatedPost',
  'getRelatedPageState',
  'getRelatedDotState'
];

if (contract.id !== 'popular-related-bridge' || contract.type !== 'runtime-helper') {
  throw new Error('popular-related-bridge contract must identify a runtime-helper module');
}
if (registry.modules?.['popular-related-bridge']?.js !== modulePath) {
  throw new Error('registry must include popular-related-bridge module');
}
if (registry.bundleOrder.indexOf('popular-related-bridge') === -1) {
  throw new Error('bundleOrder must include popular-related-bridge');
}
if (registry.bundleOrder.indexOf('popular-related-bridge') > registry.bundleOrder.indexOf('legacy-app')) {
  throw new Error('popular-related-bridge must bundle before legacy-app');
}
if (!build.includes('popular-related-bridge')) {
  throw new Error('tools/build.mjs must include popular-related-bridge in classic helper handling');
}
if (!/GG\.popularRelatedBridge/.test(legacy)) {
  throw new Error('legacy-app must consume GG.popularRelatedBridge');
}
if (/^\s*import\s+.*popular-related-bridge/m.test(legacy)) {
  throw new Error('legacy-app must not use a static ESM import for popular-related-bridge');
}
if (/document\.createElement/.test(moduleSource) || /innerHTML|insertAdjacentHTML|outerHTML/.test(moduleSource)) {
  throw new Error('popular-related-bridge must not generate visible DOM or HTML');
}

for (const name of expectedExports) {
  if (!new RegExp(`export function ${name}\\b`).test(moduleSource)) {
    throw new Error(`${modulePath} missing export ${name}`);
  }
  if (!new RegExp(`GG\\.popularRelatedBridge\\.${name}\\s*=`).test(moduleSource)) {
    throw new Error(`${modulePath} must attach ${name} to GG.popularRelatedBridge`);
  }
}

for (const call of [
  'popularRelatedBridge.getPopularRangeFromHash',
  'popularRelatedBridge.getPopularRangeHref',
  'popularRelatedBridge.getPopularRangeLabel',
  'popularRelatedBridge.getRelatedDateScore',
  'popularRelatedBridge.normalizeRelatedPost',
  'popularRelatedBridge.getRelatedPageState',
  'popularRelatedBridge.getRelatedDotState'
]) {
  if (!legacy.includes(call)) throw new Error(`legacy-app must call ${call}`);
}

const seam = bridgeMap.extractedSeams?.find((item) => item.id === 'popular-related-state');
if (!seam || seam.modulePath !== modulePath) {
  throw new Error('bridge-map must record popular-related-state extracted seam');
}
const policySeam = policy.extractedSeams?.find((item) => item.id === 'popular-related-state');
if (!policySeam || policySeam.modulePath !== modulePath) {
  throw new Error('legacy bridge policy must record popular-related-state extracted seam');
}

console.log(JSON.stringify({
  ok: true,
  check: 'task002n-e-acceptance',
  module: modulePath,
  exports: expectedExports,
  classicBundleBeforeLegacyApp: true,
  publicDomTemplateDebt: 'guarded-by-check:public-dom',
  legacyBridge: 'guarded-by-check:legacy-bridge'
}, null, 2));
NODE
