#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOCK_ORDER = ['home', 'contact', 'search', 'blog', 'more'];
const MORE_KEYS = [
  'more.section.navigation',
  'more.section.discover',
  'more.section.info',
  'more.section.language',
  'more.section.appearance',
  'nav.home',
  'nav.blog',
  'nav.store',
  'nav.contact',
  'more.search',
  'more.sitemap',
  'more.rss',
  'more.about',
  'more.privacy',
  'more.terms',
  'more.disclaimer',
  'language.english',
  'language.indonesia',
  'appearance.system',
  'appearance.light',
  'appearance.dark',
  'more.shareSite',
  'footer.copyright'
];

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

  assertDockOrder('index.xml', index, 'data-gg-nav', issues);
  assertDockOrder('template/partials/15-dock.xml', dockPartial, 'data-gg-nav', issues);
  assertDockOrder('landing.html', landing, 'data-gg-nav', issues);
  assertDockOrder('store.html', store, 'data-store-dock', issues);

  assertContains('template/partials/18-more-panel.xml', morePartial, MORE_KEYS, issues);
  assertContains('index.xml', index, MORE_KEYS, issues);
  assertContains('landing.html', landing, MORE_KEYS, issues);
  assertContains('store.html', store, MORE_KEYS.concat(['more.commerceNote']), issues);

  if (publicMarkupText(landing).includes('Landing')) issues.push('landing.html exposes public Landing text outside runtime code');
  if (publicMarkupText(store).includes('Landing')) issues.push('store.html exposes public Landing text outside runtime code');
  if (landing.includes('more.commerceNote')) issues.push('landing.html must not show the store-only commerce note');
  if (morePartial.includes('more.commerceNote')) issues.push('Blogger More panel must not show the store-only commerce note');

  assertContains('src/js/gg-app.source.js', appRuntime, [
    'function handlePrimaryRouteTrigger',
    'function scrollDocumentToTop',
    'function isRootListingSurface',
    "surface === 'post' || state.surfaceContext.surface === 'page'"
  ], issues);
  assertContains('src/store/store-discovery.js', storeRuntime, [
    "dock: ['home', 'contact', 'search', 'blog', 'more']",
    'moreSearchOpen',
    "'more.commerceNote'"
  ], issues);

  if (issues.length) {
    console.error('NAV MORE CONTRACT GUARD RESULT: FAIL');
    issues.forEach((issue, index) => console.error(`${index + 1}. ${issue}`));
    process.exit(1);
  }

  console.log('NAV MORE CONTRACT GUARD RESULT: PASS');
}

main();
