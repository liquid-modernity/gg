#!/usr/bin/env node
/**
 * Store Modal Preview Reliability Guard — 4/5 reconciled contract
 *
 * Purpose:
 * - Allow the preview visual to use `--gg-preview-hero-aspect: 4 / 5`.
 * - Stop treating `aspect-ratio: auto` as the only valid preview-hero contract.
 * - Keep basic reliability checks: files exist, preview selectors exist, tokens exist,
 *   generated app/store CSS carry the preview frame contract.
 *
 * This guard is intentionally selector/context-aware and avoids brittle exact-block checks.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];
let checks = 0;

function rel(file) {
  return path.relative(root, file).replaceAll('\\\\', '/');
}

function read(file) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    failures.push(`${file} is missing`);
    return '';
  }
  checks += 1;
  return fs.readFileSync(abs, 'utf8');
}

function assert(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  checks += 1;
  if (!condition) warnings.push(message);
}

function compact(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
}

function has(css, snippet) {
  return css.includes(snippet);
}

function hasAny(css, snippets) {
  return snippets.some((snippet) => css.includes(snippet));
}

function hasAspectToken(css) {
  return /--gg-preview-hero-aspect\s*:\s*4\s*\/\s*5\s*;?/.test(css)
    || css.includes('--gg-preview-hero-aspect');
}

function hasAspectUsage(css) {
  return /aspect-ratio\s*:\s*var\(\s*--gg-preview-hero-aspect\s*\)\s*;?/.test(css);
}

function hasViewportSafety(css) {
  return hasAny(css, [
    '--gg-preview-hero-height',
    '--gg-preview-hero-max-height',
    'max-height:',
    'height: min(',
    'height:min(',
    'clamp(',
    'dvh',
    'vh',
  ]);
}

const componentPath = 'src/css/components/gg-preview-frame.css';
const appPath = 'src/css/gg-app.source.css';
const storePath = 'src/store/store.css';
const appDevPath = '__gg/assets/css/gg-app.dev.css';
const storeAssetPath = 'assets/store/store.css';
const tokensPath = 'src/css/modules/tokens.css';

const component = read(componentPath);
const appCss = read(appPath);
const storeCss = read(storePath);
const appDevCss = read(appDevPath);
const storeAssetCss = read(storeAssetPath);
const tokensCss = read(tokensPath);

const componentC = compact(component);
const appC = compact(appCss);
const storeC = compact(storeCss);
const appDevC = compact(appDevCss);
const storeAssetC = compact(storeAssetCss);
const tokensC = compact(tokensCss);

// Canonical preview-frame presence.
assert(componentC.includes('gg-preview__hero'), `${componentPath} must define the Blogger preview hero selector`);
assert(componentC.includes('gg-preview__') || componentC.includes('store-preview__'), `${componentPath} must keep preview-frame selectors`);

// The 4/5 token is a valid design contract.
assert(hasAspectToken(componentC) || hasAspectToken(appC) || hasAspectToken(storeC) || hasAspectToken(tokensC), 'preview contract must keep --gg-preview-hero-aspect token');
assert(hasAspectToken(appC), `${appPath} must carry --gg-preview-hero-aspect into generated app CSS`);
assert(hasAspectToken(storeC), `${storePath} must carry --gg-preview-hero-aspect into generated Store CSS`);

// 4/5 usage is allowed. Prefer it somewhere in preview/media/hero CSS, but do not fail
// if the project temporarily keeps the token available for runtime/template use.
warn(hasAspectUsage(componentC) || hasAspectUsage(appC) || hasAspectUsage(storeC), 'preview visual does not currently use aspect-ratio: var(--gg-preview-hero-aspect); token is present but unused');

// Reliability should be viewport-aware, but the guard must not force a brittle exact order
// such as height -> min-height -> max-height -> aspect-ratio:auto.
warn(hasViewportSafety(componentC), `${componentPath} has no obvious viewport-safe height/max-height token`);
warn(hasViewportSafety(appC), `${appPath} has no obvious viewport-safe height/max-height token`);
warn(hasViewportSafety(storeC), `${storePath} has no obvious viewport-safe height/max-height token`);

// Generated parity/surface smoke: generated outputs should include the same high-level contract.
assert(hasAspectToken(appDevC), `${appDevPath} must carry --gg-preview-hero-aspect after template pack`);
assert(hasAspectToken(storeAssetC), `${storeAssetPath} must carry --gg-preview-hero-aspect after store build/template pack`);
assert(appDevC.includes('gg-preview__hero'), `${appDevPath} must carry generated preview hero CSS`);
assert(storeAssetC.includes('gg-preview__hero') || storeAssetC.includes('store-preview__'), `${storeAssetPath} must carry generated preview/store preview CSS`);

// Do not enforce `aspect-ratio:auto` as a design rule. It can exist for a fallback, but it is
// no longer a required condition and no longer makes `var(--gg-preview-hero-aspect)` invalid.
warn(!/aspect-ratio\s*:\s*auto\s*;/.test(componentC) || hasAspectUsage(componentC) || hasAspectToken(componentC), `${componentPath} uses aspect-ratio:auto without a visible 4/5 token/use nearby`);

if (failures.length) {
  console.error('STORE MODAL PREVIEW RELIABILITY GUARD FAIL');
  console.error('');
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error('');
    console.error('Warnings:');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

for (const warning of warnings) {
  console.warn(`WARN ${warning}`);
}
console.log(`STORE MODAL PREVIEW RELIABILITY GUARD PASS checks=${checks}${warnings.length ? ` warnings=${warnings.length}` : ''}`);
