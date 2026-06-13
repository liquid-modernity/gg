#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002M-D ACCEPTANCE ===\n'

fail() {
  printf 'error: %s\n' "$1" >&2
  exit 1
}

[ -f package.json ] || fail "run from repo root"
[ -f src/modules/store/store-discovery.js ] || fail "missing src/modules/store/store-discovery.js"
[ -f apps/store/store.html ] || fail "missing apps/store/store.html"
[ -f checks/public-dom.check.mjs ] || fail "missing checks/public-dom.check.mjs"

printf '\n--- Pipeline ---\n'
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui
npm run check:public-dom
npm run console:check
npm run studio:check
npm run deploy:dry

printf '\n--- Store discovery button template checks ---\n'
node <<'NODE'
const fs = require('fs');
const storeJsPath = 'src/modules/store/store-discovery.js';
const storeHtmlPath = 'apps/store/store.html';
const storeJs = fs.readFileSync(storeJsPath, 'utf8');
const storeHtml = fs.readFileSync(storeHtmlPath, 'utf8');

const createButtonRe = /(?:document\s*\.\s*)?createElement\s*\(\s*['"]button['"]\s*\)/g;
const matches = storeJs.match(createButtonRe) || [];
if (matches.length) {
  console.error(`error: ${storeJsPath} still contains ${matches.length} createElement('button') call(s)`);
  process.exit(1);
}

const forbiddenTemplateIds = [
  'store-button-template',
  'store-generic-button-template',
  'store-public-button-template',
  'gg-template-button',
  'gg-template-store-button',
  'gg-template-generic-button',
];
for (const id of forbiddenTemplateIds) {
  const re = new RegExp(`<template[^>]+id=["']${id}["']`, 'i');
  if (re.test(storeHtml)) {
    console.error(`error: forbidden universal/generic Store button template found: ${id}`);
    process.exit(1);
  }
}

const requiredTemplates = [
  'store-semantic-category-chip-template',
  'store-semantic-more-button-template',
];

const missing = requiredTemplates.filter((id) => !new RegExp(`<template[^>]+id=["']${id}["']`, 'i').test(storeHtml));
if (missing.length) {
  console.error(`error: missing purpose-specific Store button template(s): ${missing.join(', ')}`);
  process.exit(1);
}

for (const id of requiredTemplates) {
  const re = new RegExp(`<template[^>]+id=["']${id}["'][\\s\\S]*?<button\\b`, 'i');
  if (!re.test(storeHtml)) {
    console.error(`error: template ${id} must contain a button element`);
    process.exit(1);
  }
}

const usesCloneCategory = /cloneTemplate\s*\(\s*['"]store-semantic-category-chip-template['"]\s*\)/.test(storeJs);
const usesCloneMore = /cloneTemplate\s*\(\s*['"]store-semantic-more-button-template['"]\s*\)/.test(storeJs);
if (!usesCloneCategory) {
  console.error('error: store-discovery.js does not clone store-semantic-category-chip-template');
  process.exit(1);
}
if (!usesCloneMore) {
  console.error('error: store-discovery.js does not clone store-semantic-more-button-template');
  process.exit(1);
}

console.log('ok: no createElement button in store-discovery.js');
console.log('ok: required purpose-specific Store button templates exist');
console.log('ok: Store button templates are cloned by store-discovery.js');
console.log('ok: no forbidden universal Store button template id found');
NODE

printf '\n=== TASK-002M-D ACCEPTANCE PASSED ===\n'
