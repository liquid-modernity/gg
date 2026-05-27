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

function stripGenerated(contents) {
  return contents.replace(/\/\* BEGIN GENERATED: [^*]+ \*\/[\s\S]*?\/\* END GENERATED: [^*]+ \*\//g, '');
}

function generatedBlock(contents, marker) {
  const pattern = new RegExp(`/\\* BEGIN GENERATED: ${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\*/[\\s\\S]*?/\\* END GENERATED: ${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\*/`);
  return contents.match(pattern)?.[0] || '';
}

function firstInlineCriticalCss(contents) {
  const styles = Array.from(contents.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi));
  const critical = styles.find((match) => match[1].includes('--gg-panel-width') && match[1].includes('--gg-panel-handle-tone'));
  return critical?.[1] || '';
}

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

function cssRule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escaped}\\s*\\{[^}]*\\}`, 'm'))?.[0] || '';
}

function widthDeclaration(rule) {
  return rule.match(/(?:^|[;\s{])width:\s*([^;}]+)/m)?.[1]?.trim() || '';
}

const files = {
  packageJson: read('package.json'),
  previewFrame: read('src/css/components/gg-preview-frame.css'),
  sheetCore: read('src/css/components/gg-sheet-core.css'),
  visualTokens: read('src/css/components/gg-visual-tokens.css'),
  appCss: read('src/css/gg-app.source.css'),
  landing: read('landing.html'),
  storeCss: read('src/store/store.css'),
  storeCritical: read('src/store/store.critical.css'),
  storeHtml: read('store.html'),
  storeJs: read('src/store/store-discovery.js'),
};

if (exists('src/css/modules/preview.css')) {
  fail('src/css/modules/preview.css must not remain as an active-looking stale preview frame source');
}

for (const token of ['--gg-outline-viewport-gap', '--gg-outline-max-width', '--gg-attached-outline-width']) {
  if (!files.visualTokens.includes(token)) fail(`gg-visual-tokens missing ${token}`);
}
if (!files.visualTokens.includes('--gg-outline-viewport-gap: 70px')) {
  fail('global outline viewport gap must be 70px');
}
if (!files.visualTokens.includes('--gg-outline-max-width: 545px')) {
  fail('global outline max width must be 545px');
}
if (!files.visualTokens.includes('min(calc(100% - var(--gg-outline-viewport-gap)), var(--gg-outline-max-width))')) {
  fail('global attached outline width must use the tokenized 70px/545px formula');
}

for (const [label, source] of [
  ['src/css/components/gg-preview-frame.css', files.previewFrame],
  ['src/css/modules/preview-frame.css', read('src/css/modules/preview-frame.css')],
  ['src/css/gg-app.source.css generated preview frame', generatedBlock(files.appCss, 'gg-preview-frame')],
  ['src/store/store.css generated preview frame', generatedBlock(files.storeCss, 'gg-preview-frame')],
]) {
  if (!source) {
    fail(`${label} missing preview frame source`);
    continue;
  }
  if (/\.gg-preview__sheet,\s*\.store-preview-sheet\s+\.gg-sheet__panel\s*\{[\s\S]*?overflow:\s*auto\s*;/m.test(source)) {
    fail(`${label} uses overflow:auto on preview sheet/panel`);
  }
  if (!/\.gg-preview__sheet,\s*\.store-preview-sheet\s+\.gg-sheet__panel\s*\{[\s\S]*?overflow-y:\s*auto\s*;/m.test(source)) {
    fail(`${label} missing preview overflow-y:auto`);
  }
  if (!/\.gg-preview__sheet,\s*\.store-preview-sheet\s+\.gg-sheet__panel\s*\{[\s\S]*?overflow-x:\s*clip\s*;/m.test(source)) {
    fail(`${label} missing preview overflow-x:clip`);
  }
  if (!/@supports not \(overflow-x:\s*clip\)[\s\S]*?overflow-x:\s*hidden\s*;/m.test(source)) {
    fail(`${label} missing overflow-x:hidden fallback`);
  }
}

if (/\.store-preview__hero\s*\{(?:(?!\}).)*--gg-preview-panel-(?:initial|max)-height/s.test(files.storeCss)) {
  fail('Store preview hero still uses old panel-driven hero max-height');
}

const storeManualCss = stripGenerated(files.storeCss);
if (/\.store-preview-sheet\s+\.gg-sheet__panel\s*\{/m.test(storeManualCss)) {
  fail('Store CSS still has a local store-preview-sheet .gg-sheet__panel frame override outside generated preview frame');
}
if (/\.store-preview__hero\s*\{/m.test(storeManualCss)) {
  fail('Store CSS still has a local .store-preview__hero frame override outside generated preview frame');
}
if (/\.store-preview__body\s*\{[\s\S]*?margin-top:\s*calc\(-1 \* var\(--gg-preview-content-lift\)\)/m.test(storeManualCss)) {
  fail('Store CSS still has a local preview body frame/lift override outside generated preview frame');
}
if (/\.store-preview__footer\s*\{[\s\S]*?--gg-preview-footer-height/m.test(storeManualCss)) {
  fail('Store CSS still has a local preview footer frame override outside generated preview frame');
}

for (const [label, source] of [
  ['src/css/modules/detail-outline.css', read('src/css/modules/detail-outline.css')],
  ['src/css/gg-app.source.css', files.appCss],
  ['landing.html', files.landing],
  ['src/store/store.css', files.storeCss],
]) {
  const detailRule = cssRule(source, '.gg-detail-outline');
  const storeRule = cssRule(source, '.store-filter-outline');
  const attachedRule = cssRule(source, '[data-gg-attached-outline]');
  for (const [selector, rule] of [['.gg-detail-outline', detailRule], ['.store-filter-outline', storeRule], ['[data-gg-attached-outline]', attachedRule]]) {
    const width = widthDeclaration(rule);
    if (width && width !== 'var(--gg-attached-outline-width)') {
      fail(`${label} ${selector} width does not use --gg-attached-outline-width`);
    }
  }
}

for (const [label, source] of [
  ['src/css/modules/detail-outline.css', read('src/css/modules/detail-outline.css')],
  ['src/css/gg-app.source.css', files.appCss],
  ['landing.html', files.landing],
  ['src/store/store.css', files.storeCss],
  ['src/store/store.critical.css', files.storeCritical],
  ['store.html inline critical CSS', firstInlineCriticalCss(files.storeHtml)],
]) {
  for (const stale of ['calc(100% - 66px)', 'calc(100% - 42px)', 'width: min(calc(100% - 70px), 545px)', '--gg-detail-outline-width: 540px', 'width: min(calc(100% - 66px), 540px)']) {
    if (source.includes(stale)) fail(`${label} contains stale outline width pattern: ${stale}`);
  }
}

const formulaOccurrences = countMatches(
  [
    files.visualTokens,
    read('src/css/modules/visual-tokens.css'),
    files.appCss,
    files.landing,
    files.storeCss,
    files.storeCritical,
    firstInlineCriticalCss(files.storeHtml),
  ].join('\n'),
  /min\(calc\(100% - var\(--gg-outline-viewport-gap\)\), var\(--gg-outline-max-width\)\)/g
);
if (formulaOccurrences < 3) {
  fail('attached outline token formula is not present in source/generated/critical layers');
}

if (!files.storeJs.includes('function preservePageScrollDuring')) {
  fail('Store sheet controller missing preservePageScrollDuring helper');
}
if (!files.storeJs.includes('restorePageScrollPosition')) {
  fail('Store sheet controller missing page scroll restore helper');
}
if (!/function openPanel[\s\S]*?preservePageScrollDuring\(function \(\)/m.test(files.storeJs)) {
  fail('Store openPanel path must wrap sheet opening in page-scroll preservation');
}
if (!/focus\(\{\s*preventScroll:\s*true\s*\}\)/m.test(files.storeJs)) {
  fail('Store focus path must use preventScroll');
}

for (const [label, source] of [
  ['src/store/store.critical.css', files.storeCritical],
  ['store.html inline critical CSS', firstInlineCriticalCss(files.storeHtml)],
]) {
  if (!source) {
    fail(`${label} missing`);
    continue;
  }
  for (const stale of [
    '--gg-panel-handle-width: 62px',
    '--gg-panel-handle-height: 3px',
    '--gg-panel-width: var(--gg-dock-width)',
    '--store-preview-initial-height',
    '--store-preview-max-height',
    '--store-preview-hero-min',
  ]) {
    if (source.includes(stale)) fail(`${label} contains stale critical pattern: ${stale}`);
  }
  if (!source.includes('--gg-attached-outline-width')) fail(`${label} missing attached outline width token`);
}

if (files.packageJson.includes('playwright') || files.packageJson.includes('puppeteer') || files.packageJson.includes('selenium') || files.packageJson.includes('cypress')) {
  fail('package.json must not add heavy browser automation for this task');
}
const packageJson = JSON.parse(files.packageJson);
if (packageJson.scripts?.['gaga:verify-sheet-runtime-overflow'] !== 'node qa/sheet-runtime-overflow-viewport-guard.mjs') {
  fail('package.json must define gaga:verify-sheet-runtime-overflow');
}
if (!String(packageJson.scripts?.['ci:qa'] || '').includes('npm run gaga:verify-sheet-runtime-overflow')) {
  fail('ci:qa must include npm run gaga:verify-sheet-runtime-overflow');
}

if (failures.length) {
  console.error('SHEET RUNTIME OVERFLOW VIEWPORT GUARD FAIL');
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('SHEET RUNTIME OVERFLOW VIEWPORT GUARD PASS');
