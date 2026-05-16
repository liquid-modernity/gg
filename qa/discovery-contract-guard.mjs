#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const REGISTRY_URL = pathToFileURL(path.join(ROOT, 'src/registry/gg-system-registry.js'));
const { GG_DISCOVERY, GG_DOCK, GG_MORE_SHEET } = await import(REGISTRY_URL.href);

const REQUIRED_COPY_KEYS = [
  'discovery.title',
  'discovery.store.title',
  'discovery.global.placeholder',
  'discovery.store.placeholder',
  'discovery.filter.all',
  'discovery.filter.articles',
  'discovery.filter.topics',
  'discovery.filter.routes',
  'discovery.filter.sections',
  'discovery.filter.actions',
  'discovery.filter.products',
  'discovery.filter.categories',
  'discovery.type.article',
  'discovery.type.topic',
  'discovery.type.route',
  'discovery.type.section',
  'discovery.type.action',
  'discovery.type.product',
  'discovery.type.category',
  'discovery.empty.title',
  'discovery.empty.body'
];

function read(file) {
  return readFileSync(path.join(ROOT, file), 'utf8');
}

function parseJson(file) {
  return JSON.parse(read(file));
}

function assertSameArray(label, actual, expected, issues) {
  if (!Array.isArray(actual) || actual.join('|') !== expected.join('|')) {
    issues.push(`${label} expected ${expected.join(' | ')} got ${Array.isArray(actual) ? actual.join(' | ') : '(not-array)'}`);
  }
}

function assertCopyKeys(label, copy, issues) {
  for (const key of REQUIRED_COPY_KEYS) {
    if (!(key in copy)) issues.push(`${label} missing ${key}`);
  }
}

function assertIncludesAll(label, actual, expected, issues) {
  const values = Array.isArray(actual) ? actual : [];
  for (const item of expected) {
    if (!values.includes(item)) issues.push(`${label} missing ${item}`);
  }
}

function assertContains(file, text, marker, issues) {
  if (!text.includes(marker)) issues.push(`${file} missing ${marker}`);
}

function assertAttr(file, text, name, value, issues) {
  const pattern = new RegExp(`${name}=(['"])${value}\\1`);
  if (!pattern.test(text)) issues.push(`${file} missing ${name}=${JSON.stringify(value)}`);
}

function assertOrder(label, text, first, second, issues) {
  const firstIndex = text.indexOf(first);
  const secondIndex = text.indexOf(second);
  if (firstIndex === -1 || secondIndex === -1 || firstIndex > secondIndex) {
    issues.push(`${label} expected ${first} before ${second}`);
  }
}

function assertNaturalCopy(label, copy, issues) {
  if (copy['discovery.title'] !== 'Jelajah') issues.push(`${label} discovery.title must be Jelajah`);
  if (copy['discovery.store.title'] !== 'Jelajah Store') issues.push(`${label} discovery.store.title must be Jelajah Store`);
  if (copy['discovery.filter.sections'] !== 'Bagian') issues.push(`${label} discovery.filter.sections must be Bagian`);
  if (copy['discovery.global.placeholder'] !== 'Cari artikel, topik, rute, bagian, atau aksi') issues.push(`${label} discovery.global.placeholder is not natural Indonesian`);
  if (copy['discovery.store.placeholder'] !== 'Cari produk, kategori, atau rute Store') issues.push(`${label} discovery.store.placeholder is not natural Indonesian`);
  if (copy['discovery.empty.title'] !== 'Tidak ada hasil') issues.push(`${label} discovery.empty.title must be Tidak ada hasil`);
  if (copy['discovery.empty.body'] !== 'Coba kata kunci lain.') issues.push(`${label} discovery.empty.body must be Coba kata kunci lain.`);
}

function main() {
  const issues = [];
  const rootEn = parseJson('registry/copy/gg-copy-en.json');
  const rootId = parseJson('registry/copy/gg-copy-id.json');
  const appRuntime = read('src/js/gg-app.source.js');
  const storeRuntime = read('src/store/store-discovery.js');
  const landingHtml = read('landing.html');
  const indexXml = read('index.xml');
  const storeHtml = read('store.html');
  const appCss = read('src/css/gg-app.source.css');
  const storeCss = read('src/store/store.css');

  assertSameArray('GG_DISCOVERY.global.surfaces', GG_DISCOVERY.global.surfaces, ['landing', 'blog', 'detail', 'page'], issues);
  assertSameArray('GG_DISCOVERY.store.surfaces', GG_DISCOVERY.store.surfaces, ['store'], issues);
  assertSameArray('GG_DISCOVERY.global.filters', GG_DISCOVERY.global.filters, ['all', 'articles', 'topics', 'routes', 'sections', 'actions'], issues);
  assertSameArray('GG_DISCOVERY.store.filters', GG_DISCOVERY.store.filters, ['all', 'products', 'categories', 'routes'], issues);
  assertSameArray('GG_DISCOVERY.global.itemTypes', GG_DISCOVERY.global.itemTypes, ['article', 'topic', 'route', 'section', 'action'], issues);
  assertSameArray('GG_DISCOVERY.store.itemTypes', GG_DISCOVERY.store.itemTypes, ['product', 'category', 'route', 'action'], issues);
  assertIncludesAll('GG_DISCOVERY.global.sources', GG_DISCOVERY.global.sources, ['articles', 'topics', 'routes', 'landingSections', 'actions'], issues);
  assertIncludesAll('GG_DISCOVERY.store.sources', GG_DISCOVERY.store.sources, ['products', 'categories', 'storeRoutes'], issues);
  if (GG_DISCOVERY.global.commandPlacement !== 'bottom') issues.push(`global commandPlacement expected bottom got ${GG_DISCOVERY.global.commandPlacement || '(missing)'}`);
  if (GG_DISCOVERY.store.commandPlacement !== 'bottom') issues.push(`store commandPlacement expected bottom got ${GG_DISCOVERY.store.commandPlacement || '(missing)'}`);
  if (GG_DISCOVERY.global.indexId !== 'global-discovery-v1') issues.push('global indexId must be global-discovery-v1');
  if (GG_DISCOVERY.store.indexId !== 'store-discovery-v1') issues.push('store indexId must be store-discovery-v1');

  if (GG_DOCK.surfaces.store.actions.search !== 'openStoreDiscovery') {
    issues.push(`store search action expected openStoreDiscovery got ${GG_DOCK.surfaces.store.actions.search || '(missing)'}`);
  }
  for (const surface of ['landing', 'blog', 'detail', 'page']) {
    if (GG_DOCK.surfaces[surface].actions.search !== 'openGlobalDiscovery') {
      issues.push(`${surface} search action expected openGlobalDiscovery got ${GG_DOCK.surfaces[surface].actions.search || '(missing)'}`);
    }
  }

  assertCopyKeys('registry EN', rootEn, issues);
  assertCopyKeys('registry ID', rootId, issues);
  assertNaturalCopy('registry ID', rootId, issues);

  if (!appRuntime.includes('launchDiscovery')) issues.push('global runtime discovery launcher is missing');
  if (!storeRuntime.includes('function openDiscovery')) issues.push('store runtime discovery launcher is missing');
  for (const adapter of ['globalArticlesAdapter', 'globalTopicsAdapter', 'globalRoutesAdapter', 'globalLandingSectionsAdapter', 'globalActionsAdapter']) {
    if (!appRuntime.includes(`function ${adapter}`) && !landingHtml.includes(`function ${adapter}`)) {
      issues.push(`global adapter missing: ${adapter}`);
    }
  }
  for (const adapter of ['storeProductsAdapter', 'storeCategoriesAdapter', 'storeRoutesAdapter', 'storeActionsAdapter']) {
    if (!storeRuntime.includes(`function ${adapter}`)) issues.push(`store adapter missing: ${adapter}`);
  }
  if (!appRuntime.includes('function createGlobalDiscoveryItem')) issues.push('global normalized discovery item model is missing');
  if (!storeRuntime.includes('function normalizeStoreDiscoveryItem')) issues.push('store normalized discovery item model is missing');
  if (!appRuntime.includes('function resolveGlobalDiscoveryAction')) issues.push('global route-aware discovery resolver is missing');
  if (!appRuntime.includes('function getFeedJsonUrl') || !landingHtml.includes('/feeds/posts/default?alt=json')) {
    issues.push('/ and /landing must use the same Blogger post feed source for Global Discovery articles/topics');
  }

  if (!appRuntime.includes("ui.shell.setAttribute('data-gg-feed-source', state.discoveryIndex.posts.length ? 'listing-dom-local' : 'static-global-base')")) {
    issues.push('root Global Discovery must set static-global-base when listing rows are absent');
  }
  if (!appRuntime.includes('requestCommandFeedEnhancement(!state.discoveryIndex.posts.length);')) {
    issues.push('root Global Discovery must enhance feed asynchronously after static base render');
  }
  if (/return\s+requestCommandFeedEnhancement\(true\);/.test(appRuntime)) {
    issues.push('root Global Discovery must not wait for feed before rendering static base results');
  }

  for (const [file, text, resultsMarker] of [['landing.html', landingHtml, 'gg-command-results'], ['index.xml', indexXml, 'gg-discovery-results']]) {
    assertAttr(file, text, 'data-gg-discovery-domain', 'global', issues);
    assertAttr(file, text, 'data-gg-discovery-index', 'global-discovery-v1', issues);
    assertAttr(file, text, 'data-gg-discovery-command-placement', 'bottom', issues);
    assertAttr(file, text, 'data-gg-discovery-command', 'bottom', issues);
    assertOrder(`${file} bottom command shell`, text, resultsMarker, 'data-gg-discovery-command=', issues);
    for (const filter of ['all', 'articles', 'topics', 'routes', 'sections', 'actions']) {
      if (!text.includes(`discovery.filter.${filter}`)) issues.push(`${file} missing global discovery filter ${filter}`);
    }
  }

  assertAttr('store.html', storeHtml, 'data-gg-discovery-domain', 'store', issues);
  assertAttr('store.html', storeHtml, 'data-gg-discovery-index', 'store-discovery-v1', issues);
  assertAttr('store.html', storeHtml, 'data-gg-discovery-command-placement', 'bottom', issues);
  assertAttr('store.html', storeHtml, 'data-gg-discovery-command', 'bottom', issues);
  for (const kind of ['all', 'products', 'categories', 'routes']) {
    assertContains('store.html', storeHtml, `data-store-discovery-kind="${kind}"`, issues);
  }
  if (storeHtml.includes('data-store-discovery-kind="sections"')) issues.push('store discovery must not expose landing sections as a store kind');
  assertOrder('store.html bottom command shell', storeHtml, 'store-discovery-results', 'data-gg-discovery-command=', issues);

  if (!appCss.includes('position: sticky') || !appCss.includes('bottom: 0') || !appCss.includes('100dvh') || !appCss.includes('env(safe-area-inset-bottom)')) {
    issues.push('global discovery CSS must include sticky bottom, 100dvh, and safe-area behavior');
  }
  if (!storeCss.includes('position: sticky') || !storeCss.includes('bottom: 0') || !storeCss.includes('92dvh') || !storeCss.includes('env(safe-area-inset-bottom)')) {
    issues.push('store discovery CSS must include sticky bottom, dvh max-height, and safe-area behavior');
  }

  if (landingHtml.includes('Search PakRPP home') || landingHtml.includes('Search sections, routes, and actions')) {
    issues.push('landing.html still exposes the old landing-only top-search discovery copy');
  }
  if (landingHtml.includes('data-copy="command.title"') || indexXml.includes("data-gg-copy='command.title'")) {
    issues.push('global discovery title must bind to discovery.title, not command.title');
  }
  if (/data-(?:gg-)?copy=['"]nav\.landing['"][^>]*>\s*Landing\s*</i.test(landingHtml + indexXml + storeHtml)) {
    issues.push('public Landing label is exposed in nav/discovery markup');
  }

  if (!GG_MORE_SHEET.sections || GG_MORE_SHEET.sections.map((section) => section.id).join('|') !== 'navigation|discover|info|language|appearance') {
    issues.push('More sheet registry sections changed unexpectedly');
  }

  if (issues.length) {
    console.error('DISCOVERY CONTRACT GUARD RESULT: FAIL');
    issues.forEach((issue, index) => console.error(`${index + 1}. ${issue}`));
    process.exit(1);
  }

  console.log('DISCOVERY CONTRACT GUARD RESULT: PASS');
}

main();
