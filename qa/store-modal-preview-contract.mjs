#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const changed = [];

function file(rel) {
  return path.join(root, rel);
}

function read(rel) {
  return fs.readFileSync(file(rel), 'utf8');
}

function write(rel, text) {
  const abs = file(rel);
  const before = fs.readFileSync(abs, 'utf8');
  if (before !== text) {
    fs.writeFileSync(abs, text);
    changed.push(rel);
  }
}

function patchPreviewFrame() {
  const rel = 'src/css/components/gg-preview-frame.css';
  let css = read(rel);
  const blockRe = /(\.gg-preview__hero,\s*\n\.store-preview__hero\s*\{)([\s\S]*?)(\n\})/m;
  const match = css.match(blockRe);
  if (!match) {
    throw new Error(`${rel}: cannot find .gg-preview__hero/.store-preview__hero block`);
  }

  let body = match[2];
  body = body
    .replace(/\n\s*height\s*:\s*[^;]+;/g, '')
    .replace(/\n\s*min-height\s*:\s*[^;]+;/g, '')
    .replace(/\n\s*max-height\s*:\s*[^;]+;/g, '')
    .replace(/\n\s*aspect-ratio\s*:\s*[^;]+;/g, '');

  const viewportSafe = [
    '  height: min(var(--gg-preview-hero-height), var(--gg-preview-hero-max-height));',
    '  min-height: 0;',
    '  max-height: var(--gg-preview-hero-max-height);',
    '  aspect-ratio: auto;',
  ].join('\n');

  if (/\n\s*z-index\s*:\s*0\s*;/.test(body)) {
    body = body.replace(/(\n\s*z-index\s*:\s*0\s*;)/, `$1\n${viewportSafe}`);
  } else {
    body = `\n${viewportSafe}${body}`;
  }

  css = css.replace(blockRe, `${match[1]}${body}${match[3]}`);
  write(rel, css);
}

function ensureToken(source, name, value, anchorName) {
  const line = `  ${name}: ${value};`;
  const re = new RegExp(`^\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:[^;]+;`, 'm');
  if (re.test(source)) return source.replace(re, line);

  const anchorRe = new RegExp(`^(\\s*${anchorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:[^;]+;)$`, 'm');
  if (anchorRe.test(source)) return source.replace(anchorRe, `$1\n${line}`);

  return source.replace(/(:root\s*\{)/, `$1\n${line}`);
}

function patchTokens() {
  const targets = [
    'src/css/modules/tokens.css',
    'src/css/components/gg-visual-tokens.css',
  ];
  for (const rel of targets) {
    if (!fs.existsSync(file(rel))) continue;
    let css = read(rel);
    css = ensureToken(css, '--gg-preview-hero-height', 'clamp(300px, 50dvh, 500px)', '--gg-preview-panel-initial-height');
    css = ensureToken(css, '--gg-preview-content-lift', 'clamp(56px, 10vw, 88px)', '--gg-preview-hero-aspect');
    css = ensureToken(css, '--gg-preview-store-content-lift', 'clamp(48px, 9vw, 76px)', '--gg-preview-content-lift');
    css = ensureToken(css, '--gg-preview-overlay-lift', 'var(--gg-preview-content-lift)', '--gg-preview-store-content-lift');
    css = css.replace(/--gg-preview-overlay-lift\s*:\s*clamp\(108px,\s*18vw,\s*148px\)\s*;/g, '--gg-preview-overlay-lift: var(--gg-preview-content-lift);');
    write(rel, css);
  }
}

patchPreviewFrame();
patchTokens();

console.log(changed.length ? `Updated:\n- ${changed.join('\n- ')}` : 'No source changes needed.');
console.log('Next: npm run gaga:sync-components && npm run gaga:template:pack && npm run gaga:verify-store-modal-preview && npm run ci:cloudflare');
