#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function fail(message) {
  failures.push(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function blocks(contents, marker) {
  const pattern = new RegExp(`/\\* BEGIN GENERATED: ${escapeRegExp(marker)} \\*/[\\s\\S]*?/\\* END GENERATED: ${escapeRegExp(marker)} \\*/`, 'g');
  return contents.match(pattern) || [];
}

function stripGenerated(contents) {
  return contents.replace(/\/\* BEGIN GENERATED: [^*]+ \*\/[\s\S]*?\/\* END GENERATED: [^*]+ \*\//g, '');
}

function region(contents, start, end) {
  const startIndex = contents.indexOf(start);
  if (startIndex === -1) return '';
  const endIndex = contents.indexOf(end, startIndex + start.length);
  return endIndex === -1 ? contents.slice(startIndex) : contents.slice(startIndex, endIndex);
}

function firstInlineCriticalCss(contents) {
  const styles = Array.from(contents.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi));
  const critical = styles.find((match) => match[1].includes('--gg-panel-width') && match[1].includes('--gg-panel-handle-tone'));
  return critical?.[1] || '';
}

const requiredComponents = [
  'src/css/components/gg-visual-tokens.css',
  'src/css/components/gg-sheet-core.css',
  'src/css/components/gg-sheet-modal.css',
  'src/css/components/gg-preview-frame.css',
  'src/css/components/gg-more-sheet.css',
  'src/css/components/gg-discovery-sheet.css',
];

for (const file of requiredComponents) {
  if (!exists(file)) fail(`missing visual component source: ${file}`);
  else if (!read(file).trim()) fail(`empty visual component source: ${file}`);
}

const generatedTargets = [
  ['src/css/gg-app.source.css', 'gg-visual-tokens'],
  ['landing.html', 'gg-visual-tokens'],
  ['src/store/store.css', 'gg-visual-tokens'],
  ['src/css/gg-app.source.css', 'gg-sheet-core'],
  ['landing.html', 'gg-sheet-core'],
  ['src/store/store.css', 'gg-sheet-core'],
  ['src/css/gg-app.source.css', 'gg-preview-frame'],
  ['src/store/store.css', 'gg-preview-frame'],
  ['src/css/gg-app.source.css', 'gg-more-sheet'],
  ['landing.html', 'gg-more-sheet'],
  ['src/store/store.css', 'gg-more-sheet'],
  ['src/css/gg-app.source.css', 'gg-discovery-sheet'],
  ['landing.html', 'gg-discovery-sheet'],
];

for (const [file, marker] of generatedTargets) {
  const count = blocks(read(file), marker).length;
  if (count !== 1) fail(`${file} must contain exactly one generated ${marker} block; found ${count}`);
}

for (const file of [
  'src/css/gg-app.source.css',
  '__gg/assets/css/gg-app.dev.css',
  'landing.html',
  'src/store/store.css',
  'assets/store/store.css',
  'src/store/store.critical.css',
  'store.html',
]) {
  if (!exists(file)) continue;
  const contents = read(file);
  const begin = (contents.match(/\/\* BEGIN GENERATED:/g) || []).length;
  const end = (contents.match(/\/\* END GENERATED:/g) || []).length;
  if (begin !== end) fail(`${file} has unbalanced generated markers: begin=${begin} end=${end}`);
}

const visualTokens = read('src/css/components/gg-visual-tokens.css');
for (const token of [
  '--gg-color-bg',
  '--gg-color-surface',
  '--gg-color-surface-elevated',
  '--gg-color-text',
  '--gg-color-muted',
  '--gg-color-hairline',
  '--gg-color-active-row',
  '--gg-color-scrim',
  '--gg-sheet-radius',
  '--gg-outline-viewport-gap',
  '--gg-outline-max-width',
  '--gg-attached-outline-width',
  '--gg-preview-panel-initial-height',
  '--gg-preview-panel-max-height',
  '--gg-preview-hero-height',
  '--gg-preview-hero-aspect',
  '--gg-preview-content-lift',
  '--gg-discovery-control-height',
  '--gg-discovery-row-min-height',
  '--gg-discovery-input-height',
]) {
  if (!visualTokens.includes(token)) fail(`gg-visual-tokens missing ${token}`);
}

const stalePatterns = [
  '--gg-panel-handle-width: 62px',
  '--gg-panel-handle-height: 3px',
  '--gg-panel-width: min(calc(100vw - 12px), 600px)',
  '--gg-panel-width: var(--gg-dock-width)',
];
for (const file of ['src/store/store.css', 'assets/store/store.css', 'src/store/store.critical.css', 'store.html']) {
  if (!exists(file)) continue;
  const contents = read(file);
  for (const stale of stalePatterns) {
    if (contents.includes(stale)) fail(`${file} contains stale visual token pattern: ${stale}`);
  }
}

const storeCss = read('src/store/store.css');
for (const stale of [
  '--store-preview-initial-height',
  '--store-preview-max-height',
  '--store-preview-hero-min',
  '--store-preview-overlay-lift',
  '--store-preview-footer-height',
]) {
  if (storeCss.includes(stale)) fail(`src/store/store.css still uses store preview frame alias ${stale}`);
}
const storeManualCss = stripGenerated(storeCss);
if (/\.store-preview-sheet\s+\.gg-sheet__panel\s*\{[^}]*--store-preview/s.test(storeManualCss)) {
  fail('Store preview panel still uses independent store preview height/frame tokens');
}
if (/\.store-preview__handle\s*\{|\.\s*store-preview__handle::before\s*\{/s.test(storeManualCss)) {
  fail('Store preview still has local handle geometry outside global sheet handle core');
}

const landingDiscovery = region(read('landing.html'), 'id="gg-command-panel"', 'id="gg-more-panel"');
for (const legacy of [
  'class="gg-discovery-body',
  'class="gg-discovery-command',
  'class="gg-discovery-filters',
  'class="gg-control',
  'class="gg-field',
  'class="gg-results',
  'class="gg-result',
]) {
  if (landingDiscovery.includes(legacy)) fail(`Landing Discovery still uses legacy active hook: ${legacy}`);
}
for (const canonical of [
  'class="gg-discovery"',
  'class="gg-discovery__body"',
  'class="gg-discovery-view gg-discovery-view--results"',
  'class="gg-discovery-results"',
  'class="gg-discovery__controls"',
  'class="gg-discovery-tabs"',
  'class="gg-discovery-tab"',
  'class="gg-discovery-search"',
  'class="gg-discovery-search__field"',
]) {
  if (!landingDiscovery.includes(canonical)) fail(`Landing Discovery missing canonical hook: ${canonical}`);
}

const discoverySource = read('src/css/components/gg-discovery-sheet.css');
for (const legacySelector of ['.gg-discovery-body', '.gg-discovery-command', '.gg-discovery-filters', '.gg-control', '.gg-field', '.gg-results', '.gg-result']) {
  if (discoverySource.includes(legacySelector)) fail(`Discovery component still styles legacy selector ${legacySelector}`);
}

const storeDiscoveryCss = region(storeCss, '.store-discovery-body', '.store-setting-grid');
for (const expected of [
  'var(--gg-discovery-controls-gap',
  'var(--gg-discovery-controls-pad-top',
  'var(--gg-discovery-controls-pad-bottom',
  'var(--gg-discovery-controls-border',
  'var(--gg-discovery-tab-gap',
  'var(--gg-discovery-input-height',
]) {
  if (!storeDiscoveryCss.includes(expected)) fail(`Store Discovery shell is missing global token use: ${expected}`);
}

const critical = read('src/store/store.critical.css');
const inlineCritical = exists('store.html') ? firstInlineCriticalCss(read('store.html')) : '';
for (const [label, contents] of [['src/store/store.critical.css', critical], ['store.html inline critical CSS', inlineCritical]]) {
  if (!contents) {
    fail(`${label} missing`);
    continue;
  }
  for (const stale of stalePatterns) {
    if (contents.includes(stale)) fail(`${label} contains stale critical token pattern: ${stale}`);
  }
}

const packageJson = JSON.parse(read('package.json'));
if (packageJson.scripts?.['gaga:verify-visual-system'] !== 'node qa/visual-system-contract-guard.mjs') {
  fail('package.json must define gaga:verify-visual-system');
}
if (!String(packageJson.scripts?.['ci:qa'] || '').includes('npm run gaga:verify-visual-system')) {
  fail('ci:qa must include npm run gaga:verify-visual-system');
}

if (failures.length) {
  console.error('Visual system contract guard failed:');
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('VISUAL SYSTEM CONTRACT GUARD PASS');
