#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const args = new Set(process.argv.slice(2));

const CONTRACT = {
  heroAspect: '4 / 5',
  heroMaxHeight: 'min(72dvh, 760px)',
  contentLift: 'clamp(28px, 5dvh, 64px)',
  storeContentLift: 'clamp(28px, 5dvh, 64px)',
};

const PREVIEW_FRAME_CSS = `:root {
  --gg-preview-hero-aspect: ${CONTRACT.heroAspect};
  --gg-preview-hero-max-height: ${CONTRACT.heroMaxHeight};
  --gg-preview-content-lift: ${CONTRACT.contentLift};
  --gg-preview-store-content-lift: ${CONTRACT.storeContentLift};
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
    linear-gradient(180deg, rgba(0,0,0,.14), transparent 34%),
    linear-gradient(0deg, rgba(0,0,0,.72), rgba(0,0,0,.36) 42%, rgba(0,0,0,.08) 72%, transparent);
  pointer-events: none;
}

.gg-preview__intro,
.store-preview__intro {
  align-self: end;
  justify-self: center;
  z-index: 2;
  display: grid;
  justify-items: center;
  gap: 8px;
  width: min(100% - 32px, 34rem);
  padding: 0 8px calc(var(--gg-preview-content-lift) + 18px);
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 18px rgba(0,0,0,.42);
}

.store-preview__intro {
  padding-bottom: calc(var(--gg-preview-store-content-lift) + 18px);
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
  position: relative;
  z-index: 2;
  min-height: 0;
}

.gg-preview__body {
  margin-top: calc(var(--gg-preview-content-lift) * -1);
}

.store-preview__body {
  margin-top: calc(var(--gg-preview-store-content-lift) * -1);
}

.gg-preview__surface,
.store-preview__surface {
  margin-top: 0;
  padding: clamp(20px, 4.8vw, 30px) clamp(24px, 5.6vw, 34px) clamp(18px, 4vw, 28px);
  border-radius: clamp(24px, 5.6vw, 34px) clamp(24px, 5.6vw, 34px) 0 0;
  background: var(--gg-preview-surface);
  box-shadow: 0 -10px 28px rgba(0,0,0,.08);
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
  margin: 0 calc(var(--gg-panel-pad-x) * -1) 0;
  min-height: var(--gg-preview-footer-height);
  padding: var(--gg-preview-affordance-pad-top) var(--gg-panel-pad-x) calc(var(--gg-preview-affordance-pad-bottom) + var(--gg-preview-footer-safe-area));
  border-top: 1px solid var(--gg-divider);
  background: linear-gradient(0deg, var(--gg-surface-panel) 74%, var(--gg-surface-panel-fade-soft));
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
  display: grid;
  gap: 12px;
  margin: 18px 0 0;
  padding: 16px 0 4px;
  border-top: 1px solid var(--gg-divider);
}

.gg-preview__toc-title,
.gg-preview__toc-label,
.gg-preview__section-title {
  margin: 0;
  color: var(--gg-ink-soft);
  font: 780 11px/1.2 var(--gg-font-sans);
  letter-spacing: .14em;
  text-align: center;
  text-transform: uppercase;
}

.gg-preview__toc-list {
  display: grid;
  gap: 0;
  margin: 0;
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
  padding: 9px 0;
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

const SHEET_LIFECYCLE_GUARD = String.raw`#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function normalize(text) { return text.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)).split(String.fromCharCode(13)).join(String.fromCharCode(10)); }
function read(rel) { try { return normalize(fs.readFileSync(path.join(root, rel), 'utf8')); } catch (err) { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function requirePattern(label, source, pattern, message) { if (!pattern.test(source)) fail(label + ' ' + message); }
function blocks(source, selector) {
  const escaped = selector.replace(/[.*+?^\\$()|[\]\\]/g, '\\$&');
  const re = new RegExp('[^{}]*' + escaped + '[^{}]*\\{[^{}]*\\}', 'g');
  return Array.from(source.matchAll(re)).map((match) => match[0]);
}
function anyBlock(source, selector, pattern) { return blocks(source, selector).some((block) => pattern.test(block)); }
function hasPreviewLift(source, selector, token) {
  return anyBlock(source, selector, new RegExp('margin-top:\\s*(?:calc\\(\\s*)?var\\(' + token.replace(/[.*+?^\\$()|[\]\\]/g, '\\$&') + '\\)'));
}
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
files.forEach(([label, css]) => {
  requirePattern(label, css, /--gg-preview-hero-aspect:\s*4\s*\/\s*5\s*;/, 'missing --gg-preview-hero-aspect: 4 / 5');
  requirePattern(label, css, /--gg-preview-hero-max-height:\s*[^;]*dvh[^;]*;/, 'missing viewport-safe --gg-preview-hero-max-height');
  requirePattern(label, css, /--gg-preview-content-lift:\s*clamp\([^;]*dvh[^;]*\);/, 'missing clamp --gg-preview-content-lift');
  requirePattern(label, css, /--gg-preview-store-content-lift:\s*clamp\([^;]*dvh[^;]*\);/, 'missing clamp --gg-preview-store-content-lift');
  if (css.includes('--gg-preview-surface-reveal-y') || css.includes('--gg-preview-store-surface-reveal-y')) fail(label + ' must not use parallel reveal tokens');
});
const visual = read('src/css/components/gg-visual-tokens.css');
['.gg-preview__hero', '.store-preview__hero', '.gg-preview__body', '.store-preview__body', '.gg-preview__surface', '.store-preview__surface'].forEach((selector) => {
  if (visual.includes(selector)) fail('src/css/components/gg-visual-tokens.css must remain token-only; found ' + selector);
});
const frame = read('src/css/components/gg-preview-frame.css');
if (!hasPreviewLift(frame, '.gg-preview__body', '--gg-preview-content-lift')) fail('preview body must own --gg-preview-content-lift');
if (!hasPreviewLift(frame, '.store-preview__body', '--gg-preview-store-content-lift')) fail('store preview body must own --gg-preview-store-content-lift');
if (anyBlock(frame, '.gg-preview__surface', /margin-top:\s*var\(--gg-preview-content-lift\)/)) fail('double-lift detected: .gg-preview__surface must not use --gg-preview-content-lift');
if (anyBlock(frame, '.store-preview__surface', /margin-top:\s*var\(--gg-preview-store-content-lift\)/)) fail('double-lift detected: .store-preview__surface must not use --gg-preview-store-content-lift');
if (!anyBlock(frame, '.gg-preview__surface', /border-radius:/)) fail('preview content surface must keep rounded card overlay');
if (!anyBlock(frame, '.gg-content-sheet__affordance', /order:\s*99/) && !anyBlock(frame, '.gg-preview__affordance', /order:\s*99/)) fail('preview affordance must be ordered after content');
if (failures.length) {
  console.error('SHEET LIFECYCLE CONTRACT GUARD FAIL');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}
console.log('SHEET LIFECYCLE CONTRACT GUARD PASS');
`;

const RUNTIME_OVERFLOW_GUARD = String.raw`#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function normalize(text) { return text.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)).split(String.fromCharCode(13)).join(String.fromCharCode(10)); }
function read(rel) { try { return normalize(fs.readFileSync(path.join(root, rel), 'utf8')); } catch (err) { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function blocks(source, selector) {
  const escaped = selector.replace(/[.*+?^\\$()|[\]\\]/g, '\\$&');
  const re = new RegExp('[^{}]*' + escaped + '[^{}]*\\{[^{}]*\\}', 'g');
  return Array.from(source.matchAll(re)).map((match) => match[0]);
}
function anyBlock(source, selector, pattern) { return blocks(source, selector).some((block) => pattern.test(block)); }
function requireAny(label, source, selector, pattern, message) { if (!anyBlock(source, selector, pattern)) fail(label + ' ' + message); }
function forbidAny(label, source, selector, pattern, message) { if (anyBlock(source, selector, pattern)) fail(label + ' ' + message); }
const files = [
  ['src/css/components/gg-preview-frame.css', read('src/css/components/gg-preview-frame.css')],
  ['src/css/modules/preview-frame.css', read('src/css/modules/preview-frame.css')],
  ['src/css/gg-app.source.css', read('src/css/gg-app.source.css')],
  ['src/store/store.css', read('src/store/store.css')],
];
files.forEach(([label, css]) => {
  requireAny(label, css, '.gg-preview__sheet', /overflow-y:\s*auto/, 'preview sheet must remain scrollable');
  requireAny(label, css, '.gg-preview__hero', /aspect-ratio:\s*var\(--gg-preview-hero-aspect\)/, 'preview hero must own aspect-ratio token');
  requireAny(label, css, '.gg-preview__hero', /max-height:\s*min\(var\(--gg-preview-hero-max-height\),\s*72dvh\)/, 'preview hero must keep viewport-safe max-height');
  requireAny(label, css, '.gg-preview__hero', /overflow:\s*hidden/, 'preview hero must hide overflowing media');
  requireAny(label, css, '.gg-preview__body', /margin-top:\s*calc\(var\(--gg-preview-content-lift\)\s*\*\s*-1\)/, 'preview body must lift the rounded card over the hero, not create blank space');
  forbidAny(label, css, '.store-preview__hero', /--gg-preview-panel-(?:initial|max)-height|var\(--gg-preview-panel-(?:initial|max)-height\)/, 'Store preview hero still uses old panel-driven hero max-height');
});
if (failures.length) {
  console.error('SHEET RUNTIME OVERFLOW VIEWPORT GUARD FAIL');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}
console.log('SHEET RUNTIME OVERFLOW VIEWPORT GUARD PASS');
`;

const STORE_MODAL_GUARD = String.raw`#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function normalize(text) { return text.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)).split(String.fromCharCode(13)).join(String.fromCharCode(10)); }
function read(rel) { try { return normalize(fs.readFileSync(path.join(root, rel), 'utf8')); } catch (err) { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function blocks(source, selector) {
  const escaped = selector.replace(/[.*+?^\\$()|[\]\\]/g, '\\$&');
  const re = new RegExp('[^{}]*' + escaped + '[^{}]*\\{[^{}]*\\}', 'g');
  return Array.from(source.matchAll(re)).map((match) => match[0]);
}
function anyBlock(source, selector, pattern) { return blocks(source, selector).some((block) => pattern.test(block)); }
function generatedBlock(source, marker) {
  const safe = marker.replace(/[.*+?^\\$()|[\]\\]/g, '\\$&');
  const re = new RegExp('/\\* BEGIN GENERATED: ' + safe + ' \\*/[\\s\\S]*?/\\* END GENERATED: ' + safe + ' \\*/');
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
].forEach(([label, css]) => {
  if (!css.includes('.gg-preview__hero') || !css.includes('.store-preview__hero')) fail(label + ' missing shared preview hero selectors');
  if (!anyBlock(css, '.gg-preview__hero', /aspect-ratio:\s*var\(--gg-preview-hero-aspect\)/)) fail(label + ' missing 4/5 hero aspect contract');
  if (!anyBlock(css, '.gg-preview__hero', /max-height:\s*min\(var\(--gg-preview-hero-max-height\),\s*72dvh\)/)) fail(label + ' missing viewport-safe hero max-height boundary');
  if (!anyBlock(css, '.gg-preview__hero', /overflow:\s*hidden/)) fail(label + ' preview hero must hide media overflow');
  if (!anyBlock(css, '.gg-preview__body', /margin-top:\s*calc\(var\(--gg-preview-content-lift\)\s*\*\s*-1\)/)) fail(label + ' root preview body must use content lift as upward card overlap');
  if (!anyBlock(css, '.store-preview__body', /margin-top:\s*calc\(var\(--gg-preview-store-content-lift\)\s*\*\s*-1\)/)) fail(label + ' Store preview body must use content lift as upward card overlap');
  if (anyBlock(css, '.gg-preview__surface', /margin-top:\s*var\(--gg-preview-content-lift\)/)) fail(label + ' has double-lift: .gg-preview__surface must not use --gg-preview-content-lift');
  if (anyBlock(css, '.store-preview__surface', /margin-top:\s*var\(--gg-preview-store-content-lift\)/)) fail(label + ' has double-lift: .store-preview__surface must not use --gg-preview-store-content-lift');
  if (!anyBlock(css, '.gg-preview__surface', /border-radius:/)) fail(label + ' content surface must be a rounded card overlay');
  if (!anyBlock(css, '.gg-preview__surface', /padding:/)) fail(label + ' content surface must own readable padding');
  if (!anyBlock(css, '.gg-content-sheet__affordance', /order:\s*99/) && !anyBlock(css, '.gg-preview__affordance', /order:\s*99/)) fail(label + ' preview handle/affordance must be ordered at the bottom');
  if (!css.includes('counter-reset: gg-preview-toc')) fail(label + ' missing polished TOC counter contract');
});
if (!/--gg-preview-hero-aspect:\s*4\s*\/\s*5\s*;/.test(visual)) fail('visual tokens missing --gg-preview-hero-aspect: 4 / 5');
['.gg-preview__hero', '.store-preview__hero', '.gg-preview__body', '.store-preview__body', '.gg-preview__surface', '.store-preview__surface'].forEach((selector) => {
  if (visual.includes(selector)) fail('visual tokens must remain token-only; found ' + selector);
});
if (previewFrame.trim() !== moduleFrame.trim()) fail('src/css/modules/preview-frame.css must mirror src/css/components/gg-preview-frame.css; run npm run gaga:sync-components');
if (failures.length) {
  console.error('STORE MODAL PREVIEW RELIABILITY GUARD FAIL');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}
console.log('STORE MODAL PREVIEW RELIABILITY GUARD PASS');
`;

function rel(file) { return path.join(root, file); }
function exists(file) { return fs.existsSync(rel(file)); }
function read(file) { return fs.readFileSync(rel(file), 'utf8').replace(/\r\n/g, '\n'); }
function write(file, text) {
  fs.mkdirSync(path.dirname(rel(file)), { recursive: true });
  fs.writeFileSync(rel(file), text.replace(/\r\n/g, '\n'));
}
function replaceToken(css, name, value) {
  const token = `${name}: ${value};`;
  const re = new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*[^;]+;`);
  if (re.test(css)) return css.replace(re, token);
  return css.replace(/:root\s*\{/, `:root {\n  ${token}`);
}
function removeParallelRevealTokens(css) {
  return css
    .replace(/\s*--gg-preview-surface-reveal-y\s*:\s*[^;]+;\n?/g, '')
    .replace(/\s*--gg-preview-store-surface-reveal-y\s*:\s*[^;]+;\n?/g, '');
}
function removeRulesContainingSelectors(css, selectors) {
  const hits = selectors.map((selector) => selector.trim()).filter(Boolean);
  let output = '';
  let cursor = 0;
  const re = /([^{}]+)\{[^{}]*\}/g;
  let match;
  while ((match = re.exec(css))) {
    output += css.slice(cursor, match.index);
    const selectorText = match[1];
    const shouldRemove = hits.some((selector) => selectorText.includes(selector));
    if (!shouldRemove) output += match[0];
    cursor = re.lastIndex;
  }
  output += css.slice(cursor);
  return output.replace(/\n{3,}/g, '\n\n');
}
const VISUAL_TOKEN_FORBIDDEN_SELECTORS = [
  '.gg-preview__hero',
  '.store-preview__hero',
  '.gg-preview__body',
  '.store-preview__body',
  '.gg-preview__surface',
  '.store-preview__surface',
];

function scrubGeneratedPreviewLeaks(css) {
  return css
    .replace(/min-\s*\n\s*max-/g, '')
    .replace(/--gg-preview-hero-max-height\s*:\s*calc\(var\(--gg-preview-panel-max-height\)\s*\*\s*\.62\)\s*;/g, `--gg-preview-hero-max-height: ${CONTRACT.heroMaxHeight};`)
    .replace(/margin-top:\s*var\(--gg-preview-content-lift\)\s*;\s*\n\s*}\s*\n\s*\.store-preview__surface\s*\{\s*\n\s*margin-top:\s*var\(--gg-preview-store-content-lift\)\s*;\s*\n\s*}/g, 'margin-top: 0;\n}\n\n.store-preview__surface {\n  margin-top: 0;\n}');
}
function apply() {
  const changed = [];
  write('src/css/components/gg-preview-frame.css', PREVIEW_FRAME_CSS);
  changed.push('src/css/components/gg-preview-frame.css');
  write('src/css/modules/preview-frame.css', PREVIEW_FRAME_CSS);
  changed.push('src/css/modules/preview-frame.css');

  for (const file of ['src/css/components/gg-visual-tokens.css', 'src/css/modules/visual-tokens.css']) {
    if (!exists(file)) continue;
    let css = read(file);
    css = removeParallelRevealTokens(css);
    css = removeRulesContainingSelectors(css, VISUAL_TOKEN_FORBIDDEN_SELECTORS);
    css = replaceToken(css, '--gg-preview-hero-aspect', CONTRACT.heroAspect);
    css = replaceToken(css, '--gg-preview-hero-max-height', CONTRACT.heroMaxHeight);
    css = replaceToken(css, '--gg-preview-content-lift', CONTRACT.contentLift);
    css = replaceToken(css, '--gg-preview-store-content-lift', CONTRACT.storeContentLift);
    write(file, css);
    changed.push(file);
  }

  for (const file of ['src/css/gg-app.source.css', 'src/store/store.css', '__gg/assets/css/gg-app.dev.css', '__gg/assets/css/gg-app.min.css', 'assets/store/store.css']) {
    if (!exists(file)) continue;
    let css = read(file);
    css = removeParallelRevealTokens(css);
    css = scrubGeneratedPreviewLeaks(css);
    css = replaceToken(css, '--gg-preview-hero-aspect', CONTRACT.heroAspect);
    css = replaceToken(css, '--gg-preview-hero-max-height', CONTRACT.heroMaxHeight);
    css = replaceToken(css, '--gg-preview-content-lift', CONTRACT.contentLift);
    css = replaceToken(css, '--gg-preview-store-content-lift', CONTRACT.storeContentLift);
    write(file, css);
    changed.push(file);
  }

  if (exists('qa/sheet-lifecycle-contract-guard.mjs')) {
    write('qa/sheet-lifecycle-contract-guard.mjs', SHEET_LIFECYCLE_GUARD);
    changed.push('qa/sheet-lifecycle-contract-guard.mjs');
  }
  if (exists('qa/sheet-runtime-overflow-viewport-guard.mjs')) {
    write('qa/sheet-runtime-overflow-viewport-guard.mjs', RUNTIME_OVERFLOW_GUARD);
    changed.push('qa/sheet-runtime-overflow-viewport-guard.mjs');
  }
  if (exists('qa/store-modal-preview-reliability-guard.mjs')) {
    write('qa/store-modal-preview-reliability-guard.mjs', STORE_MODAL_GUARD);
    changed.push('qa/store-modal-preview-reliability-guard.mjs');
  }

  console.log('Applied preview final mockup-match v9.');
  console.log('Updated:');
  Array.from(new Set(changed)).forEach((file) => console.log('- ' + file));
  console.log('\nContract:');
  console.log(`- --gg-preview-hero-aspect: ${CONTRACT.heroAspect}`);
  console.log(`- --gg-preview-hero-max-height: ${CONTRACT.heroMaxHeight}`);
  console.log(`- --gg-preview-content-lift: ${CONTRACT.contentLift} (used as upward overlap)`);
  console.log(`- --gg-preview-store-content-lift: ${CONTRACT.storeContentLift} (used as upward overlap)`);
}
function run(command) {
  console.log('\n$ ' + command);
  execSync(command, { stdio: 'inherit', cwd: root, shell: '/bin/bash' });
}
function runFocusedQa() {
  run('npm run gaga:sync-components');
  run('npm run store:build');
  run('npm run gaga:template:pack');
  run('npm run gaga:verify-sheet-lifecycle');
  run('npm run gaga:verify-sheet-runtime-overflow');
  run('npm run gaga:verify-store-modal-preview');
}
function runCi() {
  run('npm run ci:cloudflare');
}

apply();
if (args.has('--run-qa')) runFocusedQa();
if (args.has('--run-ci')) runCi();
