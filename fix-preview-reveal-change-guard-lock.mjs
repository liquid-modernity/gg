#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const runQA = process.argv.includes('--run-qa');
const runCI = process.argv.includes('--run-ci');

const CONTRACT = {
  aspect: '4 / 5',
  heroMaxHeight: 'min(72dvh, 760px)',
  rootLift: 'clamp(380px, 59dvh, 540px)',
  storeLift: 'clamp(360px, 56dvh, 520px)',
  heroMaxHeightUse: 'min(var(--gg-preview-hero-max-height), 72dvh)',
};

const CSS_FILES = [
  'src/css/components/gg-visual-tokens.css',
  'src/css/modules/visual-tokens.css',
  'src/css/components/gg-preview-frame.css',
  'src/css/modules/preview-frame.css',
  'src/css/gg-app.source.css',
  'src/store/store.css',
];

const GUARD_FILES = [
  'qa/sheet-lifecycle-contract-guard.mjs',
  'qa/store-modal-preview-reliability-guard.mjs',
];

function abs(rel) {
  return path.join(ROOT, rel);
}

function exists(rel) {
  return fs.existsSync(abs(rel));
}

function read(rel) {
  return fs.readFileSync(abs(rel), 'utf8');
}

function writeIfChanged(rel, next) {
  const file = abs(rel);
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (prev !== next) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, next);
    return true;
  }
  return false;
}

function replaceToken(text, token, value) {
  const re = new RegExp(`(--${token}\\s*:\\s*)[^;]+;`, 'g');
  if (re.test(text)) return text.replace(re, `$1${value};`);
  return text;
}

function removeSurfaceRevealTokens(text) {
  return text
    .replace(/^\s*--gg-preview-surface-reveal-y\s*:\s*[^;]+;\s*\n/gm, '')
    .replace(/^\s*--gg-preview-store-surface-reveal-y\s*:\s*[^;]+;\s*\n/gm, '')
    .replace(/var\(--gg-preview-surface-reveal-y\)/g, 'var(--gg-preview-content-lift)')
    .replace(/var\(--gg-preview-store-surface-reveal-y\)/g, 'var(--gg-preview-store-content-lift)');
}

function declarationsToMap(body) {
  const decls = [];
  const seen = new Set();
  for (const raw of body.split(';')) {
    const line = raw.trim();
    if (!line || line.startsWith('/*')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const prop = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!prop || !value || seen.has(prop)) continue;
    seen.add(prop);
    decls.push([prop, value]);
  }
  return decls;
}

function renderBlock(selector, decls) {
  return `${selector} {\n${decls.map(([p, v]) => `  ${p}: ${v};`).join('\n')}\n}`;
}

function upsertDecls(text, selector, wanted, appendAnchor = null) {
  const pattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\}`, 'm');
  const m = text.match(pattern);
  if (m) {
    const decls = declarationsToMap(m[1]);
    const byProp = new Map(decls);
    for (const [prop, value] of wanted) byProp.set(prop, value);
    const ordered = [];
    const used = new Set();
    for (const [prop] of decls) {
      if (byProp.has(prop)) {
        ordered.push([prop, byProp.get(prop)]);
        used.add(prop);
      }
    }
    for (const [prop, value] of wanted) {
      if (!used.has(prop)) ordered.push([prop, value]);
    }
    return text.replace(pattern, renderBlock(selector, ordered));
  }

  const block = `\n${renderBlock(selector, wanted)}\n`;
  if (appendAnchor && text.includes(appendAnchor)) {
    return text.replace(appendAnchor, `${appendAnchor}${block}`);
  }
  return `${text.trimEnd()}\n${block}`;
}

function normalizePreviewCss(text) {
  text = removeSurfaceRevealTokens(text);

  text = replaceToken(text, 'gg-preview-hero-aspect', CONTRACT.aspect);
  text = replaceToken(text, 'gg-preview-hero-max-height', CONTRACT.heroMaxHeight);
  text = replaceToken(text, 'gg-preview-content-lift', CONTRACT.rootLift);
  text = replaceToken(text, 'gg-preview-store-content-lift', CONTRACT.storeLift);

  text = upsertDecls(text, '.gg-preview__hero,\n.store-preview__hero', [
    ['aspect-ratio', 'var(--gg-preview-hero-aspect)'],
    ['min-height', '0'],
    ['max-height', CONTRACT.heroMaxHeightUse],
    ['overflow', 'hidden'],
  ]);

  text = upsertDecls(text, '.gg-preview__surface', [
    ['margin-top', 'var(--gg-preview-content-lift)'],
  ]);

  text = upsertDecls(text, '.store-preview__surface', [
    ['margin-top', 'var(--gg-preview-store-content-lift)'],
  ]);

  text = upsertDecls(text, '.gg-preview__body', [
    ['margin-top', '0'],
  ]);

  text = upsertDecls(text, '.store-preview__body', [
    ['margin-top', '0'],
  ]);

  return text;
}

function normalizeGuard(text) {
  // Change the lock. Do not add a parallel token/contract.
  return text
    .replace(/calc\(var\(--gg-preview-panel-max-height\) \* \.62\)/g, CONTRACT.heroMaxHeight)
    .replace(/min\(72dvh, 760px\)/g, CONTRACT.heroMaxHeight)
    .replace(/clamp\(96px, 18dvh, 220px\)/g, CONTRACT.rootLift)
    .replace(/clamp\(88px, 16dvh, 196px\)/g, CONTRACT.storeLift)
    .replace(/clamp\(180px, 26dvh, 240px\)/g, CONTRACT.rootLift)
    .replace(/clamp\(170px, 24dvh, 230px\)/g, CONTRACT.storeLift)
    .replace(/--gg-preview-surface-reveal-y/g, '--gg-preview-content-lift')
    .replace(/--gg-preview-store-surface-reveal-y/g, '--gg-preview-store-content-lift');
}

const changed = [];

for (const rel of CSS_FILES) {
  if (!exists(rel)) continue;
  const next = normalizePreviewCss(read(rel));
  if (writeIfChanged(rel, next)) changed.push(rel);
}

for (const rel of GUARD_FILES) {
  if (!exists(rel)) continue;
  const next = normalizeGuard(read(rel));
  if (writeIfChanged(rel, next)) changed.push(rel);
}

console.log('Changed preview reveal lock contract.');
console.log('\nUpdated files:');
if (changed.length) {
  for (const rel of changed) console.log(`- ${rel}`);
} else {
  console.log('- none; files already matched contract');
}
console.log('\nLocked contract now:');
console.log(`- --gg-preview-hero-aspect: ${CONTRACT.aspect}`);
console.log(`- --gg-preview-hero-max-height: ${CONTRACT.heroMaxHeight}`);
console.log(`- --gg-preview-content-lift: ${CONTRACT.rootLift}`);
console.log(`- --gg-preview-store-content-lift: ${CONTRACT.storeLift}`);
console.log(`- hero max-height declaration: max-height: ${CONTRACT.heroMaxHeightUse}`);
console.log('- no new surface reveal token is introduced');

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

if (runQA) {
  try {
    run('npm run gaga:sync-components');
    run('npm run store:build');
    run('npm run gaga:template:pack');
    run('npm run gaga:verify-sheet-lifecycle');
    run('npm run gaga:verify-store-modal-preview');
    console.log('\nPREVIEW REVEAL LOCK QA PASS');
  } catch (error) {
    console.error('\nPREVIEW REVEAL LOCK QA FAILED');
    console.error(error.message);
    process.exit(1);
  }
}

if (runCI) {
  try {
    run('npm run ci:cloudflare');
    console.log('\nPREVIEW REVEAL LOCK CI PASS');
  } catch (error) {
    console.error('\nPREVIEW REVEAL LOCK CI FAILED');
    console.error(error.message);
    process.exit(1);
  }
}
