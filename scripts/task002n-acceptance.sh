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

const requiredFiles = [
  'config/legacy-app-bridge-policy.json',
  'docs/legacy-app-bridge-inventory.md',
  'checks/legacy-bridge.check.mjs',
  'src/modules/legacy-app/README.md',
  'src/modules/legacy-app/bridge-map.json',
  'scripts/task002n-acceptance.sh'
];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

for (const file of requiredFiles) {
  if (!(await exists(file))) throw new Error(`missing required artifact: ${file}`);
}
if (!(await exists('legacy-donor'))) throw new Error('legacy-donor/ must still exist');
if (!(await exists('src/modules/legacy-app/legacy-app.js'))) throw new Error('legacy-app.js must still exist');

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (pkg.scripts?.['check:legacy-bridge'] !== 'node checks/legacy-bridge.check.mjs') {
  throw new Error('package.json missing check:legacy-bridge script');
}

const policy = JSON.parse(await readFile('config/legacy-app-bridge-policy.json', 'utf8'));
if (policy.status !== 'active-bridge') throw new Error('legacy bridge policy status mismatch');
if (policy.doNotDeleteYet !== true) throw new Error('legacy bridge policy must keep doNotDeleteYet=true');
if (!Array.isArray(policy.extractionBuckets) || policy.extractionBuckets.length < 8) {
  throw new Error('legacy bridge policy must include extraction buckets');
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
  check: 'task002n-acceptance',
  buckets: policy.extractionBuckets.length,
  legacyBridgeCheck: pkg.scripts['check:legacy-bridge'],
  legacyDonorExists: true,
  legacyAppExists: true,
  genericTemplatesCreated: false
}, null, 2));
NODE
