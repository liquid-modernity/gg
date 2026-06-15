#!/usr/bin/env bash
set -euo pipefail

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

node --input-type=module - <<'NODE'
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';

function run(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { encoding: 'utf8' }, (error, stdout, stderr) => {
      const output = `${stdout}\n${stderr}`;
      if (error) reject(new Error(output));
      else resolve(output);
    });
  });
}

const blogXml = await readFile('apps/blog/index.xml', 'utf8');
const legacyJs = await readFile('src/modules/legacy-app/legacy-app.js', 'utf8');
const policy = JSON.parse(await readFile('config/public-dom-generation-policy.json', 'utf8'));
const publicDomOutput = await run('node', ['checks/public-dom.check.mjs']);

const failures = [];
const requiredSummary = /public-dom ok:[^\n]*createElement=6[^\n]*allowedSmall=0[^\n]*allowedReviewed=6[^\n]*needsTemplate=0[^\n]*unclassified=0/;
if (!requiredSummary.test(publicDomOutput)) {
  failures.push('public-dom summary did not report createElement=6 allowedSmall=0 allowedReviewed=6 needsTemplate=0 unclassified=0');
}

const requiredTemplates = [
  'gg-template-comment-reply-prefix',
  'gg-template-comment-status',
  'gg-template-comment-more-wrapper',
  'gg-empty-state-saved-articles',
  'gg-template-related-post-card',
  'gg-template-related-posts-dot',
];

for (const id of requiredTemplates) {
  if (!new RegExp(`<template\\b[^>]*\\bid=['"]${id}['"]`, 'i').test(blogXml)) {
    failures.push(`missing template: ${id}`);
  }
}

const forbiddenTemplates = [
  'gg-template-div',
  'gg-template-link',
  'gg-template-button',
  'gg-template-element',
  'gg-template-generic',
];

for (const id of forbiddenTemplates) {
  if (new RegExp(`<template\\b[^>]*\\bid=['"]${id}['"]`, 'i').test(blogXml)) {
    failures.push(`forbidden generic template: ${id}`);
  }
}

const forbiddenCreatePatterns = [
  /document\.createElement\s*\(\s*['"]span['"]\s*\)[\s\S]{0,220}gg-comment-reply-prefix/i,
  /document\.createElement\s*\(\s*['"]div['"]\s*\)[\s\S]{0,220}gg-comments__status/i,
  /document\.createElement\s*\(\s*['"]span['"]\s*\)[\s\S]{0,220}gg-comment-more/i,
  /document\.createElement\s*\(\s*['"]p['"]\s*\)[\s\S]{0,220}gg-saved-listing-empty/i,
  /document\.createElement\s*\(\s*['"]a['"]\s*\)[\s\S]{0,220}gg-related-posts__item/i,
  /document\.createElement\s*\(\s*['"](?:div|span)['"]\s*\)[\s\S]{0,220}gg-related-posts__(?:dots|dot)/i,
];

for (const pattern of forbiddenCreatePatterns) {
  if (pattern.test(legacyJs)) failures.push(`visible UI createElement pattern remains: ${pattern}`);
}

const audit = policy.createElementAudit?.templateCompletenessAudit;
if (!audit) failures.push('missing createElementAudit.templateCompletenessAudit');
else {
  if (audit.after?.createElement !== 6 || audit.after?.allowedSmall !== 0 || audit.after?.allowedReviewed !== 6) {
    failures.push('templateCompletenessAudit after counts are not 6/0/6');
  }
  if (!Array.isArray(audit.migrated) || audit.migrated.length < 6) failures.push('templateCompletenessAudit migrated list is incomplete');
  if (!Array.isArray(audit.kept) || audit.kept.length !== 6) failures.push('templateCompletenessAudit kept list must contain six remaining createElement decisions');
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, check: 'task002m-g-acceptance', failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  check: 'task002m-g-acceptance',
  createElement: { before: 16, after: 6 },
  allowedSmall: { before: 6, after: 0 },
  allowedReviewed: { before: 10, after: 6 },
  needsTemplate: 0,
  unclassified: 0,
  genericTemplatesCreated: false,
}, null, 2));
NODE
