#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];

const components = {
  'gg-visual-tokens': 'src/css/components/gg-visual-tokens.css',
  'gg-sheet-core': 'src/css/components/gg-sheet-core.css',
  'gg-preview-frame': 'src/css/components/gg-preview-frame.css',
  'gg-more-sheet': 'src/css/components/gg-more-sheet.css',
  'gg-discovery-sheet': 'src/css/components/gg-discovery-sheet.css',
  'gg-sheet-modal': 'src/css/components/gg-sheet-modal.css',
};

const generatedTargets = [
  { file: 'src/css/gg-app.source.css', marker: 'gg-visual-tokens' },
  { file: 'landing.html', marker: 'gg-visual-tokens' },
  { file: 'src/store/store.css', marker: 'gg-visual-tokens' },
  { file: 'src/css/gg-app.source.css', marker: 'gg-sheet-core' },
  { file: 'landing.html', marker: 'gg-sheet-core' },
  { file: 'src/store/store.css', marker: 'gg-sheet-core' },
  { file: 'src/css/modules/dock.css', marker: 'gg-sheet-modal' },
  { file: 'src/css/gg-app.source.css', marker: 'gg-sheet-modal' },
  { file: 'landing.html', marker: 'gg-sheet-modal' },
  { file: 'src/store/store.css', marker: 'gg-sheet-modal' },
  { file: 'src/css/gg-app.source.css', marker: 'gg-preview-frame' },
  { file: 'src/store/store.css', marker: 'gg-preview-frame' },
  { file: 'src/css/gg-app.source.css', marker: 'gg-more-sheet' },
  { file: 'landing.html', marker: 'gg-more-sheet' },
  { file: 'src/store/store.css', marker: 'gg-more-sheet' },
  { file: 'src/css/gg-app.source.css', marker: 'gg-discovery-sheet' },
  { file: 'landing.html', marker: 'gg-discovery-sheet' },
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function fail(message) {
  failures.push(message);
}

function normalize(value) {
  return value.replace(/\r\n/g, '\n').trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function markerPattern(marker) {
  return new RegExp(
    `/\\* BEGIN GENERATED: ${escapeRegExp(marker)} \\*/\\n?([\\s\\S]*?)\\n?/\\* END GENERATED: ${escapeRegExp(marker)} \\*/`,
    'g'
  );
}

function blocks(contents, marker) {
  return Array.from(contents.matchAll(markerPattern(marker)), (match) => match[1]);
}

function stripGenerated(contents) {
  return contents.replace(/\/\* BEGIN GENERATED: [^*]+ \*\/[\s\S]*?\/\* END GENERATED: [^*]+ \*\//g, '');
}

function firstInlineCriticalCss(contents) {
  const styles = Array.from(contents.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi));
  const critical = styles.find((match) =>
    match[1].includes('--gg-panel-width') && match[1].includes('--gg-panel-handle-tone')
  );
  return critical?.[1] || '';
}

for (const [marker, componentPath] of Object.entries(components)) {
  if (!exists(componentPath)) {
    fail(`Missing component source: ${componentPath}`);
    continue;
  }
  if (!normalize(read(componentPath))) fail(`Empty component source: ${componentPath}`);
}

for (const target of generatedTargets) {
  const contents = read(target.file);
  const found = blocks(contents, target.marker);
  if (found.length !== 1) {
    fail(`${target.file} must contain exactly one generated ${target.marker} block; found ${found.length}`);
    continue;
  }
  const source = read(components[target.marker]);
  if (normalize(found[0]) !== normalize(source)) {
    fail(`${target.file} generated ${target.marker} block differs from ${components[target.marker]}`);
  }
}

for (const [modulePath, marker] of [
  ['src/css/modules/sheets.css', 'gg-sheet-core'],
  ['src/css/modules/visual-tokens.css', 'gg-visual-tokens'],
  ['src/css/modules/preview-frame.css', 'gg-preview-frame'],
  ['src/css/modules/more.css', 'gg-more-sheet'],
  ['src/css/modules/discovery.css', 'gg-discovery-sheet'],
]) {
  if (normalize(read(modulePath)) !== normalize(read(components[marker]))) {
    fail(`${modulePath} must mirror ${components[marker]} so source modules do not go stale`);
  }
}

for (const file of ['src/css/gg-app.source.css', 'landing.html', 'src/store/store.css']) {
  const unmarked = stripGenerated(read(file));
  if (/(^|\n)\s*(?:#gg-more-panel\s+|#store-more-sheet\s+)?\.gg-more-[\w-]+[^{]*\{/m.test(unmarked)) {
    fail(`${file} contains unmarked manual .gg-more-* CSS outside the generated More component`);
  }
  if (/(^|\n)\s*#gg-more-panel\s+\.gg-more-sheet\s*>\s*\.gg-sheet__body\s*\{/m.test(unmarked)) {
    fail(`${file} contains an unmarked #gg-more-panel .gg-more-sheet > .gg-sheet__body override`);
  }
  if (/\.gg-more-bottom\s*\{[^}]*padding:\s*10px\s+0\s+calc\(8px \+ env\(safe-area-inset-bottom\)\)/s.test(unmarked)) {
    fail(`${file} contains stale horizontal-zero .gg-more-bottom padding outside the generated component`);
  }
  if (/\.gg-more-bottom\s*\{[^}]*padding-bottom:\s*(10px|16px)/s.test(unmarked)) {
    fail(`${file} contains surface-specific .gg-more-bottom padding outside the generated component`);
  }
}

const rootDiscovery = blocks(read('src/css/gg-app.source.css'), 'gg-discovery-sheet')[0] || '';
const landingDiscovery = blocks(read('landing.html'), 'gg-discovery-sheet')[0] || '';
if (normalize(rootDiscovery) !== normalize(landingDiscovery)) {
  fail('Root and Landing generated Discovery blocks must match exactly');
}

const storeCss = read('src/store/store.css');
if (blocks(storeCss, 'gg-discovery-sheet').length > 0) {
  fail('Store must not consume the Root/Landing gg-discovery-sheet block');
}
if (/(^|\n)\s*\.gg-discovery(?:[\s.#:{\[]|__|-)/m.test(stripGenerated(storeCss))) {
  fail('Store CSS contains Root/Landing .gg-discovery* content styles outside allowed shared primitives');
}
for (const stale of [
  '100vw - 12px',
  '--gg-panel-handle-width: 62px',
  '--gg-panel-handle-height: 3px',
  '--gg-panel-width: var(--gg-dock-width)',
]) {
  if (storeCss.includes(stale)) fail(`Store CSS still contains stale token pattern: ${stale}`);
}

const storeManualCss = stripGenerated(storeCss);
for (const [label, pattern] of [
  ['unscoped .gg-sheet rule', /(^|\n)\s*\.gg-sheet\s*\{/m],
  ['unscoped .gg-sheet[hidden] rule', /(^|\n)\s*\.gg-sheet\[hidden\]\s*\{/m],
  ['unscoped .gg-sheet__scrim rule', /(^|\n)\s*\.gg-sheet__scrim\s*\{/m],
  ['unscoped .gg-sheet__panel rule', /(^|\n)\s*\.gg-sheet__panel\s*\{/m],
  ['unscoped .gg-sheet__head rule', /(^|\n)\s*\.gg-sheet__head\s*\{/m],
  ['unscoped .gg-sheet__handle rule', /(^|\n)\s*\.gg-sheet__handle\s*\{/m],
  ['unscoped .gg-sheet__handle::before rule', /(^|\n)\s*\.gg-sheet__handle::before\s*\{/m],
]) {
  if (pattern.test(storeManualCss)) fail(`Store CSS contains local sheet-core drift outside generated block: ${label}`);
}
if (/\.gg-sheet__title\s*\{[^}]*text-transform:\s*uppercase/s.test(storeManualCss)) {
  fail('Store CSS contains local .gg-sheet__title uppercase styling outside generated core');
}
if (/\.gg-sheet__title\s*\{[^}]*letter-spacing:\s*\.12em/s.test(storeManualCss)) {
  fail('Store CSS contains local .gg-sheet__title .12em letter-spacing outside generated core');
}

const criticalTargets = [
  ['src/store/store.critical.css', read('src/store/store.critical.css')],
  ['store.html inline critical CSS', firstInlineCriticalCss(read('store.html'))],
];
for (const [label, contents] of criticalTargets) {
  if (!contents) {
    fail(`${label} is missing`);
    continue;
  }
  for (const stale of [
    '100vw - 12px',
    '--gg-panel-handle-width: 62px',
    '--gg-panel-handle-height: 3px',
    '--gg-panel-width: var(--gg-dock-width)',
  ]) {
    if (contents.includes(stale)) fail(`${label} contains stale critical token pattern: ${stale}`);
  }
  for (const expected of [
    '--gg-dock-edge-gap: 10px',
    '--gg-sheet-edge-gap: 0px',
    '--gg-dock-width: min(calc(100dvw - (var(--gg-dock-edge-gap) * 2)), 600px)',
    '--gg-panel-width: min(calc(100dvw - (var(--gg-sheet-edge-gap) * 2)), 600px)',
    '--gg-sheet-handle-hit: 44px',
    '--gg-sheet-handle-visual-width: 30px',
    '--gg-sheet-handle-visual-height: 2.5px',
  ]) {
    if (!contents.includes(expected)) fail(`${label} is missing critical sheet token: ${expected}`);
  }
}

const packageJson = JSON.parse(read('package.json'));
if (packageJson.scripts?.['gaga:verify-component-source'] !== 'node qa/component-source-contract-guard.mjs') {
  fail('package.json must define gaga:verify-component-source');
}
if (packageJson.scripts?.['gaga:verify-sheet-core-source'] !== 'node qa/component-source-contract-guard.mjs') {
  fail('package.json must define gaga:verify-sheet-core-source');
}
if (!String(packageJson.scripts?.['ci:qa'] || '').includes('npm run gaga:verify-component-source')) {
  fail('ci:qa must include npm run gaga:verify-component-source');
}
if (!String(packageJson.scripts?.['ci:qa'] || '').includes('npm run gaga:verify-sheet-core-source')) {
  fail('ci:qa must include npm run gaga:verify-sheet-core-source');
}
if (!exists('tools/sync-shared-css-components.mjs')) {
  fail('Missing tools/sync-shared-css-components.mjs');
}

if (failures.length) {
  console.error('Component source contract guard failed:');
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('Component source contract guard passed.');
