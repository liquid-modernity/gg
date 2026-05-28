#!/usr/bin/env node
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
