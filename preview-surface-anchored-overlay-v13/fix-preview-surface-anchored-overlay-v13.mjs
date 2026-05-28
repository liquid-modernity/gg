#!/usr/bin/env node
/**
 * fix-preview-surface-anchored-overlay-v13.mjs
 *
 * Contract:
 * - Replace canonical CSS source; do not append override blocks.
 * - Keep visual tokens token-only.
 * - Hero stays 4/5 and viewport-safe.
 * - Intro/title overlays the hero and is anchored just above the surface boundary.
 * - Surface/card starts consistently near 85–90% of hero height.
 * - Guards are aligned to source ownership: tokens live in visual-tokens, layout lives in preview-frame.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const RUN_QA = args.has('--run-qa');
const RUN_CI = args.has('--run-ci');
const DRY = args.has('--dry-run');

const CONTRACT = Object.freeze({
  heroAspect: '4 / 5',
  heroMaxHeight: 'min(72dvh, 760px)',
  rootLift: 'clamp(48px, 9dvh, 96px)',
  storeLift: 'clamp(48px, 9dvh, 96px)',
  heroBoundary: 'max-height: min(var(--gg-preview-hero-max-height), 72dvh);'
});

const PREVIEW_FRAME_CSS = `.gg-preview {
  z-index: 94;
}

.gg-preview__sheet,
.store-preview-sheet .gg-sheet__panel {
  display: grid;
  align-content: start;
  gap: 0;
  width: var(--gg-panel-width);
  max-width: 100dvw;
  min-height: var(--gg-preview-panel-initial-height);
  max-height: var(--gg-preview-panel-max-height);
  overflow-y: auto;
  overflow-x: clip;
  background: var(--gg-preview-surface);
  box-shadow: var(--gg-preview-shadow);
}

@supports not (overflow-x: clip) {
  .gg-preview__sheet,
  .store-preview-sheet .gg-sheet__panel {
    overflow-x: hidden;
  }
}

.gg-content-sheet__affordance {
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

.gg-content-sheet__body {
  display: grid;
  gap: 0;
  min-width: 0;
}

.gg-preview__affordance .gg-sheet__handle,
.store-preview__footer .gg-sheet__handle {
  margin: 0;
}

.gg-preview__hero,
.store-preview__hero {
  position: sticky;
  top: 0;
  z-index: 0;
  width: 100%;
  height: auto;
  min-height: 0;
  max-height: min(var(--gg-preview-hero-max-height), 72dvh);
  aspect-ratio: var(--gg-preview-hero-aspect);
  overflow: hidden;
  background: #201a1c;
  background:
    radial-gradient(circle at 22% 14%, color-mix(in srgb, var(--gg-accent-soft) 24%, transparent), transparent 32%),
    linear-gradient(135deg, color-mix(in srgb, var(--gg-accent) 92%, #000), #141012 72%);
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
  background:
    linear-gradient(180deg, rgba(0,0,0,.18), transparent 34%),
    linear-gradient(0deg, rgba(0,0,0,.78), rgba(0,0,0,.34) 44%, rgba(0,0,0,.08) 72%, transparent);
  pointer-events: none;
}

.gg-preview__body,
.store-preview__body {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0;
  min-width: 0;
  max-width: 100%;
  padding: 0;
}

.gg-preview__body {
  margin-top: calc(-1 * var(--gg-preview-content-lift));
}

.store-preview__body {
  margin-top: calc(-1 * var(--gg-preview-store-content-lift));
}

.gg-preview__intro,
.store-preview__intro {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + clamp(12px, 2dvh, 22px));
  z-index: 4;
  display: grid;
  justify-items: center;
  gap: 8px;
  width: min(100% - 32px, 34rem);
  margin-inline: auto;
  padding: 0 8px;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 18px rgba(0,0,0,.46);
  pointer-events: none;
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
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  margin: 0;
  font: 780 clamp(28px, 8vw, 52px)/1 var(--gg-font-sans);
  letter-spacing: 0;
}

.gg-preview__meta,
.store-preview__meta {
  margin: 0;
  color: rgba(255,255,255,.86);
  font: 650 13px/1.35 var(--gg-font-sans);
  overflow-wrap: anywhere;
}

.gg-preview__surface,
.store-preview__surface {
  position: relative;
  z-index: 3;
  display: grid;
  gap: 16px;
  min-width: 0;
  max-width: 100%;
  padding: 20px 18px 24px;
  border-radius: var(--gg-preview-radius) var(--gg-preview-radius) 0 0;
  background: var(--gg-preview-surface);
  box-shadow: 0 -1px 0 var(--gg-line-strong), 0 -18px 42px rgba(0,0,0,.10);
}

.gg-preview__summary,
.store-preview__summary {
  margin: 0;
  color: var(--gg-ink);
  font: 700 clamp(16px, 4.4vw, 19px)/1.25 var(--gg-font-sans);
}

.gg-preview__section,
.store-preview__section {
  display: grid;
  gap: 8px;
}

.gg-preview__section-title {
  margin: 0;
  color: var(--gg-accent-soft);
  font: 780 11px/1.2 var(--gg-font-sans);
  letter-spacing: .18em;
  text-align: center;
  text-transform: uppercase;
}

.gg-preview__toc {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 14px 0 0;
  border-top: 1px solid var(--gg-divider);
}

.gg-preview__status {
  margin: 0;
  color: var(--gg-ink-soft);
  font: 560 13px/1.5 var(--gg-font-sans);
}

.gg-preview__toc-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: gg-preview-toc;
}

.gg-preview__toc-list > li {
  counter-increment: gg-preview-toc;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  min-height: 40px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--gg-divider) 72%, transparent);
}

.gg-preview__toc-list > li::before {
  content: counter(gg-preview-toc) ".";
  color: var(--gg-ink-soft);
  font: 650 13px/1.45 var(--gg-font-sans);
}

.gg-preview__toc-link {
  display: inline-block;
  padding: 0;
  color: var(--gg-ink);
  font: 650 14px/1.45 var(--gg-font-sans);
  text-decoration: none;
}
`;

function lifecycleGuardText() {
  return String.raw`#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function normalize(text) { return text.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)).split(String.fromCharCode(13)).join(String.fromCharCode(10)); }
function read(rel, required = true) { try { return normalize(fs.readFileSync(path.join(root, rel), 'utf8')); } catch (err) { if (required) failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function esc(value) { return value.replace(/[.*+?^\\$()|[\]\\]/g, '\\$&'); }
function blocks(source, selector) { const re = new RegExp('[^{}]*' + esc(selector) + '[^{}]*\\{[^{}]*\\}', 'g'); return Array.from(source.matchAll(re)).map((match) => match[0]); }
function anyBlock(source, selector, pattern) { return blocks(source, selector).some((block) => pattern.test(block)); }
function requirePattern(label, source, pattern, message) { if (!pattern.test(source)) fail(label + ' ' + message); }
function requireAny(label, source, selector, pattern, message) { if (!anyBlock(source, selector, pattern)) fail(label + ' ' + message); }
const tokenFiles = [
  ['src/css/components/gg-visual-tokens.css', read('src/css/components/gg-visual-tokens.css')],
  ['src/css/modules/visual-tokens.css', read('src/css/modules/visual-tokens.css')],
  ['src/css/gg-app.source.css', read('src/css/gg-app.source.css')],
  ['src/store/store.css', read('src/store/store.css')],
  ['__gg/assets/css/gg-app.dev.css', read('__gg/assets/css/gg-app.dev.css')],
  ['assets/store/store.css', read('assets/store/store.css')],
];
tokenFiles.forEach(([label, css]) => {
  requirePattern(label, css, /--gg-preview-hero-aspect:\s*4\s*\/\s*5\s*;/, 'missing --gg-preview-hero-aspect: 4 / 5');
  requirePattern(label, css, /--gg-preview-hero-max-height:\s*[^;]*dvh[^;]*;/, 'missing viewport-safe --gg-preview-hero-max-height');
  requirePattern(label, css, /--gg-preview-content-lift:\s*clamp\([^;]*dvh[^;]*\);/, 'missing clamp --gg-preview-content-lift');
  requirePattern(label, css, /--gg-preview-store-content-lift:\s*clamp\([^;]*dvh[^;]*\);/, 'missing clamp --gg-preview-store-content-lift');
  if (css.includes('--gg-preview-surface-reveal-y') || css.includes('--gg-preview-store-surface-reveal-y')) fail(label + ' must not use parallel reveal tokens');
});
const visual = read('src/css/components/gg-visual-tokens.css');
['.gg-preview__hero', '.store-preview__hero', '.gg-preview__body', '.store-preview__body', '.gg-preview__surface', '.store-preview__surface'].forEach((selector) => { if (visual.includes(selector)) fail('src/css/components/gg-visual-tokens.css must remain token-only; found ' + selector); });
const frameFiles = [
  ['src/css/components/gg-preview-frame.css', read('src/css/components/gg-preview-frame.css')],
  ['src/css/modules/preview-frame.css', read('src/css/modules/preview-frame.css')],
  ['src/css/gg-app.source.css', read('src/css/gg-app.source.css')],
  ['src/store/store.css', read('src/store/store.css')],
];
const rootLift = /margin-top:\s*calc\(\s*(?:-1\s*\*\s*)?var\(--gg-preview-content-lift\)(?:\s*\*\s*-1)?\s*\)/;
const storeLift = /margin-top:\s*calc\(\s*(?:-1\s*\*\s*)?var\(--gg-preview-store-content-lift\)(?:\s*\*\s*-1)?\s*\)/;
frameFiles.forEach(([label, css]) => {
  requireAny(label, css, '.gg-preview__hero', /aspect-ratio:\s*var\(--gg-preview-hero-aspect\)/, 'preview hero must use --gg-preview-hero-aspect');
  requireAny(label, css, '.gg-preview__hero', /max-height:\s*min\(var\(--gg-preview-hero-max-height\),\s*72dvh\)/, 'preview hero must keep viewport-safe max-height boundary');
  requireAny(label, css, '.gg-preview__hero', /overflow:\s*hidden/, 'preview hero must hide media overflow');
  requireAny(label, css, '.gg-preview__body', rootLift, 'preview body must own --gg-preview-content-lift as upward overlap');
  requireAny(label, css, '.store-preview__body', storeLift, 'store preview body must own --gg-preview-store-content-lift as upward overlap');
  requireAny(label, css, '.gg-preview__intro', /position:\s*absolute/, 'intro must be absolute overlay');
  requireAny(label, css, '.gg-preview__intro', /bottom:\s*calc\(100%\s*\+\s*clamp\(/, 'intro must be anchored just above surface/card');
  requireAny(label, css, '.gg-preview__surface', /border-radius:/, 'preview content surface must keep rounded card overlay');
  if (anyBlock(css, '.gg-preview__surface', /--gg-preview-content-lift/)) fail(label + ' double-lift detected: .gg-preview__surface must not use --gg-preview-content-lift');
  if (anyBlock(css, '.store-preview__surface', /--gg-preview-store-content-lift/)) fail(label + ' double-lift detected: .store-preview__surface must not use --gg-preview-store-content-lift');
});
const frame = read('src/css/components/gg-preview-frame.css');
if (!anyBlock(frame, '.gg-content-sheet__affordance', /order:\s*99/)) fail('preview affordance must be ordered after content');
if (!frame.includes('counter-reset: gg-preview-toc')) fail('preview TOC must keep polished counter contract');
if (failures.length) { console.error('SHEET LIFECYCLE CONTRACT GUARD FAIL'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('SHEET LIFECYCLE CONTRACT GUARD PASS');
`;
}

function runtimeGuardText() {
  return String.raw`#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function normalize(text) { return text.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)).split(String.fromCharCode(13)).join(String.fromCharCode(10)); }
function read(rel) { try { return normalize(fs.readFileSync(path.join(root, rel), 'utf8')); } catch (err) { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function esc(value) { return value.replace(/[.*+?^\\$()|[\]\\]/g, '\\$&'); }
function blocks(source, selector) { const re = new RegExp('[^{}]*' + esc(selector) + '[^{}]*\\{[^{}]*\\}', 'g'); return Array.from(source.matchAll(re)).map((match) => match[0]); }
function anyBlock(source, selector, pattern) { return blocks(source, selector).some((block) => pattern.test(block)); }
function requireAny(label, source, selector, pattern, message) { if (!anyBlock(source, selector, pattern)) fail(label + ' ' + message); }
function forbidAny(label, source, selector, pattern, message) { if (anyBlock(source, selector, pattern)) fail(label + ' ' + message); }
const files = [
  ['src/css/components/gg-preview-frame.css', read('src/css/components/gg-preview-frame.css')],
  ['src/css/modules/preview-frame.css', read('src/css/modules/preview-frame.css')],
  ['src/css/gg-app.source.css', read('src/css/gg-app.source.css')],
  ['src/store/store.css', read('src/store/store.css')],
];
const rootLift = /margin-top:\s*calc\(\s*(?:-1\s*\*\s*)?var\(--gg-preview-content-lift\)(?:\s*\*\s*-1)?\s*\)/;
const storeLift = /margin-top:\s*calc\(\s*(?:-1\s*\*\s*)?var\(--gg-preview-store-content-lift\)(?:\s*\*\s*-1)?\s*\)/;
files.forEach(([label, css]) => {
  requireAny(label, css, '.gg-preview__sheet', /overflow-y:\s*auto/, 'preview sheet must remain scrollable');
  requireAny(label, css, '.gg-preview__hero', /aspect-ratio:\s*var\(--gg-preview-hero-aspect\)/, 'preview hero must own aspect-ratio token');
  requireAny(label, css, '.gg-preview__hero', /max-height:\s*min\(var\(--gg-preview-hero-max-height\),\s*72dvh\)/, 'preview hero must keep viewport-safe max-height');
  requireAny(label, css, '.gg-preview__hero', /overflow:\s*hidden/, 'preview hero must hide overflowing media');
  requireAny(label, css, '.gg-preview__body', rootLift, 'preview body must lift the rounded card over the hero, not create blank space');
  requireAny(label, css, '.store-preview__body', storeLift, 'store preview body must lift the rounded card over the hero, not create blank space');
  forbidAny(label, css, '.gg-preview__hero', /var\(--gg-preview-panel-(?:initial|max)-height\)/, 'preview hero still uses panel height tokens');
  forbidAny(label, css, '.store-preview__hero', /var\(--gg-preview-panel-(?:initial|max)-height\)/, 'Store preview hero still uses panel height tokens');
});
if (failures.length) { console.error('SHEET RUNTIME OVERFLOW VIEWPORT GUARD FAIL'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('SHEET RUNTIME OVERFLOW VIEWPORT GUARD PASS');
`;
}

function storeGuardText() {
  return String.raw`#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function normalize(text) { return text.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)).split(String.fromCharCode(13)).join(String.fromCharCode(10)); }
function read(rel) { try { return normalize(fs.readFileSync(path.join(root, rel), 'utf8')); } catch (err) { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function esc(value) { return value.replace(/[.*+?^\\$()|[\]\\]/g, '\\$&'); }
function blocks(source, selector) { const re = new RegExp('[^{}]*' + esc(selector) + '[^{}]*\\{[^{}]*\\}', 'g'); return Array.from(source.matchAll(re)).map((match) => match[0]); }
function anyBlock(source, selector, pattern) { return blocks(source, selector).some((block) => pattern.test(block)); }
function generatedBlock(source, marker) { const safe = esc(marker); const re = new RegExp('/\\* BEGIN GENERATED: ' + safe + ' \\*/[\\s\\S]*?/\\* END GENERATED: ' + safe + ' \\*/'); const match = source.match(re); return match ? match[0] : source; }
const previewFrame = read('src/css/components/gg-preview-frame.css');
const moduleFrame = read('src/css/modules/preview-frame.css');
const visual = read('src/css/components/gg-visual-tokens.css');
const appFrame = generatedBlock(read('src/css/gg-app.source.css'), 'gg-preview-frame');
const storeFrame = generatedBlock(read('src/store/store.css'), 'gg-preview-frame');
const rootLift = /margin-top:\s*calc\(\s*(?:-1\s*\*\s*)?var\(--gg-preview-content-lift\)(?:\s*\*\s*-1)?\s*\)/;
const storeLift = /margin-top:\s*calc\(\s*(?:-1\s*\*\s*)?var\(--gg-preview-store-content-lift\)(?:\s*\*\s*-1)?\s*\)/;
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
  if (!anyBlock(css, '.gg-preview__body', rootLift)) fail(label + ' root preview body must use content lift as upward card overlap');
  if (!anyBlock(css, '.store-preview__body', storeLift)) fail(label + ' Store preview body must use content lift as upward card overlap');
  if (!anyBlock(css, '.gg-preview__intro', /position:\s*absolute/)) fail(label + ' intro must be absolute overlay');
  if (!anyBlock(css, '.gg-preview__intro', /bottom:\s*calc\(100%\s*\+\s*clamp\(/)) fail(label + ' intro must anchor just above the surface/card');
  if (anyBlock(css, '.gg-preview__surface', /--gg-preview-content-lift/)) fail(label + ' has double-lift: .gg-preview__surface must not use --gg-preview-content-lift');
  if (anyBlock(css, '.store-preview__surface', /--gg-preview-store-content-lift/)) fail(label + ' has double-lift: .store-preview__surface must not use --gg-preview-store-content-lift');
  if (!anyBlock(css, '.gg-preview__surface', /border-radius:/)) fail(label + ' content surface must be a rounded card overlay');
  if (!anyBlock(css, '.gg-preview__surface', /padding:/)) fail(label + ' content surface must own readable padding');
  if (!anyBlock(css, '.gg-content-sheet__affordance', /order:\s*99/)) fail(label + ' preview handle/affordance must be ordered at the bottom');
  if (!css.includes('counter-reset: gg-preview-toc')) fail(label + ' missing polished TOC counter contract');
});
if (!/--gg-preview-hero-aspect:\s*4\s*\/\s*5\s*;/.test(visual)) fail('visual tokens missing --gg-preview-hero-aspect: 4 / 5');
['.gg-preview__hero', '.store-preview__hero', '.gg-preview__body', '.store-preview__body', '.gg-preview__surface', '.store-preview__surface'].forEach((selector) => { if (visual.includes(selector)) fail('visual tokens must remain token-only; found ' + selector); });
if (previewFrame.trim() !== moduleFrame.trim()) fail('src/css/modules/preview-frame.css must mirror src/css/components/gg-preview-frame.css; run npm run gaga:sync-components');
if (failures.length) { console.error('STORE MODAL PREVIEW RELIABILITY GUARD FAIL'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('STORE MODAL PREVIEW RELIABILITY GUARD PASS');
`;
}

const touched = [];
function file(rel) { return path.join(root, rel); }
function exists(rel) { return fs.existsSync(file(rel)) && fs.statSync(file(rel)).isFile(); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function write(rel, text) { if (DRY) return; fs.writeFileSync(file(rel), text); touched.push(rel); }
function saveIfChanged(rel, before, after) { if (before !== after) write(rel, after); }
function escapeRe(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function normalizeNewlines(text) { return text.replace(/\r\n?/g, '\n'); }
function replaceGeneratedBlock(text, name, replacement) {
  const start = '/* BEGIN GENERATED: ' + name + ' */';
  const end = '/* END GENERATED: ' + name + ' */';
  const pattern = new RegExp(escapeRe(start) + '[\\s\\S]*?' + escapeRe(end), 'm');
  if (!pattern.test(text)) return text;
  return text.replace(pattern, start + '\n' + replacement.trim() + '\n' + end);
}
function replaceVar(text, name, value) {
  const pattern = new RegExp('(--' + escapeRe(name) + '\\s*:\\s*)[^;]+;', 'g');
  if (pattern.test(text)) return text.replace(pattern, '$1' + value + ';');
  const rootPattern = /:root\s*\{[\s\S]*?\n\}/m;
  if (!rootPattern.test(text)) return text;
  return text.replace(rootPattern, (block) => block.replace(/\n\}/, '\n  --' + name + ': ' + value + ';\n}'));
}
function normalizeTokensText(text) {
  let out = normalizeNewlines(text);
  out = replaceVar(out, 'gg-preview-hero-max-height', CONTRACT.heroMaxHeight);
  out = replaceVar(out, 'gg-preview-hero-aspect', CONTRACT.heroAspect);
  out = replaceVar(out, 'gg-preview-content-lift', CONTRACT.rootLift);
  out = replaceVar(out, 'gg-preview-store-content-lift', CONTRACT.storeLift);
  out = out.replace(/\n\s*--gg-preview-surface-reveal-y\s*:[^;]+;/g, '');
  out = out.replace(/\n\s*--gg-preview-store-surface-reveal-y\s*:[^;]+;/g, '');
  return out;
}
function normalizeTokensFile(rel) {
  if (!exists(rel)) return;
  const before = read(rel);
  const after = normalizeTokensText(before);
  saveIfChanged(rel, before, after);
}
function normalizePreviewFrameSources() {
  for (const rel of ['src/css/components/gg-preview-frame.css', 'src/css/modules/preview-frame.css']) {
    if (!exists(rel)) continue;
    const before = read(rel);
    saveIfChanged(rel, before, PREVIEW_FRAME_CSS.trim() + '\n');
  }
}
function normalizeGeneratedPreviewFrame(rel) {
  if (!exists(rel)) return;
  const before = read(rel);
  let after = replaceGeneratedBlock(before, 'gg-preview-frame', PREVIEW_FRAME_CSS);
  after = normalizeTokensText(after);
  saveIfChanged(rel, before, after);
}
function normalizeVisualGenerated(rel) {
  if (!exists(rel)) return;
  const before = read(rel);
  let after = normalizeTokensText(before);
  if (exists('src/css/components/gg-visual-tokens.css')) {
    const tokenSource = normalizeTokensText(read('src/css/components/gg-visual-tokens.css'));
    after = replaceGeneratedBlock(after, 'gg-visual-tokens', tokenSource);
  }
  saveIfChanged(rel, before, after);
}
function replaceGuard(rel, text) {
  if (!exists(rel)) return;
  const before = read(rel);
  saveIfChanged(rel, before, text);
}
function validateSourceContract() {
  const failures = [];
  function check(rel, message, condition) { if (!condition) failures.push(rel + ': ' + message); }
  for (const rel of ['src/css/components/gg-preview-frame.css', 'src/css/modules/preview-frame.css', 'src/css/gg-app.source.css', 'src/store/store.css']) {
    if (!exists(rel)) continue;
    const text = read(rel);
    check(rel, 'hero must keep aspect 4 / 5', text.includes('aspect-ratio: var(--gg-preview-hero-aspect);'));
    check(rel, 'hero must keep viewport-safe max-height boundary', text.includes(CONTRACT.heroBoundary));
    check(rel, 'body must use upward overlap through content-lift', text.includes('margin-top: calc(-1 * var(--gg-preview-content-lift));'));
    check(rel, 'store body must use upward overlap through store-content-lift', text.includes('margin-top: calc(-1 * var(--gg-preview-store-content-lift));'));
    check(rel, 'intro must be surface-anchored absolute overlay', text.includes('bottom: calc(100% + clamp(12px, 2dvh, 22px));'));
    check(rel, 'title must be line-clamped', text.includes('-webkit-line-clamp: 3;'));
    check(rel, 'surface must not use content-lift directly', !/\.gg-preview__surface[\s\S]*?--gg-preview-content-lift/.test(text));
    check(rel, 'surface must not use store content-lift directly', !/\.store-preview__surface[\s\S]*?--gg-preview-store-content-lift/.test(text));
  }
  for (const rel of ['src/css/components/gg-visual-tokens.css', 'src/css/modules/visual-tokens.css', 'src/css/gg-app.source.css', 'src/store/store.css']) {
    if (!exists(rel)) continue;
    const text = read(rel);
    check(rel, 'token --gg-preview-hero-max-height must be final', text.includes('--gg-preview-hero-max-height: ' + CONTRACT.heroMaxHeight + ';'));
    check(rel, 'token --gg-preview-content-lift must be final overlap value', text.includes('--gg-preview-content-lift: ' + CONTRACT.rootLift + ';'));
    check(rel, 'token --gg-preview-store-content-lift must be final overlap value', text.includes('--gg-preview-store-content-lift: ' + CONTRACT.storeLift + ';'));
  }
  for (const rel of ['src/css/components/gg-visual-tokens.css', 'src/css/modules/visual-tokens.css']) {
    if (!exists(rel)) continue;
    const text = read(rel);
    check(rel, 'visual tokens must stay token-only', !/\.gg-preview__|\.store-preview__/.test(text));
  }
  if (failures.length) {
    console.error('PREVIEW SURFACE-ANCHORED OVERLAY SOURCE CHECK FAIL');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log('PREVIEW SURFACE-ANCHORED OVERLAY SOURCE CHECK PASS');
}
function run(command) { console.log('\n$ ' + command); execSync(command, { cwd: root, stdio: 'inherit' }); }
function apply() {
  normalizePreviewFrameSources();
  normalizeTokensFile('src/css/components/gg-visual-tokens.css');
  normalizeTokensFile('src/css/modules/visual-tokens.css');
  normalizeGeneratedPreviewFrame('src/css/gg-app.source.css');
  normalizeGeneratedPreviewFrame('src/store/store.css');
  normalizeVisualGenerated('src/css/gg-app.source.css');
  normalizeVisualGenerated('src/store/store.css');
  replaceGuard('qa/sheet-lifecycle-contract-guard.mjs', lifecycleGuardText());
  replaceGuard('qa/sheet-runtime-overflow-viewport-guard.mjs', runtimeGuardText());
  replaceGuard('qa/store-modal-preview-reliability-guard.mjs', storeGuardText());
  validateSourceContract();
  console.log('\nApplied preview surface-anchored overlay v13.');
  console.log('Updated:');
  if (touched.length) for (const rel of [...new Set(touched)]) console.log('- ' + rel); else console.log('- no file changes needed');
  console.log('\nContract:');
  console.log('- --gg-preview-hero-aspect: ' + CONTRACT.heroAspect);
  console.log('- --gg-preview-hero-max-height: ' + CONTRACT.heroMaxHeight);
  console.log('- --gg-preview-content-lift: ' + CONTRACT.rootLift);
  console.log('- --gg-preview-store-content-lift: ' + CONTRACT.storeLift);
  console.log('- intro/title absolute overlay anchored above the surface/card');
  console.log('- surface/card starts consistently near 85–90% of hero height');
  console.log('- guards now respect source ownership: tokens in visual-tokens, layout in preview-frame');
}
function runFocusedQa() {
  if (fs.existsSync(file('tools/sync-shared-css-components.mjs'))) run('npm run gaga:sync-components');
  if (fs.existsSync(file('tools/store-build.sh'))) run('npm run store:build');
  if (fs.existsSync(file('tools/template-pack.mjs'))) run('npm run gaga:template:pack');
  run('npm run gaga:verify-sheet-lifecycle');
  run('npm run gaga:verify-sheet-runtime-overflow');
  run('npm run gaga:verify-store-modal-preview');
}
apply();
if (RUN_QA || RUN_CI) runFocusedQa();
if (RUN_CI) run('npm run ci:cloudflare');
