import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let errors = [];
let warnings = [];
let restrictedCount = 0;
let allowlistedCount = 0;
let findingCount = 0;

// CreateElement audit counters
let ceTotalCount = 0;
let ceAllowedSmall = 0;
let ceNeedsTemplate = 0;
let ceUnclassified = 0;
const ceFindings = []; // { file, line, tag, classification }

function fail(msg) {
  errors.push(msg);
  console.error('FAIL:', msg);
}
function warn(msg) {
  warnings.push(msg);
  console.warn('WARN:', msg);
}

async function readText(relPath) {
  return readFile(join(ROOT, relPath), 'utf8');
}

async function exists(relPath) {
  try { await readFile(join(ROOT, relPath)); return true; } catch { return false; }
}

async function walk(dir, ext, results) {
  const full = join(ROOT, dir);
  let entries;
  try { entries = await readdir(full, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(rel, ext, results);
    } else if (e.name.endsWith(ext)) {
      results.push(rel);
    }
  }
}

async function collectFiles(patterns) {
  const results = [];
  for (const pattern of patterns) {
    const parts = pattern.split('/');
    const starIdx = parts.indexOf('**');
    const base = starIdx >= 0 ? parts.slice(0, starIdx).join('/') : parts.join('/');
    const ext = pattern.endsWith('.js') ? '.js' : pattern.endsWith('.html') ? '.html' : pattern.endsWith('.xml') ? '.xml' : pattern.endsWith('.mjs') ? '.mjs' : null;
    if (!ext) continue;
    await walk(base, ext, results);
  }
  return results;
}

console.log('=== public-dom check ===\n');

// 1. Validate policy file exists and has required keys
if (!(await exists('config/public-dom-generation-policy.json'))) {
  fail('Missing config/public-dom-generation-policy.json');
  process.exit(1);
}

let policy;
try {
  policy = JSON.parse(await readText('config/public-dom-generation-policy.json'));
} catch (e) {
  fail('config/public-dom-generation-policy.json is not valid JSON: ' + e.message);
  process.exit(1);
}

const requiredKeys = ['policyPhrase', 'allowedSmallBehaviorApis', 'restrictedHtmlGenerationApis', 'allowlist'];
for (const key of requiredKeys) {
  if (!(key in policy)) {
    fail(`Policy missing required key: ${key}`);
  }
}
if (policy.policyPhrase !== 'largePublicUiMustLiveInHtmlOrTemplate') {
  fail(`Policy phrase mismatch: expected "largePublicUiMustLiveInHtmlOrTemplate", got "${policy.policyPhrase}"`);
}

const requiredAllowedApis = ['createElement', 'textContent', 'setAttribute', 'appendChild', 'classList', 'dataset'];
for (const api of requiredAllowedApis) {
  if (!policy.allowedSmallBehaviorApis?.includes(api)) {
    fail(`Policy allowedSmallBehaviorApis missing: ${api}`);
  }
}

const requiredRestrictedApis = ['innerHTML', 'insertAdjacentHTML', 'outerHTML'];
for (const api of requiredRestrictedApis) {
  if (!policy.restrictedHtmlGenerationApis?.includes(api)) {
    fail(`Policy restrictedHtmlGenerationApis missing: ${api}`);
  }
}

console.log('ok: policy JSON exists and has required keys');

// 2. Scan source files for restricted APIs
const sourcePatterns = [
  'apps/blog/**/*.xml',
  'apps/blog/**/*.html',
  'apps/store/**/*.html',
  'apps/landing/**/*.html',
  'src/modules/**/*.js',
  'src/entries/**/*.js',
];

const sourceFiles = await collectFiles(sourcePatterns);
console.log(`scanning ${sourceFiles.length} source files for restricted APIs...`);

const restrictedApis = policy.restrictedHtmlGenerationApis || ['innerHTML', 'insertAdjacentHTML', 'outerHTML'];
const apiRegexSource = '\\b(' + restrictedApis.join('|') + ')\\b';

// Build allowlist lookup
const allowlistMap = new Map();
for (const entry of policy.allowlist || []) {
  const key = `${entry.file}:${entry.line}:${entry.api}`;
  allowlistMap.set(key, entry);
}

for (const file of sourceFiles) {
  let content;
  try {
    content = await readText(file);
  } catch (e) {
    warn(`Cannot read ${file}: ${e.message}`);
    continue;
  }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const apiPattern = new RegExp(apiRegexSource, 'g');
    let m;
    const lineApis = new Set();
    while ((m = apiPattern.exec(line)) !== null) {
      lineApis.add(m[1]);
    }
    if (lineApis.size === 0) continue;

    for (const api of lineApis) {
      restrictedCount++;
      const lineNum = i + 1;
      const allowKey = `${file}:${lineNum}:${api}`;

      if (allowlistMap.has(allowKey)) {
        const entry = allowlistMap.get(allowKey);
        console.log(`  allowlisted: ${file}:${lineNum} ${api} (${entry.status})`);
        allowlistedCount++;
      } else {
        fail(`Unallowlisted restricted API: ${file}:${lineNum} ${api}`);
      }
    }
  }
}

// 3. Detect large UI HTML strings in public JS
const jsFiles = sourceFiles.filter(f => f.endsWith('.js'));
const largeUiPattern = /(<section|<article|<button|<template)[^>]*gg-/i;

for (const file of jsFiles) {
  let content;
  try {
    content = await readText(file);
  } catch { continue; }
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (largeUiPattern.test(lines[i])) {
      findingCount++;
      warn(`Large UI HTML string detected in JS: ${file}:${i + 1} — ${lines[i].trim().slice(0, 120)}`);
    }
  }
}

// 4. CreateElement audit across all src/**/*.js and src/**/*.mjs
console.log('');
const ceAudit = policy.createElementAudit || {};
const allowedSmallTags = new Set(ceAudit.allowedSmallTags || ['span', 'option']);
const needsTemplateTags = new Set(ceAudit.needsTemplateTags || ['section', 'article', 'button', 'nav', 'header', 'footer', 'dialog', 'form', 'aside', 'main', 'ul', 'ol', 'li']);
const ceScope = ceAudit.scope || ['src/**/*.js', 'src/**/*.mjs'];

const ceFiles = await collectFiles(ceScope);
const deduped = new Set(ceFiles);
console.log(`scanning ${deduped.size} src files for createElement usage...`);

const cePattern = /document\.createElement\s*\(\s*(['"])([a-zA-Z0-9-]+)\1\s*\)/g;

for (const file of deduped) {
  let content;
  try {
    content = await readText(file);
  } catch { continue; }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const pattern = new RegExp(cePattern.source, 'g');
    let m;
    while ((m = pattern.exec(line)) !== null) {
      const tag = m[2].toLowerCase();
      ceTotalCount++;

      let classification;
      if (allowedSmallTags.has(tag)) {
        classification = 'allowedSmall';
        ceAllowedSmall++;
      } else if (needsTemplateTags.has(tag)) {
        classification = 'needsTemplate';
        ceNeedsTemplate++;
      } else {
        classification = 'unclassified';
        ceUnclassified++;
      }

      ceFindings.push({ file, line: i + 1, tag, classification });

      if (classification === 'needsTemplate') {
        warn(`needsTemplate candidate: ${file}:${i + 1} createElement('${tag}')`);
      } else if (classification === 'unclassified') {
        warn(`unclassified createElement: ${file}:${i + 1} createElement('${tag}')`);
      }
    }
  }
}

// 5. Summary
console.log('');
const ok = errors.length === 0;
const status = ok ? 'ok' : 'FAIL';
console.log(`public-dom ${status}: restricted=${restrictedCount} allowlisted=${allowlistedCount} createElement=${ceTotalCount} allowedSmall=${ceAllowedSmall} needsTemplate=${ceNeedsTemplate} unclassified=${ceUnclassified}`);

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach(w => console.error('  -', w));
}

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach(e => console.error('  -', e));
  process.exit(1);
}

console.log('\npublic-dom check passed');