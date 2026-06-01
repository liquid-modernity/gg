#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(file) {
  return readFileSync(path.join(ROOT, file), 'utf8');
}

function blockBetween(text, start, end) {
  const startIndex = text.indexOf(start);
  if (startIndex === -1) return '';
  const endIndex = text.indexOf(end, startIndex + start.length);
  return endIndex === -1 ? text.slice(startIndex) : text.slice(startIndex, endIndex);
}

function assertIncludes(label, text, marker, issues) {
  if (!text.includes(marker)) issues.push(`${label} missing ${marker}`);
}

function assertJsAppendGuard(label, text, issues) {
  const appendMatch = text.match(/function appendListingRows\([^)]*\)\s*\{[\s\S]*?\n\s*function finishListingGrowthState/);
  const appendBlock = appendMatch ? appendMatch[0] : '';

  if (!appendBlock) {
    issues.push(`${label} missing appendListingRows block`);
    return;
  }

  assertIncludes(`${label} appendListingRows`, appendBlock, "getAttribute('data-gg-content-domain')", issues);
  assertIncludes(`${label} appendListingRows`, appendBlock, 'state.surfaceContext && state.surfaceContext.isRootListing', issues);
  assertIncludes(`${label} appendListingRows`, appendBlock, "domain === 'store'", issues);
  assertIncludes(`${label} appendListingRows`, appendBlock, 'continue;', issues);
  assertIncludes(`${label} appendListingRows`, appendBlock, 'storeRowsSkippedFromRoot', issues);

  if (appendBlock.indexOf("domain === 'store'") > appendBlock.indexOf('fragment.appendChild(imported)')) {
    issues.push(`${label} checks Store domain after append; guard must run before DOM insertion`);
  }
}

function main() {
  const issues = [];
  const packageJson = JSON.parse(read('package.json'));
  const indexXml = read('index.xml');
  const appRuntime = read('src/js/gg-app.source.js');
  const landingHtml = read('landing.html');
  const storeRuntime = read('src/store/store-discovery.js');
  const storeHtml = read('store.html');

  if (packageJson.scripts?.['gaga:verify-store-isolation'] !== 'node qa/store-isolation-guard.mjs') {
    issues.push('package.json missing gaga:verify-store-isolation alias');
  }

  const rootLoop = blockBetween(indexXml, "<b:includable id='main'>", "<section aria-live='polite'");
  const postRow = blockBetween(indexXml, "<b:includable id='postRow' var='post'>", "</b:includable>");
  if (!rootLoop.includes('data:view.isLabelSearch or not') && !rootLoop.includes('data:view.isHomepage')) {
    issues.push('root listing loop missing listing-scoped Store isolation condition');
  }
  assertIncludes('root listing loop', rootLoop, 'data:post.labels any', issues);
  assertIncludes('root listing row', postRow, 'data-gg-content-domain', issues);
  assertIncludes('root listing row', postRow, '&quot;store&quot; : &quot;blog&quot;', issues);
  for (const label of ['Store', 'Store Fashion', 'Store Skincare', 'Store Workspace', 'Store Tech', 'Store Everyday', 'Store Etc', 'Store Lainnya']) {
    assertIncludes('root listing loop', rootLoop, label, issues);
  }
  assertIncludes('root listing loop', rootLoop, 'Store:', issues);
  assertIncludes('root listing loop', rootLoop, 'Store/', issues);
  assertIncludes('root listing loop', rootLoop, 'gg-store-data', issues);
  assertIncludes('root listing loop', rootLoop, 'gg-yellowcard-data', issues);
  if (/\.gg-entry-row[^{]*\{[^}]*display\s*:\s*none/i.test(indexXml)) {
    issues.push('root listing Store isolation must not rely on hiding .gg-entry-row with CSS');
  }

  const postDetail = blockBetween(indexXml, "<b:includable id='postDetail' var='post'>", "<b:includable id='postJumpLink'");
  if (/isStore(Content|Label|ChildLabel)|gg-store-data|gg-yellowcard-data|Store Fashion/.test(postDetail)) {
    issues.push('Blog1 detail branch contains Store isolation logic; filtering must stay listing-only');
  }
  if (indexXml.includes('&quot;@type&quot;: &quot;ItemList&quot;') && !indexXml.includes('gg-store-data')) {
    issues.push('root ItemList/schema exists but has no Store isolation marker');
  }

  for (const [label, text] of [['src/js/gg-app.source.js', appRuntime], ['landing.html', landingHtml]]) {
    assertIncludes(label, text, 'var STORE_DOMAIN', issues);
    for (const marker of [
      'rootLabel',
      'labelPrefixes',
      'categorySlugs',
      'categoryLabels',
      'payloadMarkers',
      'function isStoreContent',
      'function isStoreLabel',
      'function isStoreChildLabel',
      'function hasStoreDataPayload',
      'function getContentDomain'
    ]) {
      assertIncludes(label, text, marker, issues);
    }
    assertIncludes(label, text, 'gg-store-data', issues);
    assertIncludes(label, text, 'gg-yellowcard-data', issues);
    assertIncludes(label, text, 'isStoreContent(post)', issues);
    assertIncludes(label, text, 'isStoreDiscoveryLabel(topic.title || topic.key)', issues);
  }

  assertJsAppendGuard('src/js/gg-app.source.js', appRuntime, issues);
  assertIncludes('src/js/gg-app.source.js', appRuntime, 'storeAppendGuardEnabled', issues);
  assertIncludes('src/js/gg-app.source.js', appRuntime, 'rootListingAppendGuardActive', issues);
  assertIncludes('src/js/gg-app.source.js', appRuntime, 'storeRowsSkippedFromRoot', issues);

  assertIncludes('store.html', storeHtml, 'data-store-feed-url="/feeds/posts/default/-/Store?alt=json&max-results=50"', issues);
  assertIncludes('store.html', storeHtml, 'STORE_STATIC_GRID_START', issues);
  assertIncludes('store.html', storeHtml, 'STORE_STATIC_PRODUCTS_JSON_START', issues);
  assertIncludes('store.html', storeHtml, 'data-store-discovery-kind="products"', issues);
  assertIncludes('store.html', storeHtml, 'data-store-discovery-kind="categories"', issues);
  assertIncludes('src/store/store-discovery.js', storeRuntime, 'function storeProductsAdapter', issues);
  assertIncludes('src/store/store-discovery.js', storeRuntime, "item.domain === 'store'", issues);
  assertIncludes('src/store/store-discovery.js', storeRuntime, 'function storeCategoriesAdapter', issues);
  assertIncludes('src/store/store-discovery.js', storeRuntime, "type: 'category'", issues);

  if (/data-(?:gg-)?copy=['"]nav\.landing['"][^>]*>\s*Landing\s*</i.test(indexXml + landingHtml + storeHtml)) {
    issues.push('public Landing label is exposed in nav/discovery markup');
  }

  if (issues.length) {
    console.error('STORE ISOLATION GUARD CONTRACT_FAILURE');
    issues.forEach((issue, index) => console.error(`${index + 1}. ${issue}`));
    process.exit(1);
  }

  console.log('STORE ISOLATION GUARD RESULT: PASS');
}

main();
