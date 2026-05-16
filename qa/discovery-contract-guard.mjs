#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const REGISTRY_URL = pathToFileURL(path.join(ROOT, 'src/registry/gg-system-registry.js'));
const { GG_DISCOVERY, GG_DOCK } = await import(REGISTRY_URL.href);

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

function main() {
  const issues = [];
  const rootEn = parseJson('registry/copy/gg-copy-en.json');
  const rootId = parseJson('registry/copy/gg-copy-id.json');
  const appRuntime = read('src/js/gg-app.source.js');
  const storeRuntime = read('src/store/store-discovery.js');

  assertSameArray('GG_DISCOVERY.global.surfaces', GG_DISCOVERY.global.surfaces, ['landing', 'blog', 'detail', 'page'], issues);
  assertSameArray('GG_DISCOVERY.store.surfaces', GG_DISCOVERY.store.surfaces, ['store'], issues);
  assertSameArray('GG_DISCOVERY.global.filters', GG_DISCOVERY.global.filters, ['all', 'articles', 'topics', 'routes', 'sections', 'actions'], issues);
  assertSameArray('GG_DISCOVERY.store.filters', GG_DISCOVERY.store.filters, ['all', 'products', 'categories', 'routes'], issues);

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

  if (!appRuntime.includes('launchDiscovery')) issues.push('global runtime discovery launcher is missing');
  if (!storeRuntime.includes('function openDiscovery')) issues.push('store runtime discovery launcher is missing');

  if (issues.length) {
    console.error('DISCOVERY CONTRACT GUARD RESULT: FAIL');
    issues.forEach((issue, index) => console.error(`${index + 1}. ${issue}`));
    process.exit(1);
  }

  console.log('DISCOVERY CONTRACT GUARD RESULT: PASS');
}

main();
