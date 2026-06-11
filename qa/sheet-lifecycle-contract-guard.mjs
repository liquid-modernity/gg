#!/usr/bin/env node
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
if (failures.length) { console.error('SHEET LIFECYCLE CONTRACT GUARD CONTRACT_FAILURE'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('SHEET LIFECYCLE CONTRACT GUARD PASS');
