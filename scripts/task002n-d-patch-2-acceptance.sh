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
  nativeRowsMarkedBeforeModeHide: true,
  hideNativeRowsWhenSavedActive: true,
  savedRowsOccupyActiveListingSurface: true,
  hideLoadMoreWhenSavedActive: true,
  hidePaginationWhenSavedActive: true,
  savedRowsUseCanonicalListingTemplate: true,
  rawDetailsTextVisible: false,
  unsaveRefreshesSavedListing: true
})) {
  if (contract[key] !== expected) throw new Error(`contract ${key} must be ${expected}`);
}

if (contract.listingModeAttributeWhenSavedActive !== 'saved') {
  throw new Error('contract must record data-gg-listing-mode=saved for saved mode');
}
if (contract.visibleModeLabelWhenSavedActive !== 'Saved') {
  throw new Error('contract must record visible Saved mode label');
}

if (!/function markNativeListingRows\(\)/.test(legacy)) {
  throw new Error('legacy-app must mark native listing rows before hiding them');
}
if (!/data-gg-native-row/.test(legacy) || !/LISTING_NATIVE_ROW_SELECTOR = '\[data-gg-native-row="true"\]'/.test(legacy)) {
  throw new Error('native row hiding must use explicit data-gg-native-row markers');
}
if (!/function syncListingModeLabel\(mode\)/.test(legacy)) {
  throw new Error('legacy-app must synchronize the visible listing mode label');
}
if (!/mode = active \? 'saved' : \(state\.popularListingActive \? 'popular' : 'latest'\)/.test(legacy)) {
  throw new Error('setSavedListingMode must compute saved/popular/latest listing mode');
}
if (!/ui\.listing\.setAttribute\('data-gg-listing-mode', mode\)/.test(legacy)) {
  throw new Error('listing root must receive the active listing mode attribute');
}
if (!/syncListingModeLabel\(mode\)/.test(legacy)) {
  throw new Error('active listing mode must update toolbar label');
}
if (!/setListingAuxiliaryHidden\(\!\!active \|\| \!\!state\.popularListingActive\)/.test(legacy)) {
  throw new Error('saved mode must hide load-more and pagination together');
}
if (!/setNativeListingRowsHidden\(state\.savedListingActive \|\| state\.popularListingActive\)/.test(legacy)) {
  throw new Error('saved render must hide native rows while saved mode is active');
}
if (!/createListingRow\(items\[i\]/.test(legacy) || !/markerName: 'data-gg-saved-row'/.test(legacy)) {
  throw new Error('saved rows must use canonical listing row template creation');
}
if (!/iconOnlyAction: true/.test(legacy) || !/actionLabel\.classList\.add\('gg-visually-hidden'\)/.test(legacy)) {
  throw new Error('saved rows must hide raw Details text visually');
}
if (!/cloneTemplateElement\('gg-empty-state-saved-articles'\)/.test(legacy)) {
  throw new Error('saved empty state must come from template clone');
}
if (!/toggleSaveArticle\(trigger\)[\s\S]*renderSavedListing\(\);/.test(legacy)) {
  throw new Error('unsave/save path must refresh saved listing immediately');
}

for (const id of [
  'gg-template-row',
  'gg-template-link',
  'gg-template-button',
  'gg-template-element',
  'gg-template-generic'
]) {
  const pattern = new RegExp(`\\bid\\s*=\\s*(['"])${id}\\1`);
  if (pattern.test(blog)) throw new Error(`forbidden generic template id found: ${id}`);
}

console.log(JSON.stringify({
  ok: true,
  check: 'task002n-d-patch-2-acceptance',
  contract: contractPath,
  savedModeExclusive: true,
  nativeRowsMarkedBeforeModeHide: true,
  listingModeAttributeWhenSavedActive: 'saved',
  visibleModeLabelWhenSavedActive: 'Saved',
  hideLoadMoreWhenSavedActive: true,
  hidePaginationWhenSavedActive: true,
  rawDetailsTextVisible: false
}, null, 2));
NODE
