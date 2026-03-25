#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, 'index.prod.xml');
const JS_PATHS = [
  path.join(ROOT, 'public/assets/latest/modules/ui.bucket.core.js'),
  path.join(ROOT, 'public/assets/v/ac33998/modules/ui.bucket.core.js'),
];
const CSS_PATHS = [
  path.join(ROOT, 'public/assets/latest/main.css'),
  path.join(ROOT, 'public/assets/v/ac33998/main.css'),
];

function readText(file) {
  return readFileSync(file, 'utf8');
}

function decodeEntities(input) {
  return String(input || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractScriptJson(xml, id) {
  const re = new RegExp(`<script[^>]*id=['"]${id}['"][^>]*>([\\s\\S]*?)<\\/script>`, 'i');
  const m = xml.match(re);
  if (!m) return {};
  const raw = decodeEntities(m[1]).trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`invalid JSON in <script id="${id}">: ${err.message}`);
  }
}

function keySet(obj) {
  return new Set(Object.keys(obj || {}));
}

function diffSet(a, b) {
  return [...a].filter((k) => !b.has(k)).sort();
}

function placeholders(value) {
  const out = new Set();
  const re = /\{([a-zA-Z0-9_]+)\}/g;
  let m = null;
  while ((m = re.exec(String(value || '')))) out.add(m[1]);
  return [...out].sort();
}

function hasLegacyLangCode(text) {
  return /\bdata-lang-code\b/.test(text);
}

function hasNativePromptApi(text) {
  return /\b(?:alert|confirm|prompt)\s*\(/.test(text);
}

function extractContractKeys(indexText) {
  const out = new Set();
  const re = /data-gg-copy(?:-aria|-title|-placeholder)?=['"]([^'"]+)['"]/g;
  let m = null;
  while ((m = re.exec(indexText))) {
    const key = String(m[1] || '').trim();
    if (!key) continue;
    out.add(key);
  }
  return [...out].sort();
}

function findCssLiteralContent(cssText) {
  const issues = [];
  const re = /content\s*:\s*(['"])(.*?)\1/g;
  let m = null;
  while ((m = re.exec(cssText))) {
    const val = String(m[2] || '').trim();
    if (!val) continue;
    if (!/[A-Za-z]/.test(val)) continue;
    if (/^[a-z0-9_]+$/i.test(val)) continue; // allow icon tokens
    issues.push(val);
  }
  return issues;
}

function main() {
  const issues = [];
  const indexText = readText(INDEX_PATH);
  const jsTexts = JS_PATHS.map((p) => ({ path: p, text: readText(p) }));
  const cssTexts = CSS_PATHS.map((p) => ({ path: p, text: readText(p) }));

  const en = extractScriptJson(indexText, 'gg-copy-en');
  const id = extractScriptJson(indexText, 'gg-copy-id');

  const enKeys = keySet(en);
  const idKeys = keySet(id);
  const missingInId = diffSet(enKeys, idKeys);
  const missingInEn = diffSet(idKeys, enKeys);

  if (missingInId.length) {
    issues.push(`EN keys missing in ID (${missingInId.length}): ${missingInId.slice(0, 20).join(', ')}`);
  }
  if (missingInEn.length) {
    issues.push(`ID keys missing in EN (${missingInEn.length}): ${missingInEn.slice(0, 20).join(', ')}`);
  }

  const commonKeys = [...enKeys].filter((k) => idKeys.has(k)).sort();
  const placeholderMismatches = [];
  for (const key of commonKeys) {
    const a = placeholders(en[key]);
    const b = placeholders(id[key]);
    if (a.join('|') !== b.join('|')) {
      placeholderMismatches.push(`${key} (en:{${a.join(',')}} vs id:{${b.join(',')}})`);
    }
  }
  if (placeholderMismatches.length) {
    issues.push(`placeholder parity mismatch (${placeholderMismatches.length}): ${placeholderMismatches.slice(0, 20).join('; ')}`);
  }

  const usedContractKeys = extractContractKeys(indexText);
  const missingContractKeys = usedContractKeys.filter((k) => !enKeys.has(k) || !idKeys.has(k));
  if (missingContractKeys.length) {
    issues.push(`contract keys missing from registry (${missingContractKeys.length}): ${missingContractKeys.slice(0, 20).join(', ')}`);
  }

  if (hasLegacyLangCode(indexText)) {
    issues.push('index.prod.xml still contains data-lang-code');
  }
  for (const file of jsTexts) {
    if (hasLegacyLangCode(file.text)) {
      issues.push(`${path.relative(ROOT, file.path)} still contains data-lang-code`);
    }
  }

  if (!/id=['"]gg-palette-list['"]/.test(indexText)) {
    issues.push('missing required #gg-palette-list listbox element in index.prod.xml');
  }

  for (const file of jsTexts) {
    if (hasNativePromptApi(file.text)) {
      issues.push(`${path.relative(ROOT, file.path)} still contains alert/confirm/prompt`);
    }
  }

  for (const file of cssTexts) {
    const cssIssues = findCssLiteralContent(file.text);
    if (cssIssues.length) {
      issues.push(`${path.relative(ROOT, file.path)} has textual CSS content literals: ${cssIssues.slice(0, 10).join(' | ')}`);
    }
  }

  if (/>[\s\r\n]*[a-z]+(?:\.[a-z0-9_-]+){1,}[\s\r\n]*</i.test(indexText)) {
    issues.push('index.prod.xml appears to contain raw copy keys rendered as text');
  }

  if (issues.length) {
    console.error('GG copy registry verification: FAILED');
    issues.forEach((item, idx) => console.error(`${idx + 1}. ${item}`));
    process.exit(1);
  }

  console.log('GG copy registry verification: PASS');
}

main();
