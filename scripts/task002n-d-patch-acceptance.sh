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

const contractPath = 'config/saved-listing-presentation-contract.json';
const legacyPath = 'src/modules/legacy-app/legacy-app.js';
const blogPath = 'apps/blog/index.xml';

if (!(await exists(contractPath))) throw new Error(`${contractPath} must exist`);
if (!(await exists(legacyPath))) throw new Error(`${legacyPath} must exist`);
if (!(await exists('src/modules/legacy-app'))) throw new Error('src/modules/legacy-app/ must still exist');
if (!(await exists('legacy-donor'))) throw new Error('legacy-donor/ must still exist');

const contract = JSON.parse(await readFile(contractPath, 'utf8'));
const legacy = await readFile(legacyPath, 'utf8');
const blog = await readFile(blogPath, 'utf8');

for (const [key, expected] of Object.entries({
  savedModeExclusive: true,
  hideNativeRowsWhenSavedActive: true,
  hideLoadMoreWhenSavedActive: true,
  savedRowsUseCanonicalListingTemplate: true,
  rawDetailsTextVisible: false,
  unsaveRefreshesSavedListing: true
})) {
  if (contract[key] !== expected) throw new Error(`contract ${key} must be ${expected}`);
}

if (!/function renderSavedListing\(\)/.test(legacy)) throw new Error('renderSavedListing must remain in legacy-app');
if (!/setNativeListingRowsHidden\(state\.savedListingActive \|\| state\.popularListingActive\)/.test(legacy)) {
  throw new Error('saved render must hide native rows while saved mode is active');
}
if (!/LISTING_NATIVE_ROW_SELECTOR/.test(legacy) || !/:not\(\[data-gg-saved-row\]\)/.test(legacy)) {
  throw new Error('native row hiding must exclude dynamic saved rows');
}
if (!/setListingAuxiliaryHidden\(true\)/.test(legacy)) {
  throw new Error('saved mode must hide load-more/pagination auxiliary listing UI');
}
if (!/listingPagination: document\.getElementById\('gg-listing-pagination'\)/.test(legacy)) {
  throw new Error('listing pagination must be addressable by saved mode');
}
if (!/iconOnlyAction: true/.test(legacy)) {
  throw new Error('saved rows must request icon-only detail action presentation');
}
if (!/actionLabel\.classList\.add\('gg-visually-hidden'\)/.test(legacy)) {
  throw new Error('saved row Details label must be visually hidden');
}
if (!/cloneTemplateElement\('gg-empty-state-saved-articles'\)/.test(legacy)) {
  throw new Error('saved empty state must come from template clone');
}
if (!/createListingRow\(items\[i\]/.test(legacy) || !/markerName: 'data-gg-saved-row'/.test(legacy)) {
  throw new Error('saved rows must use canonical listing row creation');
}
if (!/renderSavedListing\(\);/.test(legacy)) {
  throw new Error('save toggle path must refresh saved listing');
}

for (const id of contract.forbiddenGenericTemplates || []) {
  const pattern = new RegExp(`\\bid\\s*=\\s*(['"])${id}\\1`);
  if (pattern.test(blog)) throw new Error(`forbidden generic template id found: ${id}`);
}

console.log(JSON.stringify({
  ok: true,
  check: 'task002n-d-patch-acceptance',
  contract: contractPath,
  savedModeExclusive: true,
  hideNativeRowsWhenSavedActive: true,
  hideLoadMoreWhenSavedActive: true,
  hidePaginationWhenSavedActive: true,
  savedRowsUseCanonicalListingTemplate: true,
  rawDetailsTextVisible: false,
  unsaveRefreshesSavedListing: true
}, null, 2));
NODE
