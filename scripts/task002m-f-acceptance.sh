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
import { readFile } from 'node:fs/promises';

const blogXml = await readFile('apps/blog/index.xml', 'utf8');
const legacyJs = await readFile('src/modules/legacy-app/legacy-app.js', 'utf8');

const requiredTemplates = [
  'gg-template-comment-reply-banner',
  'gg-template-comment-more-menu',
  'gg-template-comment-replies-context-label',
  'gg-template-comment-replies-context-row',
  'gg-template-popular-range-link',
];

const forbiddenTemplates = [
  'gg-template-div',
  'gg-template-link',
  'gg-template-button',
  'gg-template-element',
  'gg-template-generic',
  'gg-template-action',
];

const structuralClasses = [
  'gg-comments__reply-banner',
  'gg-comment-more__menu',
  'gg-comment-replies__context-label',
  'gg-comment-replies__context-row',
  'gg-comment-replies__context-copy',
  'gg-comment-replies__context-meta',
  'gg-comment-replies__context-body',
  'gg-comment-replies__context-count',
  'gg-popular-controls__range',
];

const failures = [];

for (const id of requiredTemplates) {
  if (!new RegExp(`<template\\b[^>]*\\bid=['"]${id}['"]`, 'i').test(blogXml)) {
    failures.push(`missing template: ${id}`);
  }
}

for (const id of forbiddenTemplates) {
  if (new RegExp(`<template\\b[^>]*\\bid=['"]${id}['"]`, 'i').test(blogXml)) {
    failures.push(`forbidden generic template: ${id}`);
  }
}

for (const className of structuralClasses) {
  const createBeforeClass = new RegExp(`document\\.createElement\\s*\\(\\s*['"](div|a)['"]\\s*\\)[\\s\\S]{0,220}${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
  const classBeforeCreate = new RegExp(`${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,220}document\\.createElement\\s*\\(\\s*['"](div|a)['"]\\s*\\)`, 'i');
  if (createBeforeClass.test(legacyJs) || classBeforeCreate.test(legacyJs)) {
    failures.push(`structural createElement remains near ${className}`);
  }
}

if (/document\.createElement\s*\(\s*['"]a['"]\s*\)[\s\S]{0,260}gg-popular-controls__range/i.test(legacyJs)) {
  failures.push('popular range link still created with document.createElement(a)');
}

if (!/cloneTemplateElement\(['"]gg-template-popular-range-link['"]\)/.test(legacyJs)) {
  failures.push('popular range fallback does not clone gg-template-popular-range-link');
}

if (!/public-dom ok:[^\n]*needsTemplate=0[^\n]*unclassified=0/.test(
  await new Promise((resolve, reject) => {
    import('node:child_process').then(({ execFile }) => {
      execFile('node', ['checks/public-dom.check.mjs'], { encoding: 'utf8' }, (error, stdout, stderr) => {
        const output = `${stdout}\n${stderr}`;
        if (error) reject(new Error(output));
        else resolve(output);
      });
    }).catch(reject);
  })
)) {
  failures.push('public-dom summary did not report needsTemplate=0 and unclassified=0');
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, check: 'task002m-f-acceptance', failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  check: 'task002m-f-acceptance',
  templates: requiredTemplates,
  genericTemplatesCreated: false,
}, null, 2));
NODE
