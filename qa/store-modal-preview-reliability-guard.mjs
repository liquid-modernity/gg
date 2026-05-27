#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
function read(rel) { try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { failures.push(rel + ' is missing'); return ''; } }
function fail(message) { failures.push(message); }
function blocks(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('[^{}]*' + escaped + '[^{}]*\\{[^{}]*\\}', 'g');
  return Array.from(source.matchAll(re)).map((m) => m[0]);
}
function hasBlock(source, selector, pattern) { return blocks(source, selector).some((block) => pattern.test(block)); }
function generatedBlock(source, marker) {
  const safe = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp('/\\* BEGIN GENERATED: ' + safe + ' \\*/[\\s\\S]*?/\\* END GENERATED: ' + safe + ' \\*/'))?.[0] || '';
}

const previewFrame = read('src/css/components/gg-preview-frame.css');
const modulePreviewFrame = read('src/css/modules/preview-frame.css');
const appCss = read('src/css/gg-app.source.css');
const storeCss = read('src/store/store.css');
const visualTokens = read('src/css/components/gg-visual-tokens.css');

for (const [label, source] of [
  ['src/css/components/gg-preview-frame.css', previewFrame],
  ['src/css/gg-app.source.css generated preview-frame', generatedBlock(appCss, 'gg-preview-frame') || appCss],
  ['src/store/store.css generated preview-frame', generatedBlock(storeCss, 'gg-preview-frame') || storeCss],
]) {
  if (!source.includes('.gg-preview__hero') || !source.includes('.store-preview__hero')) fail(label + ' missing shared preview hero selectors');
  if (!hasBlock(source, '.gg-preview__hero', /aspect-ratio:\s*var\(--gg-preview-hero-aspect\)/)) fail(label + ' missing 4/5 hero aspect contract');
  if (!hasBlock(source, '.gg-preview__hero', /max-height:\s*(?:min\(var\(--gg-preview-hero-max-height\),\s*72dvh\)|var\(--gg-preview-hero-max-height\))/)) fail(label + ' missing viewport-safe hero max-height boundary');
  if (!hasBlock(source, '.gg-preview__hero', /overflow:\s*hidden/)) fail(label + ' preview hero must hide media overflow');
  if (!hasBlock(source, '.gg-preview__body', /margin-top:\s*var\(--gg-preview-content-lift\)/)) fail(label + ' root preview body must own content lift');
  if (!hasBlock(source, '.store-preview__body', /margin-top:\s*var\(--gg-preview-store-content-lift\)/)) fail(label + ' Store preview body must own content lift');
  if (hasBlock(source, '.gg-preview__surface', /margin-top:\s*var\(--gg-preview-content-lift\)/)) fail(label + ' has double-lift: .gg-preview__surface must not use --gg-preview-content-lift');
  if (hasBlock(source, '.store-preview__surface', /margin-top:\s*var\(--gg-preview-store-content-lift\)/)) fail(label + ' has double-lift: .store-preview__surface must not use --gg-preview-store-content-lift');
}

if (!/--gg-preview-hero-aspect:\s*4\s*\/\s*5\s*;/.test(visualTokens)) fail('visual tokens missing --gg-preview-hero-aspect: 4 / 5');
if (!/--gg-preview-content-lift:\s*clamp\([^;]*dvh[^;]*\);/.test(visualTokens)) fail('visual tokens missing positive clamp --gg-preview-content-lift');
if (!/--gg-preview-store-content-lift:\s*clamp\([^;]*dvh[^;]*\);/.test(visualTokens)) fail('visual tokens missing positive clamp --gg-preview-store-content-lift');
for (const selector of ['.gg-preview__hero', '.store-preview__hero', '.gg-preview__body', '.store-preview__body', '.gg-preview__surface', '.store-preview__surface']) {
  if (visualTokens.includes(selector)) fail('visual tokens must remain token-only; found ' + selector);
}
if (previewFrame && modulePreviewFrame && previewFrame.trim() !== modulePreviewFrame.trim()) fail('src/css/modules/preview-frame.css must mirror src/css/components/gg-preview-frame.css; run npm run gaga:sync-components');

if (failures.length) {
  console.error('STORE MODAL PREVIEW RELIABILITY GUARD FAIL');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}
console.log('STORE MODAL PREVIEW RELIABILITY GUARD PASS');
