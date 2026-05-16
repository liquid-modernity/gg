#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const REGISTRY_URL = pathToFileURL(path.join(ROOT, 'src/registry/gg-system-registry.js'));
const { GG_ACTIONS, GG_DOCK, GG_MORE_SHEET, GG_ROUTES } = await import(REGISTRY_URL.href);
const DOCK_ORDER = GG_DOCK.order;
const MORE_ITEM_COPY_KEYS = {
  search: 'more.search',
  english: 'language.english',
  indonesia: 'language.indonesia',
  system: 'appearance.system',
  light: 'appearance.light',
  dark: 'appearance.dark'
};

const MORE_KEYS = GG_MORE_SHEET.sections.flatMap((section) => {
  return [section.titleKey].concat(section.items.map((item) => MORE_ITEM_COPY_KEYS[item] || (GG_ROUTES[item] && GG_ROUTES[item].labelKey)).filter(Boolean));
}).concat([
  GG_MORE_SHEET.share.labelKey,
  GG_MORE_SHEET.copyright.key
]);

function read(file) {
  return readFileSync(path.join(ROOT, file), 'utf8');
}

function valuesForAttr(text, attr) {
  return [...text.matchAll(new RegExp(`${attr}=['"]([^'"]+)['"]`, 'g'))].map((match) => match[1]);
}

function assertDockOrder(label, text, attr, issues) {
  const actual = valuesForAttr(text, attr).slice(0, DOCK_ORDER.length);
  if (actual.join('|') !== DOCK_ORDER.join('|')) {
    issues.push(`${label} dock order expected ${DOCK_ORDER.join(' | ')} got ${actual.join(' | ') || '(none)'}`);
  }
}

function assertContains(label, text, keys, issues) {
  for (const key of keys) {
    if (!text.includes(key)) issues.push(`${label} missing ${key}`);
  }
}

function assertSameArray(label, actual, expected, issues) {
  if (actual.join('|') !== expected.join('|')) {
    issues.push(`${label} expected ${expected.join(' | ')} got ${actual.join(' | ') || '(none)'}`);
  }
}

function assertAction(surface, item, expected, issues) {
  const actual = GG_DOCK.surfaces[surface] && GG_DOCK.surfaces[surface].actions[item];
  if (actual !== expected) {
    issues.push(`GG_DOCK ${surface}.${item} action expected ${expected} got ${actual || '(missing)'}`);
  }
  if (!GG_ACTIONS[expected]) issues.push(`GG_ACTIONS missing expected action ${expected}`);
  if (actual && !GG_ACTIONS[actual]) issues.push(`GG_DOCK ${surface}.${item} references unknown action ${actual}`);
}

function moreSection(id) {
  return GG_MORE_SHEET.sections.find((section) => section.id === id);
}

function stripRuntime(text) {
  return text
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
}

function publicMarkupText(text) {
  return stripRuntime(text).replace(/\s+[a-zA-Z_:][\w:.-]*=(["'])[\s\S]*?\1/g, '');
}

function main() {
  const issues = [];
  const index = read('index.xml');
  const dockPartial = read('template/partials/15-dock.xml');
  const morePartial = read('template/partials/18-more-panel.xml');
  const landing = read('landing.html');
  const store = read('store.html');
  const storeRuntime = read('src/store/store-discovery.js');
  const appRuntime = read('src/js/gg-app.source.js');
  const moreSectionIds = GG_MORE_SHEET.sections.map((section) => section.id);

  assertDockOrder('index.xml', index, 'data-gg-nav', issues);
  assertDockOrder('template/partials/15-dock.xml', dockPartial, 'data-gg-nav', issues);
  assertDockOrder('landing.html', landing, 'data-gg-nav', issues);
  assertDockOrder('store.html', store, 'data-store-dock', issues);

  assertContains('template/partials/18-more-panel.xml', morePartial, MORE_KEYS, issues);
  assertContains('index.xml', index, MORE_KEYS, issues);
  assertContains('landing.html', landing, MORE_KEYS, issues);
  assertContains('store.html', store, MORE_KEYS.concat([GG_MORE_SHEET.routeNotes.store.key]), issues);

  assertSameArray('GG_DOCK.order', GG_DOCK.order, ['home', 'contact', 'search', 'blog', 'more'], issues);
  assertSameArray('GG_MORE_SHEET.sections', moreSectionIds, ['navigation', 'discover', 'info', 'language', 'appearance'], issues);
  assertSameArray('GG_MORE_SHEET navigation items', moreSection('navigation').items, ['home', 'blog', 'store', 'contact'], issues);
  assertSameArray('GG_MORE_SHEET info items', moreSection('info').items, ['about', 'privacy', 'terms', 'disclaimer'], issues);
  assertAction('landing', 'home', 'scrollTop', issues);
  assertAction('landing', 'search', 'openGlobalDiscovery', issues);
  assertAction('blog', 'blog', 'scrollTop', issues);
  assertAction('blog', 'search', 'openGlobalDiscovery', issues);
  assertAction('store', 'search', 'openStoreDiscovery', issues);

  if (publicMarkupText(landing).includes('Landing')) issues.push('landing.html exposes public Landing text outside runtime code');
  if (publicMarkupText(store).includes('Landing')) issues.push('store.html exposes public Landing text outside runtime code');
  if (landing.includes('more.commerceNote')) issues.push('landing.html must not show the store-only commerce note');
  if (morePartial.includes('more.commerceNote')) issues.push('Blogger More panel must not show the store-only commerce note');
  if (Object.keys(GG_MORE_SHEET.routeNotes).join('|') !== 'store') issues.push('GG_MORE_SHEET route notes must be store-only');

  assertContains('src/js/gg-app.source.js', appRuntime, [
    'function handlePrimaryRouteTrigger',
    'function scrollDocumentToTop',
    'function isRootListingSurface',
    "surface === 'post' || state.surfaceContext.surface === 'page'"
  ], issues);
  assertContains('src/store/store-discovery.js', storeRuntime, [
    `dock: ['${GG_DOCK.order.join("', '")}']`,
    'moreSearchOpen',
    `'${GG_MORE_SHEET.routeNotes.store.key}'`
  ], issues);

  if (issues.length) {
    console.error('NAV MORE CONTRACT GUARD RESULT: FAIL');
    issues.forEach((issue, index) => console.error(`${index + 1}. ${issue}`));
    process.exit(1);
  }

  console.log('NAV MORE CONTRACT GUARD RESULT: PASS');
}

main();
