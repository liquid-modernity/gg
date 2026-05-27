#!/usr/bin/env node
/*
 * Store modal preview reliability guard
 * Final relaxed contract for the 4/5 hero-first reveal design.
 *
 * This guard intentionally does NOT require the preview aspect token to live in
 * src/css/modules/visual-tokens.css. That file is a generated/mirrored module
 * surface, not the runtime owner of the preview-frame contract.
 *
 * Valid contract:
 * - preview hero may use aspect-ratio: var(--gg-preview-hero-aspect)
 * - content lift may be positive for hero-first reveal
 * - scrollbar may be visually hidden if scrollability remains declared
 * - generated app/store CSS should carry the preview-frame contract
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(rel) {
  const abs = path.join(root, rel);
  try {
    return fs.readFileSync(abs, 'utf8');
  } catch {
    failures.push(`${rel} is missing`);
    return '';
  }
}

function has(css, needle) {
  return css.includes(needle);
}

function hasAny(css, needles) {
  return needles.some((needle) => css.includes(needle));
}

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const previewFrame = read('src/css/components/gg-preview-frame.css');
const appCss = read('src/css/gg-app.source.css');
const storeCss = read('src/store/store.css');
const visualTokens = read('src/css/components/gg-visual-tokens.css');
const modulePreviewFrame = read('src/css/modules/preview-frame.css');

const runtimeSurfaces = [
  ['src/css/components/gg-preview-frame.css', previewFrame],
  ['src/css/gg-app.source.css', appCss],
  ['src/store/store.css', storeCss],
];

for (const [rel, css] of runtimeSurfaces) {
  assert(has(css, '.gg-preview__hero'), `${rel} missing .gg-preview__hero contract`);
  assert(has(css, '.store-preview__hero'), `${rel} missing .store-preview__hero contract`);
  assert(
    has(css, 'aspect-ratio: var(--gg-preview-hero-aspect)') ||
      has(css, 'aspect-ratio:var(--gg-preview-hero-aspect)'),
    `${rel} missing 4/5 preview hero aspect contract`,
  );
  assert(has(css, 'overflow: hidden') || has(css, 'overflow:hidden'), `${rel} preview hero must hide media overflow`);
  assert(
    hasAny(css, [
      'max-height: min(var(--gg-preview-hero-max-height), 72dvh)',
      'max-height:min(var(--gg-preview-hero-max-height),72dvh)',
      'max-height: var(--gg-preview-hero-max-height)',
      'max-height:var(--gg-preview-hero-max-height)',
    ]),
    `${rel} preview hero should keep a viewport-safe max-height boundary`,
  );
  assert(
    has(css, 'margin-top: var(--gg-preview-content-lift)') ||
      has(css, 'margin-top:var(--gg-preview-content-lift)'),
    `${rel} missing root preview content reveal/lift`,
  );
  assert(
    has(css, 'margin-top: var(--gg-preview-store-content-lift)') ||
      has(css, 'margin-top:var(--gg-preview-store-content-lift)'),
    `${rel} missing Store preview content reveal/lift`,
  );
}

assert(
  has(visualTokens, '--gg-preview-hero-aspect: 4 / 5') ||
    has(visualTokens, '--gg-preview-hero-aspect:4 / 5') ||
    has(visualTokens, '--gg-preview-hero-aspect: 4/5') ||
    has(visualTokens, '--gg-preview-hero-aspect:4/5'),
  'visual tokens missing --gg-preview-hero-aspect: 4 / 5',
);
assert(
  has(visualTokens, '--gg-preview-content-lift:') && has(visualTokens, '--gg-preview-store-content-lift:'),
  'visual tokens missing preview content reveal/lift tokens',
);

// Component mirror should match the canonical preview-frame component after sync.
// Do not require unrelated visual tokens to appear in the module mirror.
if (previewFrame && modulePreviewFrame) {
  assert(
    previewFrame.trim() === modulePreviewFrame.trim(),
    'src/css/modules/preview-frame.css must mirror src/css/components/gg-preview-frame.css; run npm run gaga:sync-components',
  );
}

if (failures.length) {
  console.error('STORE MODAL PREVIEW RELIABILITY GUARD FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('STORE MODAL PREVIEW RELIABILITY GUARD PASS');
