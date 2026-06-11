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

function fail(issues) {
  console.error('THEME CONTRACT GUARD CONTRACT_FAILURE');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

function assertIncludes(label, text, needle, issues) {
  if (!text.includes(needle)) issues.push(`${label} missing ${needle}`);
}

function assertNotIncludes(label, text, needle, issues) {
  if (text.includes(needle)) issues.push(`${label} must not include ${needle}`);
}

function attrValues(text, attr) {
  const pattern = new RegExp(`${attr}=(['"])(.*?)\\1`, 'g');
  return Array.from(text.matchAll(pattern)).map((match) => match[2]);
}

function assertThemeOptions(label, text, attr, issues) {
  const values = attrValues(text, attr);
  if (values.includes('system')) issues.push(`${label} exposes legacy ${attr}=system`);
  const themeValues = values.filter((value) => value === 'light' || value === 'dark');
  if (themeValues.join('|') !== 'light|dark') {
    issues.push(`${label} ${attr} expected light | dark got ${themeValues.join(' | ') || '(none)'}`);
  }
}

function assertNoPublicSystem(label, text, issues) {
  assertNotIncludes(label, text, "data-gg-theme-option='system'", issues);
  assertNotIncludes(label, text, 'data-gg-theme-option="system"', issues);
  assertNotIncludes(label, text, 'data-store-theme="system"', issues);
  assertNotIncludes(label, text, "data-store-theme='system'", issues);
  if (/data-gg-pref-value=(['"])appearance\1[^>]*>\s*(System|Sistem)\s*</.test(text)) {
    issues.push(`${label} shows System/Sistem in the Appearance summary row`);
  }
}

function assertPreboot(label, text, issues) {
  assertIncludes(label, text, "getItem('gg:theme')", issues);
  assertIncludes(label, text, "theme !== 'dark'", issues);
  assertIncludes(label, text, "theme = 'light'", issues);
  assertIncludes(label, text, "setItem('gg:theme', theme)", issues);
  assertIncludes(label, text, "setAttribute('data-gg-theme', theme)", issues);
}

function assertRuntime(label, text, issues) {
  assertIncludes(label, text, 'function normalizeTheme', issues);
  if (!text.includes("=== 'dark' ? 'dark' : 'light'") && !text.includes("if (theme === 'dark') return 'dark'")) {
    issues.push(`${label} normalizeTheme must collapse non-dark values to light`);
  }
  assertIncludes(label, text, 'function readPreferredTheme', issues);
  assertIncludes(label, text, "setAttribute('data-gg-theme', state.theme)", issues);
  assertNotIncludes(label, text, "removeAttribute('data-gg-theme')", issues);
  assertNotIncludes(label, text, "removeStorage('gg:theme')", issues);
  assertNotIncludes(label, text, "theme: 'system'", issues);
  assertNotIncludes(label, text, 'theme: "system"', issues);
}

function main() {
  const issues = [];
  const packageJson = parseJson('package.json');
  const en = parseJson('registry/copy/gg-copy-en.json');
  const id = parseJson('registry/copy/gg-copy-id.json');

  if (packageJson.scripts?.['gaga:verify-theme'] !== 'node qa/theme-contract-guard.mjs') {
    issues.push('package.json missing gaga:verify-theme alias');
  }

  if (en['appearance.light'] !== 'Light') issues.push('EN appearance.light must be Light');
  if (en['appearance.dark'] !== 'Dark') issues.push('EN appearance.dark must be Dark');
  if (id['appearance.light'] !== 'Terang') issues.push('ID appearance.light must be Terang');
  if (id['appearance.dark'] !== 'Gelap') issues.push('ID appearance.dark must be Gelap');

  const publicSurfaces = [
    ['index.xml', read('index.xml'), 'data-gg-theme-option'],
    ['landing.html', read('landing.html'), 'data-gg-theme-option'],
    ['store.html', read('store.html'), 'data-store-theme']
  ];
  for (const [label, text, attr] of publicSurfaces) {
    assertNoPublicSystem(label, text, issues);
    assertThemeOptions(label, text, attr, issues);
  }

  for (const [label, text] of [
    ['src/js/boot/theme-preboot.js', read('src/js/boot/theme-preboot.js')],
    ['index.xml', read('index.xml')],
    ['landing.html', read('landing.html')],
    ['store.html', read('store.html')]
  ]) {
    assertPreboot(label, text, issues);
  }

  for (const [label, text] of [
    ['src/js/gg-app.source.js', read('src/js/gg-app.source.js')],
    ['src/js/modules/controllers/locale-appearance.fragment.js', read('src/js/modules/controllers/locale-appearance.fragment.js')],
    ['src/store/store-discovery.js', read('src/store/store-discovery.js')],
    ['landing.html', read('landing.html')]
  ]) {
    assertRuntime(label, text, issues);
  }

  for (const file of [
    'src/css/gg-app.source.css',
    'src/css/gg-critical.source.css',
    'src/css/modules/theme.css',
    'src/store/store.css',
    'src/store/store.critical.css',
    'index.xml',
    'landing.html',
    'store.html'
  ]) {
    const text = read(file);
    if (text.includes('prefers-color-scheme')) issues.push(`${file} must not use prefers-color-scheme for theme switching`);
    if (/--gg-surface-page:\s*#(?:000|000000|fff|ffffff)\b/i.test(text)) {
      issues.push(`${file} uses pure black/white for --gg-surface-page`);
    }
  }

  if (issues.length) fail(issues);
  console.log('THEME CONTRACT GUARD PASS');
}

main();
