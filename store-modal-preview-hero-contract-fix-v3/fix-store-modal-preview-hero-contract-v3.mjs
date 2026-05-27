#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const changed = [];
const warnings = [];

function abs(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(abs(p)); }
function read(p) { return fs.readFileSync(abs(p), 'utf8'); }
function writeIfChanged(p, next) {
  const file = abs(p);
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (prev !== next) {
    fs.writeFileSync(file, next);
    changed.push(p);
  }
}
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

if (!exists('package.json') || !exists('src/css/components/gg-preview-frame.css')) {
  console.error('Run this script from the repository root, beside package.json.');
  process.exit(1);
}

const HERO_BLOCK = `.gg-preview__hero,
.store-preview__hero {
  position: sticky;
  top: 0;
  z-index: 0;
  height: min(var(--gg-preview-hero-height), var(--gg-preview-hero-max-height));
  min-height: 0;
  max-height: var(--gg-preview-hero-max-height);
  aspect-ratio: auto;
  overflow: hidden;
  background: #201a1c;
  background:
    radial-gradient(circle at 22% 14%, color-mix(in srgb, var(--gg-accent-soft) 24%, transparent), transparent 32%),
    linear-gradient(135deg, color-mix(in srgb, var(--gg-accent) 92%, #000), #141012 72%);
}`;

function replaceHeroBlock(source, label) {
  const re = /\.gg-preview__hero,\s*\.store-preview__hero\s*\{[\s\S]*?\n\}/m;
  if (!re.test(source)) {
    warnings.push(`${label}: could not find shared .gg-preview__hero/.store-preview__hero block`);
    return source;
  }
  return source.replace(re, HERO_BLOCK);
}

function ensureMediaAspect(source) {
  // Preserve the required container contract while still allowing the visual media plane to own the 4/5 token.
  const mediaRe = /(\.gg-preview__media,\s*\n\.store-preview__slide\s*\{[\s\S]*?)(\n\})/m;
  if (mediaRe.test(source)) {
    source = source.replace(mediaRe, (match, body, close) => {
      let next = body.replace(/\n\s*aspect-ratio:\s*[^;]+;/g, '');
      if (!next.includes('aspect-ratio: var(--gg-preview-hero-aspect);')) {
        next += `\n  aspect-ratio: var(--gg-preview-hero-aspect);`;
      }
      return `${next}${close}`;
    });
  } else {
    warnings.push('preview frame: could not find .gg-preview__media/.store-preview__slide block for 4/5 visual token');
  }
  return source;
}

function ensureToken(source, name, value) {
  const decl = `${name}: ${value};`;
  const re = new RegExp(`${escapeRegExp(name)}\\s*:\\s*[^;]+;`);
  if (re.test(source)) return source.replace(re, decl);
  const rootRe = /(:root\s*\{)/;
  if (rootRe.test(source)) return source.replace(rootRe, `$1\n  ${decl}`);
  return `${source.trimEnd()}\n\n:root {\n  ${decl}\n}\n`;
}

function patchTokens(source) {
  source = ensureToken(source, '--gg-preview-hero-height', 'clamp(300px, 50dvh, 500px)');
  source = ensureToken(source, '--gg-preview-hero-max-height', 'calc(var(--gg-preview-panel-max-height) * .62)');
  source = ensureToken(source, '--gg-preview-hero-aspect', '4 / 5');
  source = ensureToken(source, '--gg-preview-content-lift', 'clamp(56px, 10vw, 88px)');
  source = ensureToken(source, '--gg-preview-store-content-lift', 'clamp(48px, 9vw, 76px)');
  source = source.replace(/--gg-preview-overlay-lift:\s*clamp\(108px,\s*18vw,\s*148px\);/g, '--gg-preview-overlay-lift: var(--gg-preview-content-lift);');
  return source;
}

function patchCssFile(p, { preview = false, tokens = false } = {}) {
  if (!exists(p)) return;
  let source = read(p);
  if (preview) {
    source = replaceHeroBlock(source, p);
    source = ensureMediaAspect(source);
  }
  if (tokens) source = patchTokens(source);
  writeIfChanged(p, source);
}

// Canonical component/token sources.
patchCssFile('src/css/components/gg-preview-frame.css', { preview: true });
patchCssFile('src/css/components/gg-visual-tokens.css', { tokens: true });
patchCssFile('src/css/modules/tokens.css', { tokens: true });

// Build-generated mirrors are patched too so individual guards pass even before a full build.
for (const p of [
  'src/css/modules/preview-frame.css',
  'src/css/gg-app.source.css',
  'src/store/store.css',
  '__gg/assets/css/gg-app.dev.css',
  '__gg/assets/css/gg-app.min.css',
  'dist/assets/css/gg-app.dev.css',
  'dist/assets/css/gg-app.min.css',
  'assets/store/store.css',
  '.cloudflare-build/public/__gg/assets/css/gg-app.dev.css',
  '.cloudflare-build/public/__gg/assets/css/gg-app.min.css',
  '.cloudflare-build/public/assets/store/store.css',
]) patchCssFile(p, { preview: true, tokens: p.includes('store.css') });

// Remove mistakenly installed one-off QA patcher if present.
for (const stale of ['qa/store-modal-preview-contract.mjs']) {
  if (exists(stale)) {
    fs.unlinkSync(abs(stale));
    changed.push(`${stale} (removed)`);
  }
}

// Re-run component sync if available, then reapply exact hero block to synced outputs.
if (exists('tools/sync-shared-css-components.mjs')) {
  const sync = spawnSync(process.execPath, ['tools/sync-shared-css-components.mjs'], { cwd: root, stdio: 'inherit' });
  if (sync.status !== 0) warnings.push('tools/sync-shared-css-components.mjs exited non-zero; run npm run gaga:sync-components manually');
  for (const p of ['src/css/modules/preview-frame.css', 'src/css/gg-app.source.css', 'src/store/store.css']) {
    patchCssFile(p, { preview: true, tokens: p === 'src/store/store.css' });
  }
}

console.log('STORE MODAL PREVIEW HERO CONTRACT FIX V3 DONE');
if (changed.length) {
  console.log('Changed files:');
  for (const p of [...new Set(changed)]) console.log(`- ${p}`);
} else {
  console.log('No file changes needed.');
}
if (warnings.length) {
  console.warn('Warnings:');
  for (const w of warnings) console.warn(`- ${w}`);
}
console.log('\nNext commands:');
console.log('npm run gaga:template:pack');
console.log('npm run gaga:verify-sheet-lifecycle');
console.log('npm run gaga:verify-store-modal-preview');
console.log('npm run ci:cloudflare');
