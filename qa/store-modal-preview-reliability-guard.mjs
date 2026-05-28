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
