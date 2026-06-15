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

const helperPath = 'src/modules/template-hydration/template-hydration.js';
const legacyPath = 'src/modules/legacy-app/legacy-app.js';

if (!(await exists(helperPath))) throw new Error(`${helperPath} must exist`);
if (!(await exists('src/modules/template-hydration/template-hydration.contract.json'))) {
  throw new Error('template-hydration contract must exist');
}
if (!(await exists(legacyPath))) throw new Error(`${legacyPath} must exist`);
if (!(await exists('legacy-donor'))) throw new Error('legacy-donor/ must still exist');

const helper = await readFile(helperPath, 'utf8');
const legacy = await readFile(legacyPath, 'utf8');
const registry = JSON.parse(await readFile('registry/modules.json', 'utf8'));
const bridgeMap = JSON.parse(await readFile('src/modules/legacy-app/bridge-map.json', 'utf8'));
const policy = JSON.parse(await readFile('config/legacy-app-bridge-policy.json', 'utf8'));

if (!/export\s+function\s+cloneTemplateElement\b/.test(helper)) {
  throw new Error('template-hydration must export cloneTemplateElement');
}
if (!/export\s+function\s+getTemplateElement\b/.test(helper)) {
  throw new Error('template-hydration must export getTemplateElement');
}
if (/function\s+cloneTemplateElement\b/.test(legacy)) {
  throw new Error('legacy-app.js must not contain inline function cloneTemplateElement');
}
if (!/GG\.templateHydration|templateHydration\.cloneTemplateElement/.test(legacy)) {
  throw new Error('legacy-app.js must use the template hydration helper seam');
}
if (registry.bundleOrder[0] !== 'template-hydration') {
  throw new Error('template-hydration must be bundled before legacy-app');
}
if (!registry.modules?.['template-hydration']) {
  throw new Error('registry.modules.template-hydration is missing');
}
if (!Array.isArray(bridgeMap.extractedSeams) || !bridgeMap.extractedSeams.some((entry) => entry.id === 'template-dom-hydration')) {
  throw new Error('bridge map must document extracted template-dom-hydration seam');
}
if (!Array.isArray(policy.extractedSeams) || !policy.extractedSeams.some((entry) => entry.id === 'template-dom-hydration')) {
  throw new Error('bridge policy must document extracted template-dom-hydration seam');
}

const bundle = await readFile('dist/prod/assets/gg-app.min.js', 'utf8');
if (/\bexport\s+function\s+cloneTemplateElement\b/.test(bundle)) {
  throw new Error('generated browser bundle must not contain ESM export syntax');
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
  check: 'task002n-b-acceptance',
  helper: helperPath,
  exports: ['getTemplateElement', 'cloneTemplateElement'],
  legacyUsesTemplateHydration: true,
  inlineCloneTemplateElementRemoved: true,
  genericTemplatesCreated: false
}, null, 2));
NODE
