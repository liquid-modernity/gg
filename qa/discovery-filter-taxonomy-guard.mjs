#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(file) {
  return readFileSync(path.join(ROOT, file), 'utf8');
}

function parseJson(file) {
  return JSON.parse(read(file));
}

function valuesFromRegex(text, pattern) {
  return Array.from(text.matchAll(pattern)).map((match) => match[1]);
}

function sameArray(label, actual, expected, issues) {
  if (actual.join('|') !== expected.join('|')) {
    issues.push(`${label} expected ${expected.join(' | ')} got ${actual.join(' | ') || '(none)'}`);
  }
}

function requireCopy(copy, key, expected, label, issues) {
  if (!(key in copy)) {
    issues.push(`${label} missing ${key}`);
  } else if (copy[key] !== expected) {
    issues.push(`${label} ${key} expected ${JSON.stringify(expected)} got ${JSON.stringify(copy[key])}`);
  }
}

function main() {
  const issues = [];
  const indexXml = read('index.xml');
  const landingHtml = read('landing.html');
  const appRuntime = read('src/js/gg-app.source.js');
  const storeRuntime = read('src/store/store-discovery.js');
  const storeHtml = read('store.html');
  const en = parseJson('registry/copy/gg-copy-en.json');
  const id = parseJson('registry/copy/gg-copy-id.json');

  const rootVisible = valuesFromRegex(indexXml, /data-gg-command-tab=['"]([^'"]+)['"]/g);
  const landingVisible = valuesFromRegex(landingHtml, /data-discovery-filter=['"]([^'"]+)['"]/g);
  const storeVisible = valuesFromRegex(storeHtml, /data-store-discovery-kind=['"]([^'"]+)['"]/g);

  sameArray('Root Global Discovery visible filters', rootVisible, ['all', 'articles', 'topics'], issues);
  sameArray('Landing Global Discovery visible filters', landingVisible, ['all', 'articles', 'topics'], issues);
  sameArray('Store Discovery visible filters', storeVisible, ['all', 'products', 'categories'], issues);

  for (const hidden of ['routes', 'sections', 'actions']) {
    if (rootVisible.includes(hidden)) issues.push(`Root exposes developer filter ${hidden}`);
    if (landingVisible.includes(hidden)) issues.push(`Landing exposes developer filter ${hidden}`);
  }
  if (storeVisible.includes('routes') || storeVisible.includes('actions')) {
    issues.push('Store exposes route/action as a primary filter');
  }
  if (rootVisible.includes('saved') || landingVisible.includes('saved') || storeVisible.includes('saved')) {
    issues.push('Saved filter is visible even though Saved is intentionally deferred');
  }

  for (const marker of ['function globalRoutesAdapter', 'function globalLandingSectionsAdapter', 'function globalActionsAdapter']) {
    if (!appRuntime.includes(marker)) issues.push(`Global runtime missing internal searchable adapter: ${marker}`);
    if (!landingHtml.includes(marker)) issues.push(`Landing runtime missing internal searchable adapter: ${marker}`);
  }
  if (!appRuntime.includes("if (active === 'all') return true")) {
    issues.push('Global All filter must continue including routes/sections/actions');
  }
  if (!landingHtml.includes("if (filter === 'all') return true")) {
    issues.push('Landing All filter must continue including routes/sections/actions');
  }
  if (!storeRuntime.includes('function storeRoutesAdapter')) {
    issues.push('Store runtime missing internal searchable route adapter');
  }
  if (!storeRuntime.includes("kind === 'all'")) {
    issues.push('Store All filter must continue including routes/actions');
  }

  if (!appRuntime.includes('isStoreDiscoveryPost(post)')) {
    issues.push('Global Articles adapter must exclude Store-domain posts');
  }
  if (!appRuntime.includes('isStoreDiscoveryLabel(topic.title || topic.key)')) {
    issues.push('Global Topics adapter must exclude Store-domain labels');
  }
  if (!storeRuntime.includes("type: 'product'")) {
    issues.push('Store Products adapter must emit Store product type');
  }
  if (!storeRuntime.includes("type: 'category'")) {
    issues.push('Store Categories adapter must emit Store category type');
  }

  requireCopy(en, 'discovery.filter.all', 'All', 'EN copy', issues);
  requireCopy(en, 'discovery.filter.articles', 'Articles', 'EN copy', issues);
  requireCopy(en, 'discovery.filter.topics', 'Topics', 'EN copy', issues);
  requireCopy(en, 'discovery.filter.saved', 'Saved', 'EN copy', issues);
  requireCopy(en, 'discovery.filter.products', 'Products', 'EN copy', issues);
  requireCopy(en, 'discovery.filter.categories', 'Categories', 'EN copy', issues);
  requireCopy(en, 'discovery.saved.empty.title', 'No saved items yet.', 'EN copy', issues);
  requireCopy(en, 'discovery.saved.empty.body', 'Save articles or products to find them here.', 'EN copy', issues);

  requireCopy(id, 'discovery.filter.all', 'Semua', 'ID copy', issues);
  requireCopy(id, 'discovery.filter.articles', 'Artikel', 'ID copy', issues);
  requireCopy(id, 'discovery.filter.topics', 'Topik', 'ID copy', issues);
  requireCopy(id, 'discovery.filter.saved', 'Tersimpan', 'ID copy', issues);
  requireCopy(id, 'discovery.filter.products', 'Produk', 'ID copy', issues);
  requireCopy(id, 'discovery.filter.categories', 'Kategori', 'ID copy', issues);
  requireCopy(id, 'discovery.saved.empty.title', 'Belum ada item tersimpan.', 'ID copy', issues);
  requireCopy(id, 'discovery.saved.empty.body', 'Simpan artikel atau produk untuk menemukannya di sini.', 'ID copy', issues);

  if (issues.length) {
    console.error('DISCOVERY FILTER TAXONOMY GUARD RESULT: FAIL');
    issues.forEach((issue, index) => console.error(`${index + 1}. ${issue}`));
    process.exit(1);
  }

  console.log('DISCOVERY FILTER TAXONOMY GUARD RESULT: PASS');
}

main();
