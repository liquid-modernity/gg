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
  'discovery.filter.saved',
  'discovery.filter.products',
  'discovery.filter.categories',
  'discovery.type.article',
  'discovery.type.topic',
  'discovery.type.route',
  'discovery.type.section',
  'discovery.type.action',
  'discovery.type.product',
  'discovery.type.category',
  'discovery.saved.empty.title',
  'discovery.saved.empty.body',
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

function parseJsStringArray(source, property) {
  const pattern = new RegExp(`${property}\\s*:\\s*\\[([^\\]]*)\\]`);
  const match = source.match(pattern);
  if (!match) return null;
  return Array.from(match[1].matchAll(/['"]([^'"]+)['"]/g)).map((item) => item[1]);
}

function parseGlobalDiscoveryConfig(label, source, issues) {
  const feedVar = source.match(/var\s+GLOBAL_DISCOVERY_FEED_MAX\s*=\s*(\d+)\s*;/);
  const feedInline = source.match(/feedMax\s*:\s*(\d+)/);
  const feedMax = feedVar ? Number(feedVar[1]) : (feedInline ? Number(feedInline[1]) : NaN);
  const config = {
    feedMax,
    filterIds: parseJsStringArray(source, 'filterIds'),
    routeIds: parseJsStringArray(source, 'routeIds'),
    sectionIds: parseJsStringArray(source, 'sectionIds'),
    actionIds: parseJsStringArray(source, 'actionIds')
  };

  for (const key of ['filterIds', 'routeIds', 'sectionIds', 'actionIds']) {
    if (!Array.isArray(config[key])) issues.push(`${label} GG_GLOBAL_DISCOVERY_CONFIG missing ${key}`);
  }
  if (config.feedMax !== 80) issues.push(`${label} Global Discovery feedMax expected 80 got ${Number.isFinite(config.feedMax) ? config.feedMax : '(missing)'}`);
  return config;
}

function assertSameConfigArray(key, leftLabel, left, rightLabel, right, issues) {
  if (!Array.isArray(left?.[key]) || !Array.isArray(right?.[key])) return;
  if (left[key].join('|') !== right[key].join('|')) {
    issues.push(`${leftLabel}.${key} differs from ${rightLabel}.${key}: ${left[key].join(' | ')} !== ${right[key].join(' | ')}`);
  }
}

function assertStaticBaseIds(label, config, issues) {
  const routeIds = config.routeIds || [];
  const sectionIds = config.sectionIds || [];
  const actionIds = config.actionIds || [];
  for (const id of ['home', 'blog', 'store', 'contact']) {
    if (!routeIds.includes(id)) issues.push(`${label} missing required route:${id}`);
  }
  for (const id of sectionIds) {
    if (!id) issues.push(`${label} has empty section id`);
  }
  for (const id of ['contactPakrpp', 'openMore', 'openStore', 'openBlog']) {
    if (!actionIds.includes(id)) issues.push(`${label} missing required action:${id}`);
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
  if (copy['discovery.filter.saved'] !== 'Tersimpan') issues.push(`${label} discovery.filter.saved must be Tersimpan`);
  if (copy['discovery.global.placeholder'] !== 'Cari artikel, topik, rute, bagian, atau aksi') issues.push(`${label} discovery.global.placeholder is not natural Indonesian`);
  if (copy['discovery.store.placeholder'] !== 'Cari produk, kategori, atau rute Store') issues.push(`${label} discovery.store.placeholder is not natural Indonesian`);
  if (copy['discovery.saved.empty.title'] !== 'Belum ada item tersimpan.') issues.push(`${label} discovery.saved.empty.title must be Belum ada item tersimpan.`);
  if (copy['discovery.saved.empty.body'] !== 'Simpan artikel atau produk untuk menemukannya di sini.') issues.push(`${label} discovery.saved.empty.body must be Simpan artikel atau produk untuk menemukannya di sini.`);
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
  const appGlobalConfig = parseGlobalDiscoveryConfig('src/js/gg-app.source.js', appRuntime, issues);
  const landingGlobalConfig = parseGlobalDiscoveryConfig('landing.html', landingHtml, issues);

  assertSameArray('GG_DISCOVERY.global.surfaces', GG_DISCOVERY.global.surfaces, ['landing', 'blog', 'detail', 'page'], issues);
  assertSameArray('GG_DISCOVERY.store.surfaces', GG_DISCOVERY.store.surfaces, ['store'], issues);
  assertSameArray('GG_DISCOVERY.global.filters', GG_DISCOVERY.global.filters, ['all', 'articles', 'topics'], issues);
  assertSameArray('GG_DISCOVERY.global.routeIds', GG_DISCOVERY.global.routeIds, ['home', 'blog', 'store', 'contact'], issues);
  assertSameArray('GG_DISCOVERY.global.sectionIds', GG_DISCOVERY.global.sectionIds, ['hero', 'rubrics', 'faq', 'contact'], issues);
  assertSameArray('GG_DISCOVERY.global.actionIds', GG_DISCOVERY.global.actionIds, ['contactPakrpp', 'openMore', 'openStore', 'openBlog'], issues);
  if (GG_DISCOVERY.global.feedMax !== 80) issues.push(`GG_DISCOVERY.global.feedMax expected 80 got ${GG_DISCOVERY.global.feedMax || '(missing)'}`);
  assertSameArray('GG_DISCOVERY.store.filters', GG_DISCOVERY.store.filters, ['all', 'products', 'categories'], issues);
  assertSameArray('GG_DISCOVERY.global.itemTypes', GG_DISCOVERY.global.itemTypes, ['article', 'topic', 'route', 'section', 'action'], issues);
  assertSameArray('GG_DISCOVERY.store.itemTypes', GG_DISCOVERY.store.itemTypes, ['product', 'category', 'route', 'action'], issues);
  assertIncludesAll('GG_DISCOVERY.global.sources', GG_DISCOVERY.global.sources, ['articles', 'topics', 'routes', 'landingSections', 'actions'], issues);
  assertIncludesAll('GG_DISCOVERY.store.sources', GG_DISCOVERY.store.sources, ['products', 'categories', 'storeRoutes'], issues);
  if (GG_DISCOVERY.global.commandPlacement !== 'bottom') issues.push(`global commandPlacement expected bottom got ${GG_DISCOVERY.global.commandPlacement || '(missing)'}`);
  if (GG_DISCOVERY.store.commandPlacement !== 'bottom') issues.push(`store commandPlacement expected bottom got ${GG_DISCOVERY.store.commandPlacement || '(missing)'}`);
  if (GG_DISCOVERY.global.indexId !== 'global-discovery-v1') issues.push('global indexId must be global-discovery-v1');
  if (GG_DISCOVERY.store.indexId !== 'store-discovery-v1') issues.push('store indexId must be store-discovery-v1');
  if (appGlobalConfig.feedMax !== landingGlobalConfig.feedMax) issues.push(`/ and /landing Global Discovery feedMax differ: ${appGlobalConfig.feedMax} !== ${landingGlobalConfig.feedMax}`);
  for (const key of ['filterIds', 'routeIds', 'sectionIds', 'actionIds']) {
    assertSameConfigArray(key, 'src/js/gg-app.source.js', appGlobalConfig, 'landing.html', landingGlobalConfig, issues);
    assertSameArray(`GG_DISCOVERY.global.${key}`, GG_DISCOVERY.global[key === 'filterIds' ? 'filters' : key], appGlobalConfig[key] || [], issues);
  }
  assertStaticBaseIds('src/js/gg-app.source.js', appGlobalConfig, issues);
  assertStaticBaseIds('landing.html', landingGlobalConfig, issues);

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
  if (/\bsearchText\s*\(/.test(appRuntime)) issues.push('global discovery runtime references undefined searchText helper');
  if (!storeRuntime.includes('function normalizeStoreDiscoveryItem')) issues.push('store normalized discovery item model is missing');
  if (!appRuntime.includes('function resolveGlobalDiscoveryAction')) issues.push('global route-aware discovery resolver is missing');
  if (!appRuntime.includes('function hasStaticGlobalDiscoveryItems')) issues.push('global discovery must expose a static base index guard for routes/sections/actions');
  if (!appRuntime.includes('static-global-base')) issues.push('root Global Discovery must mark/use static-global-base when article rows are unavailable');
  if (/return\s+requestCommandFeedEnhancement\(true\)/.test(appRuntime)) {
    issues.push('ensureDiscoveryIndex must not block first render by returning requestCommandFeedEnhancement(true)');
  }
  if (!appRuntime.includes("reason === 'command-trigger'") || !appRuntime.includes("state.discoveryTab = 'all'")) {
    issues.push('dock Search launch must reset Global Discovery to All so static base items are visible immediately');
  }
  if (!appRuntime.includes('function getFeedJsonUrl') || !landingHtml.includes('/feeds/posts/default?alt=json')) {
    issues.push('/ and /landing must use the same Blogger post feed source for Global Discovery articles/topics');
  }
  if (landingHtml.includes('max-results=24')) issues.push('/landing still uses stale max-results=24 Global Discovery feed limit');
  if (!appRuntime.includes('GG_GLOBAL_DISCOVERY_CONFIG.feedMax') || !landingHtml.includes('GG_GLOBAL_DISCOVERY_CONFIG.feedMax')) {
    issues.push('/ and /landing must derive Global Discovery feed URLs from GG_GLOBAL_DISCOVERY_CONFIG.feedMax');
  }
  if (!appRuntime.includes('function buildGlobalDiscoveryBaseItems') || !landingHtml.includes('function buildGlobalDiscoveryBaseItems')) {
    issues.push('/ and /landing must build synchronous Global Discovery base items from the shared config');
  }
  if (!appRuntime.includes('function normalizeGlobalDiscoveryItem') || !landingHtml.includes('function normalizeGlobalDiscoveryItem')) {
    issues.push('/ and /landing must use the normalized Global Discovery item model');
  }
  if (!appRuntime.includes('function isStoreDiscoveryPost') || !landingHtml.includes('function isStoreDiscoveryPost')) {
    issues.push('Global Discovery must integrate Store-domain post exclusion');
  }
  if (!appRuntime.includes('isStoreDiscoveryLabel(label)') || !landingHtml.includes('isStoreDiscoveryLabel(label)')) {
    issues.push('Global Discovery topic extraction must skip Store-domain labels');
  }
  if (/function\s+globalRoutesAdapter\s*\([^)]*\)\s*\{\s*return\s*\[/.test(landingHtml)) {
    issues.push('landing.html contains a separate hardcoded Global Discovery route array');
  }
  if (/function\s+globalLandingSectionsAdapter\s*\([^)]*\)\s*\{\s*return\s+SECTIONS\.map/.test(landingHtml)) {
    issues.push('landing.html derives Global Discovery sections from landing-only SECTIONS instead of GG_GLOBAL_DISCOVERY_CONFIG');
  }
  if (/function\s+globalActionsAdapter\s*\([^)]*\)\s*\{\s*return\s*\[/.test(landingHtml)) {
    issues.push('landing.html contains a separate hardcoded Global Discovery action array');
  }
  if (landingHtml.includes('function globalRubricsAdapter') || /staticTopics\s*=/.test(landingHtml)) {
    issues.push('landing.html still has landing-only topic/rubric Global Discovery arrays');
  }

  for (const [file, text, resultsMarker] of [['landing.html', landingHtml, 'gg-command-results'], ['index.xml', indexXml, 'gg-discovery-results']]) {
    assertAttr(file, text, 'data-gg-discovery-domain', 'global', issues);
    assertAttr(file, text, 'data-gg-discovery-index', 'global-discovery-v1', issues);
    assertAttr(file, text, 'data-gg-discovery-command-placement', 'bottom', issues);
    assertAttr(file, text, 'data-gg-discovery-command', 'bottom', issues);
    assertOrder(`${file} bottom command shell`, text, resultsMarker, 'data-gg-discovery-command=', issues);
    for (const filter of ['all', 'articles', 'topics']) {
      if (!text.includes(`discovery.filter.${filter}`)) issues.push(`${file} missing global discovery filter ${filter}`);
    }
    for (const filter of ['routes', 'sections', 'actions']) {
      if (text.includes(`data-gg-command-tab='${filter}'`) || text.includes(`data-discovery-filter="${filter}"`)) {
        issues.push(`${file} still exposes ${filter} as a primary Global Discovery filter`);
      }
    }
  }

  assertAttr('store.html', storeHtml, 'data-gg-discovery-domain', 'store', issues);
  assertAttr('store.html', storeHtml, 'data-gg-discovery-index', 'store-discovery-v1', issues);
  assertAttr('store.html', storeHtml, 'data-gg-discovery-command-placement', 'bottom', issues);
  assertAttr('store.html', storeHtml, 'data-gg-discovery-command', 'bottom', issues);
  for (const kind of ['all', 'products', 'categories']) {
    assertContains('store.html', storeHtml, `data-store-discovery-kind="${kind}"`, issues);
  }
  if (storeHtml.includes('data-store-discovery-kind="routes"')) issues.push('store discovery must not expose routes as a primary filter');
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

  const moreSections = Array.isArray(GG_MORE_SHEET.sections) ? GG_MORE_SHEET.sections : [];
  const moreSectionIds = moreSections.map((section) => section && section.id).filter(Boolean);
  const expectedMoreSectionIds = ['navigation', 'discover', 'info', 'preferences'];
  assertSameArray('GG_MORE_SHEET.sections', moreSectionIds, expectedMoreSectionIds, issues);

  const moreProfile = GG_MORE_SHEET.profile || {};
  if (moreProfile.nameKey !== 'more.profile.name') issues.push('More sheet profile nameKey must be more.profile.name');
  if (moreProfile.metaKey !== 'more.profile.meta') issues.push('More sheet profile metaKey must be more.profile.meta');
  if (moreProfile.href !== '/p/about.html') issues.push(`More sheet profile href expected /p/about.html got ${moreProfile.href || '(missing)'}`);

  const preferencesSection = moreSections.find((section) => section && section.id === 'preferences') || {};
  assertSameArray('GG_MORE_SHEET.preferences.items', preferencesSection.items, ['language', 'appearance', 'reading', 'motion'], issues);
  if (preferencesSection.layout !== 'rows') issues.push(`More sheet preferences layout expected rows got ${preferencesSection.layout || '(missing)'}`);

  const localSearch = GG_MORE_SHEET.localSearch || {};
  if (localSearch.labelKey !== 'more.localSearch.label') issues.push('More sheet localSearch labelKey must be more.localSearch.label');
  if (localSearch.placeholderKey !== 'more.localSearch.placeholder') issues.push('More sheet localSearch placeholderKey must be more.localSearch.placeholder');

  if (issues.length) {
    console.error('DISCOVERY CONTRACT GUARD RESULT: FAIL');
    issues.forEach((issue, index) => console.error(`${index + 1}. ${issue}`));
    process.exit(1);
  }

  console.log('DISCOVERY CONTRACT GUARD RESULT: PASS');
}

main();
