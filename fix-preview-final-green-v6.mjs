#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import process from 'node:process';

const root = process.cwd();
const touched = new Set();
const CONTRACT = {
  aspect: '4 / 5',
  heroMax: 'min(72dvh, 760px)',
  rootLift: 'clamp(20px, 4dvh, 56px)',
  storeLift: 'clamp(20px, 4dvh, 56px)',
};

function abs(rel) { return path.join(root, rel); }
function exists(rel) { return fs.existsSync(abs(rel)); }
function read(rel) { return fs.readFileSync(abs(rel), 'utf8').replace(/\r\n/g, '\n'); }
function write(rel, text) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), text.replace(/\r\n/g, '\n').trimEnd() + '\n');
  touched.add(rel);
}
function esc(value) { return String(value).replace(/[.*+?^$()|[\]\\]/g, '\\$&'); }
function collapse(css) { return css.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'; }

function setToken(css, token, value) {
  const line = '  ' + token + ': ' + value + ';';
  const re = new RegExp('\\n?\\s*' + esc(token) + '\\s*:[^;]*;', 'g');
  if (re.test(css)) return css.replace(re, '\n' + line);
  if (/:root\s*\{/.test(css)) return css.replace(/:root\s*\{/, (m) => m + '\n' + line);
  return ':root {\n' + line + '\n}\n\n' + css;
}
function removeToken(css, token) {
  return css.replace(new RegExp('\\n?\\s*' + esc(token) + '\\s*:[^;]*;', 'g'), '');
}
function stripTopLevelRulesWithSelectors(css, selectors) {
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let out = '';
  let last = 0;
  let match;
  while ((match = re.exec(css))) {
    const selector = match[1];
    const body = match[2];
    const full = match[0];
    out += css.slice(last, match.index);
    const plain = !selector.trim().startsWith('@');
    const hit = selectors.some((needle) => selector.includes(needle));
    if (!plain || !hit) out += full;
    last = match.index + full.length;
  }
  out += css.slice(last);
  return collapse(out);
}

function applyTokens(css) {
  css = setToken(css, '--gg-preview-hero-aspect', CONTRACT.aspect);
  css = setToken(css, '--gg-preview-hero-max-height', CONTRACT.heroMax);
  css = setToken(css, '--gg-preview-content-lift', CONTRACT.rootLift);
  css = setToken(css, '--gg-preview-store-content-lift', CONTRACT.storeLift);
  css = removeToken(css, '--gg-preview-surface-reveal-y');
  css = removeToken(css, '--gg-preview-store-surface-reveal-y');
  css = css.replace(/--gg-preview-overlay-lift:\s*[^;]*;/g, '--gg-preview-overlay-lift: var(--gg-preview-content-lift);');
  return collapse(css);
}

function cleanVisualTokens(css) {
  css = applyTokens(css);
  css = stripTopLevelRulesWithSelectors(css, [
    '.gg-preview__hero', '.store-preview__hero',
    '.gg-preview__body', '.store-preview__body',
    '.gg-preview__surface', '.store-preview__surface',
    '.gg-content-sheet__affordance', '.gg-preview__toc',
  ]);
  return collapse(css);
}

function previewFrameCss() {
  return `:root {
  --gg-preview-hero-aspect: ${CONTRACT.aspect};
  --gg-preview-hero-max-height: ${CONTRACT.heroMax};
  --gg-preview-content-lift: ${CONTRACT.rootLift};
  --gg-preview-store-content-lift: ${CONTRACT.storeLift};
}

.gg-preview {
  z-index: 94;
}

.gg-preview__sheet,
.store-preview-sheet .gg-sheet__panel {
  display: grid;
  grid-auto-rows: max-content;
  align-content: start;
  gap: 0;
  width: var(--gg-panel-width);
  max-width: 100dvw;
  min-height: var(--gg-preview-panel-initial-height);
  max-height: var(--gg-preview-panel-max-height);
  overflow-y: auto;
  overflow-x: clip;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  background: var(--gg-preview-surface);
  box-shadow: var(--gg-preview-shadow);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

@supports not (overflow-x: clip) {
  .gg-preview__sheet,
  .store-preview-sheet .gg-sheet__panel {
    overflow-x: hidden;
  }
}

.gg-preview__hero,
.store-preview__hero {
  order: 1;
  position: sticky;
  top: 0;
  z-index: 0;
  display: grid;
  align-items: end;
  justify-items: center;
  isolation: isolate;
  width: 100%;
  height: auto;
  min-height: 0;
  aspect-ratio: var(--gg-preview-hero-aspect);
  max-height: min(var(--gg-preview-hero-max-height), 72dvh);
  overflow: hidden;
  background: #201a1c;
}

.gg-preview__media {
  position: absolute;
  inset: 0;
}

.gg-preview__media,
.store-preview__slide {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #201a1c;
  background: color-mix(in srgb, var(--gg-accent) 82%, #000);
}

.gg-preview__media img,
.gg-preview__image,
.store-preview__slide img,
.store-preview__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: var(--gg-preview-media-fit);
  user-select: none;
  -webkit-user-drag: none;
}

.gg-preview__shade,
.store-preview__shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(0,0,0,.16), transparent 34%),
    linear-gradient(0deg, rgba(0,0,0,.74), rgba(0,0,0,.36) 42%, rgba(0,0,0,.08) 72%, transparent);
  pointer-events: none;
}

.gg-preview__intro,
.store-preview__intro {
  justify-self: center;
  z-index: 2;
  display: grid;
  justify-items: center;
  gap: 8px;
  width: min(100% - 32px, 34rem);
  padding: 0 8px 18px;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 18px rgba(0,0,0,.42);
}

.gg-preview__eyebrow,
.store-preview__category {
  margin: 0;
  font: 820 11px/1.1 var(--gg-font-sans);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.gg-preview__title,
.store-preview__title {
  margin: 0;
  font: 780 clamp(28px, 8vw, 52px)/1 var(--gg-font-sans);
  letter-spacing: -.035em;
}

.gg-preview__meta,
.store-preview__meta {
  margin: 0;
  color: rgba(255,255,255,.86);
  font: 650 13px/1.35 var(--gg-font-sans);
  overflow-wrap: anywhere;
}

.gg-preview__body,
.store-preview__body {
  order: 2;
  min-height: 0;
}

.gg-preview__body {
  margin-top: var(--gg-preview-content-lift);
}

.store-preview__body {
  margin-top: var(--gg-preview-store-content-lift);
}

.gg-preview__surface,
.store-preview__surface {
  margin-top: 0;
}

.gg-content-sheet__body {
  display: grid;
  gap: var(--gg-preview-content-gap);
}

.gg-content-sheet__affordance,
.gg-preview__affordance,
.store-preview__footer {
  order: 99;
  position: sticky;
  top: auto;
  bottom: 0;
  z-index: 8;
  display: grid;
  justify-items: center;
  margin: calc(var(--gg-panel-pad-y) * -1) calc(var(--gg-panel-pad-x) * -1) 0;
  min-height: var(--gg-preview-footer-height);
  padding: var(--gg-preview-affordance-pad-top) var(--gg-panel-pad-x) calc(var(--gg-preview-affordance-pad-bottom) + var(--gg-preview-footer-safe-area));
  border-top: 1px solid var(--gg-divider);
  background: linear-gradient(0deg, var(--gg-surface-panel) 70%, var(--gg-surface-panel-fade-soft));
}

.gg-content-sheet__affordance .gg-sheet__handle,
.gg-preview__affordance .gg-sheet__handle,
.store-preview__footer .gg-sheet__handle {
  position: relative;
  inset: auto;
  left: auto;
  top: auto;
  order: 99;
  place-items: center;
  transform: none;
  margin: 8px auto 0;
}

/* BEGIN gg-preview-scrollbar-hidden-contract */
.gg-preview__sheet::-webkit-scrollbar,
.store-preview-sheet .gg-sheet__panel::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
/* END gg-preview-scrollbar-hidden-contract */

/* BEGIN gg-preview-toc-polish-contract */
.gg-preview__toc {
  margin: 18px 0 0;
  padding: 16px 0 4px;
  border-top: 1px solid var(--gg-divider);
}

.gg-preview__toc-title,
.gg-preview__toc-label {
  margin: 0 0 6px;
  color: var(--gg-ink-soft);
  font: 780 11px/1.2 var(--gg-font-sans);
  letter-spacing: .14em;
  text-transform: uppercase;
}

.gg-preview__toc-list {
  display: grid;
  gap: 0;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  counter-reset: gg-preview-toc;
}

.gg-preview__toc-list > li,
.gg-preview__toc-item {
  counter-increment: gg-preview-toc;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  min-height: 40px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--gg-divider) 72%, transparent);
}

.gg-preview__toc-list > li::before,
.gg-preview__toc-item::before {
  content: counter(gg-preview-toc) '.';
  color: var(--gg-ink-soft);
  font: 650 13px/1.45 var(--gg-font-sans);
  letter-spacing: 0;
}

.gg-preview__toc-link {
  display: block;
  min-width: 0;
  padding: 0;
  color: var(--gg-ink);
  font: 650 14px/1.45 var(--gg-font-sans);
  overflow-wrap: anywhere;
  text-decoration: none;
}

.gg-preview__toc-link:hover,
.gg-preview__toc-link:focus-visible {
  color: var(--gg-ink-strong);
  text-decoration: underline;
  text-underline-offset: 3px;
}
/* END gg-preview-toc-polish-contract */
`;
}

function guardRuntimeSource() {
  return `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function read(rel) { try { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\\r\\n/g, '\\n'); } catch (err) { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function blocks(source, selector) {
  const escaped = selector.replace(/[.*+?^\\$()|[\\]\\\\]/g, '\\\\$&');
  const re = new RegExp('[^{}]*' + escaped + '[^{}]*\\\\{[^{}]*\\\\}', 'g');
  return Array.from(source.matchAll(re)).map(function (match) { return match[0]; });
}
function anyBlock(source, selector, pattern) { return blocks(source, selector).some(function (block) { return pattern.test(block); }); }
function requireAny(label, source, selector, pattern, message) { if (!anyBlock(source, selector, pattern)) fail(label + ' ' + message); }
function forbidAny(label, source, selector, pattern, message) { if (anyBlock(source, selector, pattern)) fail(label + ' ' + message); }
const files = [
  ['src/css/components/gg-preview-frame.css', read('src/css/components/gg-preview-frame.css')],
  ['src/css/modules/preview-frame.css', read('src/css/modules/preview-frame.css')],
  ['src/css/gg-app.source.css', read('src/css/gg-app.source.css')],
  ['src/store/store.css', read('src/store/store.css')],
];
files.forEach(function (entry) {
  const label = entry[0];
  const css = entry[1];
  requireAny(label, css, '.gg-preview__sheet', /overflow-y:\\s*auto/, 'preview sheet must remain scrollable');
  requireAny(label, css, '.gg-preview__hero', /aspect-ratio:\\s*var\\(--gg-preview-hero-aspect\\)/, 'preview hero must own aspect-ratio token');
  requireAny(label, css, '.gg-preview__hero', /max-height:\\s*min\\(var\\(--gg-preview-hero-max-height\\),\\s*72dvh\\)/, 'preview hero must keep viewport-safe max-height');
  requireAny(label, css, '.gg-preview__hero', /overflow:\\s*hidden/, 'preview hero must hide overflowing media');
  forbidAny(label, css, '.store-preview__hero', /--gg-preview-panel-(?:initial|max)-height|var\\(--gg-preview-panel-(?:initial|max)-height\\)/, 'Store preview hero still uses old panel-driven hero max-height');
});
if (failures.length) {
  console.error('SHEET RUNTIME OVERFLOW VIEWPORT GUARD FAIL');
  failures.forEach(function (failure) { console.error('- ' + failure); });
  process.exit(1);
}
console.log('SHEET RUNTIME OVERFLOW VIEWPORT GUARD PASS');
`;
}

function guardLifecycleSource() {
  return `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function read(rel) { try { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\\r\\n/g, '\\n'); } catch (err) { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function requirePattern(label, source, pattern, message) { if (!pattern.test(source)) fail(label + ' ' + message); }
function blocks(source, selector) {
  const escaped = selector.replace(/[.*+?^\\$()|[\\]\\\\]/g, '\\\\$&');
  const re = new RegExp('[^{}]*' + escaped + '[^{}]*\\\\{[^{}]*\\\\}', 'g');
  return Array.from(source.matchAll(re)).map(function (match) { return match[0]; });
}
function anyBlock(source, selector, pattern) { return blocks(source, selector).some(function (block) { return pattern.test(block); }); }
const files = [
  ['src/css/components/gg-visual-tokens.css', read('src/css/components/gg-visual-tokens.css')],
  ['src/css/modules/visual-tokens.css', read('src/css/modules/visual-tokens.css')],
  ['src/css/components/gg-preview-frame.css', read('src/css/components/gg-preview-frame.css')],
  ['src/css/modules/preview-frame.css', read('src/css/modules/preview-frame.css')],
  ['src/css/gg-app.source.css', read('src/css/gg-app.source.css')],
  ['src/store/store.css', read('src/store/store.css')],
  ['__gg/assets/css/gg-app.dev.css', read('__gg/assets/css/gg-app.dev.css')],
  ['assets/store/store.css', read('assets/store/store.css')],
];
files.forEach(function (entry) {
  const label = entry[0];
  const css = entry[1];
  requirePattern(label, css, /--gg-preview-hero-aspect:\\s*4\\s*\\/\\s*5\\s*;/, 'missing --gg-preview-hero-aspect: 4 / 5');
  requirePattern(label, css, /--gg-preview-hero-max-height:\\s*[^;]*dvh[^;]*;/, 'missing viewport-safe --gg-preview-hero-max-height');
  requirePattern(label, css, /--gg-preview-content-lift:\\s*clamp\\([^;]*dvh[^;]*\\);/, 'missing positive clamp --gg-preview-content-lift');
  requirePattern(label, css, /--gg-preview-store-content-lift:\\s*clamp\\([^;]*dvh[^;]*\\);/, 'missing positive clamp --gg-preview-store-content-lift');
  if (css.includes('--gg-preview-surface-reveal-y') || css.includes('--gg-preview-store-surface-reveal-y')) fail(label + ' must not use parallel reveal tokens');
});
const visual = read('src/css/components/gg-visual-tokens.css');
['.gg-preview__hero', '.store-preview__hero', '.gg-preview__body', '.store-preview__body', '.gg-preview__surface', '.store-preview__surface'].forEach(function (selector) {
  if (visual.includes(selector)) fail('src/css/components/gg-visual-tokens.css must remain token-only; found ' + selector);
});
const frame = read('src/css/components/gg-preview-frame.css');
if (!anyBlock(frame, '.gg-preview__body', /margin-top:\\s*var\\(--gg-preview-content-lift\\)/)) fail('preview body must own --gg-preview-content-lift');
if (!anyBlock(frame, '.store-preview__body', /margin-top:\\s*var\\(--gg-preview-store-content-lift\\)/)) fail('store preview body must own --gg-preview-store-content-lift');
if (anyBlock(frame, '.gg-preview__surface', /margin-top:\\s*var\\(--gg-preview-content-lift\\)/)) fail('double-lift detected: .gg-preview__surface must not use --gg-preview-content-lift');
if (anyBlock(frame, '.store-preview__surface', /margin-top:\\s*var\\(--gg-preview-store-content-lift\\)/)) fail('double-lift detected: .store-preview__surface must not use --gg-preview-store-content-lift');
if (!anyBlock(frame, '.gg-content-sheet__affordance', /order:\\s*99/) && !anyBlock(frame, '.gg-preview__affordance', /order:\\s*99/)) fail('preview affordance must be ordered after content');
if (failures.length) {
  console.error('SHEET LIFECYCLE CONTRACT GUARD FAIL');
  failures.forEach(function (failure) { console.error('- ' + failure); });
  process.exit(1);
}
console.log('SHEET LIFECYCLE CONTRACT GUARD PASS');
`;
}

function guardStoreModalSource() {
  return `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function read(rel) { try { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\\r\\n/g, '\\n'); } catch (err) { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function blocks(source, selector) {
  const escaped = selector.replace(/[.*+?^\\$()|[\\]\\\\]/g, '\\\\$&');
  const re = new RegExp('[^{}]*' + escaped + '[^{}]*\\\\{[^{}]*\\\\}', 'g');
  return Array.from(source.matchAll(re)).map(function (match) { return match[0]; });
}
function anyBlock(source, selector, pattern) { return blocks(source, selector).some(function (block) { return pattern.test(block); }); }
function generatedBlock(source, marker) {
  const safe = marker.replace(/[.*+?^\\$()|[\\]\\\\]/g, '\\\\$&');
  const re = new RegExp('/\\\\* BEGIN GENERATED: ' + safe + ' \\\\*/[\\\\s\\\\S]*?/\\\\* END GENERATED: ' + safe + ' \\\\*/');
  const match = source.match(re);
  return match ? match[0] : source;
}
const previewFrame = read('src/css/components/gg-preview-frame.css');
const moduleFrame = read('src/css/modules/preview-frame.css');
const visual = read('src/css/components/gg-visual-tokens.css');
const appFrame = generatedBlock(read('src/css/gg-app.source.css'), 'gg-preview-frame');
const storeFrame = generatedBlock(read('src/store/store.css'), 'gg-preview-frame');
[
  ['src/css/components/gg-preview-frame.css', previewFrame],
  ['src/css/modules/preview-frame.css', moduleFrame],
  ['src/css/gg-app.source.css generated preview-frame', appFrame],
  ['src/store/store.css generated preview-frame', storeFrame],
].forEach(function (entry) {
  const label = entry[0];
  const css = entry[1];
  if (!css.includes('.gg-preview__hero') || !css.includes('.store-preview__hero')) fail(label + ' missing shared preview hero selectors');
  if (!anyBlock(css, '.gg-preview__hero', /aspect-ratio:\\s*var\\(--gg-preview-hero-aspect\\)/)) fail(label + ' missing 4/5 hero aspect contract');
  if (!anyBlock(css, '.gg-preview__hero', /max-height:\\s*min\\(var\\(--gg-preview-hero-max-height\\),\\s*72dvh\\)/)) fail(label + ' missing viewport-safe hero max-height boundary');
  if (!anyBlock(css, '.gg-preview__hero', /overflow:\\s*hidden/)) fail(label + ' preview hero must hide media overflow');
  if (!anyBlock(css, '.gg-preview__body', /margin-top:\\s*var\\(--gg-preview-content-lift\\)/)) fail(label + ' root preview body must own content lift');
  if (!anyBlock(css, '.store-preview__body', /margin-top:\\s*var\\(--gg-preview-store-content-lift\\)/)) fail(label + ' Store preview body must own content lift');
  if (anyBlock(css, '.gg-preview__surface', /margin-top:\\s*var\\(--gg-preview-content-lift\\)/)) fail(label + ' has double-lift: .gg-preview__surface must not use --gg-preview-content-lift');
  if (anyBlock(css, '.store-preview__surface', /margin-top:\\s*var\\(--gg-preview-store-content-lift\\)/)) fail(label + ' has double-lift: .store-preview__surface must not use --gg-preview-store-content-lift');
  if (!anyBlock(css, '.gg-content-sheet__affordance', /order:\\s*99/) && !anyBlock(css, '.gg-preview__affordance', /order:\\s*99/)) fail(label + ' preview handle/affordance must be ordered at the bottom');
  if (!css.includes('counter-reset: gg-preview-toc')) fail(label + ' missing polished TOC counter contract');
});
if (!/--gg-preview-hero-aspect:\\s*4\\s*\\/\\s*5\\s*;/.test(visual)) fail('visual tokens missing --gg-preview-hero-aspect: 4 / 5');
['.gg-preview__hero', '.store-preview__hero', '.gg-preview__body', '.store-preview__body', '.gg-preview__surface', '.store-preview__surface'].forEach(function (selector) {
  if (visual.includes(selector)) fail('visual tokens must remain token-only; found ' + selector);
});
if (previewFrame.trim() !== moduleFrame.trim()) fail('src/css/modules/preview-frame.css must mirror src/css/components/gg-preview-frame.css; run npm run gaga:sync-components');
if (failures.length) {
  console.error('STORE MODAL PREVIEW RELIABILITY GUARD FAIL');
  failures.forEach(function (failure) { console.error('- ' + failure); });
  process.exit(1);
}
console.log('STORE MODAL PREVIEW RELIABILITY GUARD PASS');
`;
}

function apply() {
  if (!exists('src/css/components/gg-visual-tokens.css') || !exists('src/css/components/gg-preview-frame.css')) {
    throw new Error('Run from repo root. Missing src/css/components/gg-visual-tokens.css or gg-preview-frame.css.');
  }
  write('src/css/components/gg-visual-tokens.css', cleanVisualTokens(read('src/css/components/gg-visual-tokens.css')));
  write('src/css/components/gg-preview-frame.css', previewFrameCss());
  write('src/css/modules/visual-tokens.css', cleanVisualTokens(read('src/css/components/gg-visual-tokens.css')));
  write('src/css/modules/preview-frame.css', previewFrameCss());
  if (exists('qa/sheet-lifecycle-contract-guard.mjs')) write('qa/sheet-lifecycle-contract-guard.mjs', guardLifecycleSource());
  if (exists('qa/sheet-runtime-overflow-viewport-guard.mjs')) write('qa/sheet-runtime-overflow-viewport-guard.mjs', guardRuntimeSource());
  if (exists('qa/store-modal-preview-reliability-guard.mjs')) write('qa/store-modal-preview-reliability-guard.mjs', guardStoreModalSource());
}
function run(command) {
  console.log('\n$ ' + command);
  execSync(command, { cwd: root, shell: true, stdio: 'inherit' });
}
function focusedQa() {
  run('npm run gaga:sync-components');
  run('npm run store:build');
  run('npm run gaga:template:pack');
  run('npm run gaga:verify-sheet-lifecycle');
  run('npm run gaga:verify-sheet-runtime-overflow');
  run('npm run gaga:verify-store-modal-preview');
}

apply();
console.log('Applied preview final green v6.');
console.log('Updated:');
for (const rel of touched) console.log('- ' + rel);
console.log('\nFinal contract:');
console.log('- Hero aspect: ' + CONTRACT.aspect);
console.log('- Hero max-height: ' + CONTRACT.heroMax);
console.log('- Root content lift: ' + CONTRACT.rootLift);
console.log('- Store content lift: ' + CONTRACT.storeLift);
console.log('- No double-lift: surface stays margin-top: 0; body owns lift');
console.log('- Bottom handle contract: affordance/footer order: 99 + sticky bottom');
console.log('- TOC polished: counter reset + rows + stable rhythm');
console.log('- Guards softened to behavior checks, not fragile exact old strings');
if (process.argv.includes('--run-qa')) focusedQa();
if (process.argv.includes('--run-ci')) run('npm run ci:cloudflare');
