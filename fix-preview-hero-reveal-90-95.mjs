#!/usr/bin/env node
/*
 * Fix Preview Hero Reveal 90-95
 *
 * Purpose:
 * - Keep the preview/store hero as 4/5.
 * - Keep a viewport-safe max-height boundary so QA does not fail.
 * - Push preview content down automatically so roughly 90-95% of the hero image is visible first.
 * - Hide no scroll behavior; scroll remains owned by the sheet/panel.
 *
 * Run from repo root:
 *   node fix-preview-hero-reveal-90-95.mjs
 *
 * Optional:
 *   node fix-preview-hero-reveal-90-95.mjs --run-qa
 *   node fix-preview-hero-reveal-90-95.mjs --run-ci
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const runQa = args.has('--run-qa') || args.has('--run-ci');
const runCi = args.has('--run-ci');

const FILES = {
  previewFrame: 'src/css/components/gg-preview-frame.css',
  previewFrameMirror: 'src/css/modules/preview-frame.css',
  visualTokens: 'src/css/components/gg-visual-tokens.css',
  visualTokensMirror: 'src/css/modules/visual-tokens.css',
};

const TOKEN_VALUES = {
  '--gg-preview-hero-aspect': '4 / 5',
  '--gg-preview-hero-max-height': 'min(72dvh, 760px)',
  // These lift values are intentionally larger than the earlier compact setting.
  // They are tuned for a hero-first opening state: image first, content peeking below.
  '--gg-preview-content-lift': 'clamp(180px, 26dvh, 240px)',
  '--gg-preview-store-content-lift': 'clamp(180px, 26dvh, 240px)',
  '--gg-preview-overlay-lift': 'var(--gg-preview-content-lift)',
};

function abs(rel) {
  return path.join(root, rel);
}

function exists(rel) {
  return fs.existsSync(abs(rel));
}

function read(rel) {
  const file = abs(rel);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${rel}`);
  }
  return fs.readFileSync(file, 'utf8');
}

function write(rel, text) {
  const file = abs(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normaliseNewlines(text) {
  return text.replace(/\r\n/g, '\n');
}

function upsertRootToken(css, name, value) {
  const tokenRe = new RegExp(`(^\\s*${escapeRegExp(name)}\\s*:\\s*)[^;]+;`, 'm');
  if (tokenRe.test(css)) {
    return css.replace(tokenRe, `$1${value};`);
  }

  const rootMatch = css.match(/:root\s*\{[\s\S]*?\n\}/);
  if (!rootMatch) {
    return `:root {\n  ${name}: ${value};\n}\n\n${css}`;
  }

  const rootBlock = rootMatch[0];
  const inserted = rootBlock.replace(/\n\}/, `\n  ${name}: ${value};\n}`);
  return css.replace(rootBlock, inserted);
}

function upsertTokens(css) {
  let next = normaliseNewlines(css);
  for (const [name, value] of Object.entries(TOKEN_VALUES)) {
    next = upsertRootToken(next, name, value);
  }
  return next;
}

function setDeclarationsInBlock(css, selectorRegex, declarations, label) {
  const match = css.match(selectorRegex);
  if (!match) {
    throw new Error(`Cannot find CSS block: ${label}`);
  }

  const fullBlock = match[0];
  const openIndex = fullBlock.indexOf('{');
  const closeIndex = fullBlock.lastIndexOf('}');
  const header = fullBlock.slice(0, openIndex).trimEnd();
  let body = fullBlock.slice(openIndex + 1, closeIndex);

  for (const [prop, value] of Object.entries(declarations)) {
    const propRe = new RegExp(`\\n\\s*${escapeRegExp(prop)}\\s*:[^;]+;`, 'g');
    body = body.replace(propRe, '');
  }

  const lines = body.split('\n');
  let insertIndex = lines.findIndex((line) => /^\s*background\s*:/.test(line));
  if (insertIndex < 0) insertIndex = lines.findIndex((line) => /^\s*background-image\s*:/.test(line));
  if (insertIndex < 0) insertIndex = lines.length;

  const declarationLines = Object.entries(declarations).map(([prop, value]) => `  ${prop}: ${value};`);
  lines.splice(insertIndex, 0, ...declarationLines);

  const nextBody = lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
  const nextBlock = `${header} {\n${nextBody}\n}`;
  return css.replace(fullBlock, nextBlock);
}

function replaceOrAppendSimpleBlock(css, selector, declarations, afterSelectorRegex) {
  const declText = Object.entries(declarations)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');
  const nextBlock = `${selector} {\n${declText}\n}`;
  const selectorRe = new RegExp(`${escapeRegExp(selector)}\\s*\\{[\\s\\S]*?\\n\\}`, 'm');

  if (selectorRe.test(css)) {
    return css.replace(selectorRe, nextBlock);
  }

  const afterMatch = css.match(afterSelectorRegex);
  if (afterMatch) {
    return css.replace(afterMatch[0], `${afterMatch[0]}\n\n${nextBlock}`);
  }

  return `${css.trimEnd()}\n\n${nextBlock}\n`;
}

function patchPreviewFrame(css) {
  let next = normaliseNewlines(css);

  next = setDeclarationsInBlock(
    next,
    /\.gg-preview__hero\s*,\s*\n\.store-preview__hero\s*\{[\s\S]*?\n\}/m,
    {
      height: 'auto',
      'min-height': '0',
      'aspect-ratio': 'var(--gg-preview-hero-aspect)',
      'max-height': 'min(var(--gg-preview-hero-max-height), 72dvh)',
      overflow: 'hidden',
    },
    '.gg-preview__hero, .store-preview__hero',
  );

  // Use the existing content-lift tokens as the single source of visual reveal.
  // This keeps current guards happy and avoids inventing another parallel visual token.
  next = replaceOrAppendSimpleBlock(
    next,
    '.gg-preview__body',
    { 'margin-top': 'var(--gg-preview-content-lift)' },
    /\.gg-preview__body\s*,\s*\n\.store-preview__body\s*\{[\s\S]*?\n\}/m,
  );

  next = replaceOrAppendSimpleBlock(
    next,
    '.store-preview__body',
    { 'margin-top': 'var(--gg-preview-store-content-lift)' },
    /\.gg-preview__body\s*\{[\s\S]*?\n\}/m,
  );

  return `${next.trimEnd()}\n`;
}

function copyIfExists(fromRel, toRel) {
  if (!exists(fromRel) || !exists(toRel)) return false;
  write(toRel, read(fromRel));
  return true;
}

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, { cwd: root, stdio: 'inherit', shell: true });
}

function main() {
  console.log('Applying preview hero reveal contract...');

  const visualBefore = read(FILES.visualTokens);
  const visualAfter = upsertTokens(visualBefore);
  write(FILES.visualTokens, visualAfter);

  const previewBefore = read(FILES.previewFrame);
  const previewAfter = patchPreviewFrame(previewBefore);
  write(FILES.previewFrame, previewAfter);

  const mirroredPreview = copyIfExists(FILES.previewFrame, FILES.previewFrameMirror);
  const mirroredTokens = copyIfExists(FILES.visualTokens, FILES.visualTokensMirror);

  console.log('Updated:');
  console.log(`- ${FILES.visualTokens}`);
  console.log(`- ${FILES.previewFrame}`);
  if (mirroredPreview) console.log(`- ${FILES.previewFrameMirror}`);
  if (mirroredTokens) console.log(`- ${FILES.visualTokensMirror}`);

  console.log('\nContract now set to:');
  console.log(`- --gg-preview-hero-aspect: ${TOKEN_VALUES['--gg-preview-hero-aspect']}`);
  console.log(`- --gg-preview-hero-max-height: ${TOKEN_VALUES['--gg-preview-hero-max-height']}`);
  console.log(`- --gg-preview-content-lift: ${TOKEN_VALUES['--gg-preview-content-lift']}`);
  console.log(`- --gg-preview-store-content-lift: ${TOKEN_VALUES['--gg-preview-store-content-lift']}`);
  console.log('- hero max-height declaration: max-height: min(var(--gg-preview-hero-max-height), 72dvh)');

  if (runQa || runCi) {
    run('npm run gaga:sync-components');
    run('npm run store:build');
    run('npm run gaga:template:pack');
    run('npm run gaga:verify-sheet-lifecycle');
    run('npm run gaga:verify-store-modal-preview');
  }

  if (runCi) {
    run('npm run ci:cloudflare');
  }

  console.log('\nDone.');
}

try {
  main();
} catch (error) {
  console.error('\nPREVIEW HERO REVEAL FIX FAILED');
  console.error(error?.message || error);
  process.exit(1);
}
