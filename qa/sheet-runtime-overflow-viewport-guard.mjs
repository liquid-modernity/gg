#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
function read(rel) { try { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n'); } catch (err) { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function blocks(source, selector) {
  const escaped = selector.replace(/[.*+?^\$()|[\]\\]/g, '\\$&');
  const re = new RegExp('[^{}]*' + escaped + '[^{}]*\\{[^{}]*\\}', 'g');
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
  requireAny(label, css, '.gg-preview__sheet', /overflow-y:\s*auto/, 'preview sheet must remain scrollable');
  requireAny(label, css, '.gg-preview__hero', /aspect-ratio:\s*var\(--gg-preview-hero-aspect\)/, 'preview hero must own aspect-ratio token');
  requireAny(label, css, '.gg-preview__hero', /max-height:\s*min\(var\(--gg-preview-hero-max-height\),\s*72dvh\)/, 'preview hero must keep viewport-safe max-height');
  requireAny(label, css, '.gg-preview__hero', /overflow:\s*hidden/, 'preview hero must hide overflowing media');
  forbidAny(label, css, '.store-preview__hero', /--gg-preview-panel-(?:initial|max)-height|var\(--gg-preview-panel-(?:initial|max)-height\)/, 'Store preview hero still uses old panel-driven hero max-height');
});
if (failures.length) {
  console.error('SHEET RUNTIME OVERFLOW VIEWPORT GUARD FAIL');
  failures.forEach(function (failure) { console.error('- ' + failure); });
  process.exit(1);
}
console.log('SHEET RUNTIME OVERFLOW VIEWPORT GUARD PASS');
