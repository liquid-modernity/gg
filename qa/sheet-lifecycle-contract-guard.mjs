#!/usr/bin/env node
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
