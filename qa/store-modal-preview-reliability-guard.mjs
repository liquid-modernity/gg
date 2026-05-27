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
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return contents.match(new RegExp(`/\\* BEGIN GENERATED: ${escaped} \\*/[\\s\\S]*?/\\* END GENERATED: ${escaped} \\*/`))?.[0] || '';
}

function firstInlineCriticalCss(contents) {
  const styles = Array.from(contents.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi));
  return styles.find((match) => match[1].includes('--gg-panel-width') && match[1].includes('--gg-panel-handle-tone'))?.[1] || '';
}

function count(source, needle) {
  return source.split(needle).length - 1;
}

const packageJsonText = read('package.json');
const packageJson = JSON.parse(packageJsonText);
const storeJs = read('src/store/store-discovery.js');
const storeCore = read('src/store/store-core.js');
const buildStore = read('tools/build-store-static.mjs');
const storeCss = read('src/store/store.css');
const storeCritical = read('src/store/store.critical.css');
const storeHtml = read('store.html');
const previewFrame = read('src/css/components/gg-preview-frame.css');
const visualTokens = read('src/css/components/gg-visual-tokens.css');
const appCss = read('src/css/gg-app.source.css');
const storeManualCss = stripGenerated(storeCss);
const inlineCritical = firstInlineCriticalCss(storeHtml);

if (!storeJs.includes('function preservePageScrollDuring')) fail('Store runtime missing preservePageScrollDuring');
if (!storeJs.includes('function setStoreModalBackgroundLocked')) fail('Store runtime missing centralized setStoreModalBackgroundLocked helper');
if (!storeJs.includes('function preventBackgroundScroll')) fail('Store runtime missing event-level background scroll guard');
if (!storeJs.includes("window.addEventListener('wheel', preventBackgroundScroll, { passive: false })")) fail('Store runtime must attach passive-safe wheel background guard only while locked');
if (!storeJs.includes("window.addEventListener('touchmove', preventBackgroundScroll, { passive: false })")) fail('Store runtime must attach passive-safe touchmove background guard only while locked');
if (!storeJs.includes("target.closest('.gg-sheet__panel, [data-gg-scroll-container]')")) fail('Store background scroll guard must exempt active sheet panels/scroll containers');
if (!storeJs.includes('setBackgroundNodeLocked(app, isLocked)')) fail('Store background lock must inert the Store background app');
if (!storeJs.includes('setBackgroundNodeLocked(filterOutline, isLocked)')) fail('Store background lock must inert the Store filter outline');
if (!storeJs.includes('setDockInert(isLocked)')) fail('Store background lock must coordinate dock inert state');
if (!/function openPanel[\s\S]*?preservePageScrollDuring\(function \(\)[\s\S]*?setStoreModalBackgroundLocked\(true\)/m.test(storeJs)) {
  fail('Store openPanel must wrap all sheet openings in scroll preservation and lock the background');
}
if (!/function closePanel[\s\S]*?setStoreModalBackgroundLocked\(false\)/m.test(storeJs)) {
  fail('Store closePanel must unlock background centrally');
}
if (count(storeJs, 'restorePageScrollPosition(snapshot.x, snapshot.y)') < 4) {
  fail('preservePageScrollDuring must use multi-phase scroll restore');
}
if (!storeJs.includes('window.setTimeout(function ()') || !storeJs.includes('}, 90)')) {
  fail('preservePageScrollDuring must include delayed scroll restoration');
}
if (!storeJs.includes('document.documentElement.scrollTop = y') && !storeJs.includes('doc.scrollTop = y')) {
  fail('scroll restoration must write documentElement scroll positions');
}

for (const [label, source] of [['src/store/store.css', storeCss], ['src/store/store.critical.css', storeCritical], ['store.html inline critical CSS', inlineCritical]]) {
  if (!source.includes("body[data-gg-scroll-lock='true']")) fail(`${label} missing body scroll lock rule`);
  if (!source.includes('overscroll-behavior: none')) fail(`${label} missing overscroll-behavior:none for modal lock`);
  if (!source.includes("body[data-gg-panel-active='true'] [data-store-background]")) fail(`${label} missing Store background pointer lock selector`);
  if (!source.includes('pointer-events: none')) fail(`${label} missing pointer-events:none for modal background`);
}
if (!storeHtml.includes('data-store-background')) fail('store.html main background missing data-store-background marker');

if (!storeCore.includes("document.documentElement.setAttribute('data-store-js', 'booting')")) fail('Store core must mark data-store-js booting as its first runtime state');
if (!storeCore.includes("setStoreJsState('core-ready')")) fail('Store core must leave booting state after core capture handlers attach');
if (!storeCore.includes("setStoreJsState(enhancedRuntimeReady() ? 'ready' : 'core-ready')")) fail('Store core must promote data-store-js to ready when enhanced runtime is loaded');
if (!storeJs.includes("document.documentElement.setAttribute('data-store-js', 'ready')")) fail('Store enhanced runtime must mark data-store-js ready after handlers attach');
if (!storeCss.includes("html[data-store-js='booting'] [data-store-open-preview]")) fail('Store CSS missing booting-only preview pointer gate');
if (/data-store-open-preview[^{]*\{[^}]*pointer-events:\s*none/s.test(storeCss.replace(/html\[data-store-js='booting'\] \[data-store-open-preview\]\s*\{[^}]*\}/g, ''))) {
  fail('[data-store-open-preview] must not be permanently pointer-disabled');
}
if (!/<a\b[^>]*href=(['"])[^'"]+\1[^>]*data-store-open-preview=/i.test(storeHtml)) {
  fail('Store product preview triggers must remain real anchors with href fallback');
}
if (!storeJs.includes('function onStorePreviewTrigger(event)')) fail('Store runtime missing delegated preview click interceptor');
if (!/function onStorePreviewTrigger\(event\)[\s\S]*?isModifiedPreviewActivation\(event\)[\s\S]*?event\.preventDefault\(\)[\s\S]*?openStorePreviewFromTrigger/m.test(storeJs)) {
  fail('Preview click interceptor must preserve modifier clicks, prevent default standard clicks, and open preview');
}
if (!/function onStorePreviewTriggerKeydown\(event\)[\s\S]*?event\.key !== 'Enter'[\s\S]*?event\.key !== ' '[\s\S]*?event\.preventDefault\(\)[\s\S]*?openStorePreviewFromTrigger/m.test(storeJs)) {
  fail('Preview keyboard interceptor must handle Enter and Space');
}
if (count(storeJs, "grid.addEventListener('click', onStorePreviewTrigger)") !== 1) fail('Preview click interceptor must bind once on stable grid container');

for (const [label, source] of [
  ['src/css/components/gg-preview-frame.css', previewFrame],
  ['src/css/gg-app.source.css generated preview frame', generatedBlock(appCss, 'gg-preview-frame')],
  ['src/store/store.css generated preview frame', generatedBlock(storeCss, 'gg-preview-frame')],
]) {
  if (!source) {
    fail(`${label} missing generated preview frame`);
    continue;
  }
  if (/\.gg-preview__sheet,\s*\.store-preview-sheet\s+\.gg-sheet__panel\s*\{[\s\S]*?overflow:\s*auto\s*;/m.test(source)) fail(`${label} must not use overflow:auto on preview panel`);
  if (!source.includes('overflow-x: clip')) fail(`${label} missing overflow-x:clip`);
  if (!source.includes('overflow-x: hidden')) fail(`${label} missing overflow-x fallback`);
  const heroBlock = (source.match(/\.gg-preview__hero,\s*\.store-preview__hero\s*\{[\s\S]*?\}/m) || [])[0] || '';
  if (!heroBlock) {
    fail(`${label} missing shared preview hero/store preview hero rule`);
  } else {
    if (!heroBlock.includes('aspect-ratio: var(--gg-preview-hero-aspect)')) {
      fail(`${label} preview hero must use aspect-ratio: var(--gg-preview-hero-aspect)`);
    }
    if (heroBlock.includes('aspect-ratio: auto')) {
      fail(`${label} preview hero must not keep stale aspect-ratio:auto`);
    }
    if (!/height:\s*auto\b/m.test(heroBlock)) {
      fail(`${label} preview hero should keep height:auto so aspect ratio can define the visual frame`);
    }
    if (!/max-height:\s*(?:var\(--gg-preview-hero-viewport-cap|var\(--gg-preview-hero-max-height|min\()/m.test(heroBlock)) {
      fail(`${label} preview hero must keep a viewport-safe max-height cap`);
    }
    if (!heroBlock.includes('overflow: hidden')) {
      fail(`${label} preview hero must clip overflowing media`);
    }
  }
  if (!source.includes('margin-top: calc(-1 * var(--gg-preview-content-lift))')) fail(`${label} missing root preview content lift`);
  if (!source.includes('margin-top: calc(-1 * var(--gg-preview-store-content-lift))')) fail(`${label} missing Store preview adapter lift`);
}
for (const [label, source] of [['visual tokens', visualTokens], ['src/css/modules/tokens.css', read('src/css/modules/tokens.css')], ['src/store/store.css', storeCss]]) {
  if (!source.includes('--gg-preview-hero-height: clamp(300px, 50dvh, 500px)')) fail(`${label} missing refined preview hero token`);
  if (!source.includes('--gg-preview-content-lift: clamp(56px, 10vw, 88px)')) fail(`${label} missing compact root preview lift token`);
  if (!source.includes('--gg-preview-store-content-lift: clamp(48px, 9vw, 76px)')) fail(`${label} missing compact Store preview lift token`);
  if (/--gg-preview-overlay-lift:\s*clamp\(108px,\s*18vw,\s*148px\)/.test(source)) fail(`${label} still has old aggressive preview lift`);
}
if (/\.store-preview-sheet\s+\.gg-sheet__panel\s*\{/m.test(storeManualCss)) fail('Store CSS still has local preview panel frame override outside generated source');
if (/\.store-preview__hero\s*\{[\s\S]*?--gg-preview-panel-(?:initial|max)-height/m.test(storeCss)) fail('Store preview hero still uses panel height tokens');

for (const [label, source] of [['src/css/gg-app.source.css', appCss], ['src/store/store.css', storeCss], ['src/store/store.critical.css', storeCritical], ['store.html inline critical CSS', inlineCritical]]) {
  for (const stale of ['100vw - 12px', '--gg-panel-handle-width: 62px', '--gg-panel-handle-height: 3px', 'calc(100% - 66px)']) {
    if (source.includes(stale)) fail(`${label} contains stale regression pattern: ${stale}`);
  }
  if (!source.includes('--gg-attached-outline-width')) fail(`${label} must preserve attached outline token`);
}
if (packageJsonText.includes('playwright') || packageJsonText.includes('puppeteer') || packageJsonText.includes('selenium') || packageJsonText.includes('cypress')) {
  fail('package.json must not add heavy browser automation');
}
if (packageJson.scripts?.['gaga:verify-store-modal-preview'] !== 'node qa/store-modal-preview-reliability-guard.mjs') {
  fail('package.json missing gaga:verify-store-modal-preview script');
}
if (!String(packageJson.scripts?.['ci:qa'] || '').includes('npm run gaga:verify-store-modal-preview')) {
  fail('ci:qa must include store modal preview guard');
}
if (!exists('qa/sheet-runtime-overflow-viewport-guard.mjs')) {
  fail('runtime overflow guard should remain present');
}

if (failures.length) {
  console.error('STORE MODAL PREVIEW RELIABILITY GUARD FAIL');
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('STORE MODAL PREVIEW RELIABILITY GUARD PASS');
