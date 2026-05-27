#!/usr/bin/env node
/**
 * Store Modal Preview Reliability Guard — final soft contract
 *
 * This guard is intentionally contract-based, not pixel/value brittle.
 * It allows the current design direction:
 * - Preview hero may use aspect-ratio: var(--gg-preview-hero-aspect) / 4:5.
 * - Content lift/reveal tokens may be tuned without changing this guard.
 * - Scrollbar hiding is allowed as long as scroll ownership remains overflow-y:auto/overlay/scroll.
 *
 * It should fail only when the preview contract disappears from source/generated CSS.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];
let checks = 0;

const FILES = {
  component: 'src/css/components/gg-preview-frame.css',
  visualTokens: 'src/css/components/gg-visual-tokens.css',
  moduleMirror: 'src/css/modules/preview-frame.css',
  visualMirror: 'src/css/modules/visual-tokens.css',
  appSource: 'src/css/gg-app.source.css',
  appDev: '__gg/assets/css/gg-app.dev.css',
  storeSource: 'src/store/store.css',
  storeAsset: 'assets/store/store.css',
};

function read(file) {
  checks += 1;
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    failures.push(`${file} is missing`);
    return '';
  }
  return fs.readFileSync(abs, 'utf8');
}

function stripComments(css) {
  return String(css || '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function compact(css) {
  return stripComments(css).replace(/\s+/g, ' ').trim();
}

function assert(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  checks += 1;
  if (!condition) warnings.push(message);
}

function hasToken(css, token) {
  return new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`).test(css);
}

function usesVar(css, prop, token) {
  return new RegExp(`${prop}\\s*:\\s*[^;]*var\\(\\s*${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\)`, 'i').test(css);
}

function hasSelector(css, selector) {
  return compact(css).includes(selector);
}

function hasAnySelector(css, selectors) {
  return selectors.some((selector) => hasSelector(css, selector));
}

function hasScrollableOwner(css) {
  return /overflow-y\s*:\s*(auto|scroll|overlay)\s*;?/i.test(css)
    || /overflow\s*:\s*(auto|scroll|overlay)\s*;?/i.test(css);
}

function hasHiddenScrollbar(css) {
  return /scrollbar-width\s*:\s*none\s*;?/i.test(css)
    || /::-webkit-scrollbar/.test(css)
    || /-ms-overflow-style\s*:\s*none\s*;?/i.test(css);
}

const css = Object.fromEntries(Object.entries(FILES).map(([key, file]) => [key, read(file)]));
const c = Object.fromEntries(Object.entries(css).map(([key, value]) => [key, compact(value)]));

// 1) Canonical preview frame must exist and own both root + Store preview surfaces.
assert(hasSelector(c.component, '.gg-preview__sheet'), `${FILES.component} missing root preview sheet selector`);
assert(hasAnySelector(c.component, ['.gg-preview__hero', '.store-preview__hero']), `${FILES.component} missing preview hero selectors`);
assert(hasAnySelector(c.component, ['.gg-preview__body', '.store-preview__body']), `${FILES.component} missing preview body selectors`);
assert(hasAnySelector(c.component, ['.gg-preview__media', '.store-preview__slide', '.store-preview__carousel']), `${FILES.component} missing preview media/carousel selectors`);

// 2) Token contract: presence matters; exact values are design-tunable.
for (const [label, fileKey] of [['visual tokens', 'visualTokens'], ['generated app CSS', 'appSource'], ['Store CSS', 'storeSource']]) {
  assert(hasToken(c[fileKey], '--gg-preview-hero-aspect'), `${label} missing --gg-preview-hero-aspect token`);
  assert(hasToken(c[fileKey], '--gg-preview-content-lift'), `${label} missing --gg-preview-content-lift token`);
  assert(hasToken(c[fileKey], '--gg-preview-store-content-lift'), `${label} missing --gg-preview-store-content-lift token`);
}

// 3) 4/5 design is valid. Do not require aspect-ratio:auto.
assert(/--gg-preview-hero-aspect\s*:\s*4\s*\/\s*5\s*;?/i.test(css.visualTokens)
  || /--gg-preview-hero-aspect\s*:\s*4\s*\/\s*5\s*;?/i.test(css.appSource)
  || /--gg-preview-hero-aspect\s*:\s*4\s*\/\s*5\s*;?/i.test(css.storeSource),
  'preview hero aspect token should resolve to 4 / 5 somewhere in source/generated CSS');

assert(usesVar(c.component, 'aspect-ratio', '--gg-preview-hero-aspect')
  || usesVar(c.appSource, 'aspect-ratio', '--gg-preview-hero-aspect')
  || usesVar(c.storeSource, 'aspect-ratio', '--gg-preview-hero-aspect'),
  'preview hero/media should use aspect-ratio: var(--gg-preview-hero-aspect)');

// 4) Content reveal/lift is valid whether positive reveal or negative overlay.
// The guard only checks that the body is controlled by the lift tokens.
assert(usesVar(c.component, 'margin-top', '--gg-preview-content-lift')
  || usesVar(c.appSource, 'margin-top', '--gg-preview-content-lift'),
  'root preview body must use --gg-preview-content-lift for reveal/overlay spacing');
assert(usesVar(c.component, 'margin-top', '--gg-preview-store-content-lift')
  || usesVar(c.storeSource, 'margin-top', '--gg-preview-store-content-lift')
  || usesVar(c.appSource, 'margin-top', '--gg-preview-store-content-lift'),
  'Store preview body must use --gg-preview-store-content-lift for reveal/overlay spacing');

// 5) Source/generated propagation.
for (const [label, key] of [
  ['module mirror', 'moduleMirror'],
  ['generated app CSS', 'appSource'],
  ['generated app dev CSS', 'appDev'],
  ['Store CSS source', 'storeSource'],
  ['Store CSS asset', 'storeAsset'],
]) {
  assert(hasAnySelector(c[key], ['.gg-preview__hero', '.store-preview__hero']), `${label} missing preview hero CSS`);
  assert(hasToken(c[key], '--gg-preview-hero-aspect'), `${label} missing --gg-preview-hero-aspect`);
}

// 6) Scroll reliability: hiding scrollbars is okay, but scroll owners must remain scrollable.
assert(hasScrollableOwner(c.component) || hasScrollableOwner(c.appSource) || hasScrollableOwner(c.storeSource), 'preview sheet/panel must keep an overflow-y scroll owner');
warn(hasHiddenScrollbar(c.component) || hasHiddenScrollbar(c.appSource) || hasHiddenScrollbar(c.storeSource), 'scrollbar hiding contract not detected; this is allowed but visual scrollbar may remain visible');

if (failures.length) {
  console.error('STORE MODAL PREVIEW RELIABILITY GUARD FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error('Warnings:');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
console.log(`STORE MODAL PREVIEW RELIABILITY GUARD PASS checks=${checks}${warnings.length ? ` warnings=${warnings.length}` : ''}`);
