#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002M-C ACCEPTANCE ===\n'

fail() {
  printf 'error: %s\n' "$1" >&2
  exit 1
}

[ -f package.json ] || fail "run from repo root"
[ -f src/modules/legacy-app/legacy-app.js ] || fail "missing src/modules/legacy-app/legacy-app.js"
[ -f apps/blog/index.xml ] || fail "missing apps/blog/index.xml"
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

printf '\n--- Blog button template checks ---\n'
node <<'NODE'
const fs = require('fs');
const legacyPath = 'src/modules/legacy-app/legacy-app.js';
const xmlPath = 'apps/blog/index.xml';
const legacy = fs.readFileSync(legacyPath, 'utf8');
const xml = fs.readFileSync(xmlPath, 'utf8');

const createButtonRe = /(?:document\s*\.\s*)?createElement\s*\(\s*['"]button['"]\s*\)/g;
const matches = legacy.match(createButtonRe) || [];
if (matches.length) {
  console.error(`error: ${legacyPath} still contains ${matches.length} createElement('button') call(s)`);
  process.exit(1);
}

const forbiddenTemplateIds = [
  'gg-template-button',
  'gg-template-generic-button',
  'gg-template-public-button',
  'gg-template-action-button',
];
for (const id of forbiddenTemplateIds) {
  const re = new RegExp(`<template[^>]+id=["']${id}["']`, 'i');
  if (re.test(xml)) {
    console.error(`error: forbidden universal/generic button template found: ${id}`);
    process.exit(1);
  }
}

const requiredTemplates = [
  'gg-template-comments-sheet-handle',
  'gg-template-comment-reply-button',
  'gg-template-comment-more-button',
  'gg-template-comment-like-button',
  'gg-template-comment-copy-link-button',
  'gg-template-comment-delete-button',
];

const missing = requiredTemplates.filter((id) => !new RegExp(`<template[^>]+id=["']${id}["']`, 'i').test(xml));
if (missing.length) {
  console.error(`error: missing purpose-specific Blog button template(s): ${missing.join(', ')}`);
  process.exit(1);
}

const buttonTemplateCount = (xml.match(/<template[^>]+id=["']gg-template-[^"']*button["']/gi) || []).length;
if (buttonTemplateCount < 5) {
  console.error(`error: expected multiple purpose-specific button templates; found ${buttonTemplateCount}`);
  process.exit(1);
}

console.log('ok: no createElement button in legacy-app.js');
console.log('ok: required purpose-specific Blog button templates exist');
console.log('ok: no forbidden universal button template id found');
NODE

printf '\n=== TASK-002M-C ACCEPTANCE PASSED ===\n'
