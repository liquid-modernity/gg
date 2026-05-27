#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';

const root = process.cwd();
const changed = [];
const warnings = [];

function abs(rel) { return path.join(root, rel); }
function exists(rel) { return fs.existsSync(abs(rel)); }
function read(rel) { return fs.readFileSync(abs(rel), 'utf8'); }
function write(rel, text) {
  const file = abs(rel);
  const before = fs.readFileSync(file, 'utf8');
  if (before !== text) {
    fs.writeFileSync(file, text);
    changed.push(rel);
  }
}
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function ensureLine(source, name, value, anchorName) {
  const line = `  ${name}: ${value};`;
  const re = new RegExp(`^\\s*${escapeRe(name)}\\s*:[^;]+;`, 'm');
  if (re.test(source)) return source.replace(re, line);
  const anchorRe = anchorName ? new RegExp(`^(\\s*${escapeRe(anchorName)}\\s*:[^;]+;)$`, 'm') : null;
  if (anchorRe && anchorRe.test(source)) return source.replace(anchorRe, `$1\n${line}`);
  return source.replace(/(:root\s*\{)/, `$1\n${line}`);
}

function patchHeroBlockInCss(css, rel) {
  const blockRe = /(\.gg-preview__hero,\s*\n\.store-preview__hero\s*\{)([\s\S]*?)(\n\})/m;
  const match = css.match(blockRe);
  if (!match) throw new Error(`${rel}: cannot find combined .gg-preview__hero/.store-preview__hero block`);

  let body = match[2];
  body = body
    .replace(/\n\s*height\s*:\s*[^;]+;/g, '')
    .replace(/\n\s*min-height\s*:\s*[^;]+;/g, '')
    .replace(/\n\s*max-height\s*:\s*[^;]+;/g, '')
    .replace(/\n\s*aspect-ratio\s*:\s*[^;]+;/g, '');

  const required = [
    '  height: min(var(--gg-preview-hero-height), var(--gg-preview-hero-max-height));',
    '  min-height: 0;',
    '  max-height: var(--gg-preview-hero-max-height);',
    '  aspect-ratio: auto;',
  ].join('\n');

  // Put the contract immediately after z-index:0 if present, otherwise right after the block opens.
  if (/\n\s*z-index\s*:\s*0\s*;/.test(body)) {
    body = body.replace(/(\n\s*z-index\s*:\s*0\s*;)/, `$1\n${required}`);
  } else {
    body = `\n${required}${body}`;
  }

  return css.replace(blockRe, `${match[1]}${body}${match[3]}`);
}

function patchPreviewSource() {
  const rel = 'src/css/components/gg-preview-frame.css';
  if (!exists(rel)) throw new Error(`${rel} missing`);
  let css = read(rel);
  css = patchHeroBlockInCss(css, rel);

  const rootLift = 'margin-top: calc(-1 * var(--gg-preview-content-lift))';
  const storeLift = 'margin-top: calc(-1 * var(--gg-preview-store-content-lift))';
  if (!css.includes(rootLift)) {
    css = css.replace(/(\.gg-preview__surface,\s*\n\.store-preview__surface\s*\{[\s\S]*?\n\})/m, `$1\n\n.gg-preview__surface {\n  ${rootLift};\n}`);
  }
  if (!css.includes(storeLift)) {
    css = css.replace(/(\.store-preview__surface\s*\{[\s\S]*?\n\})/m, `$1\n\n.store-preview__surface {\n  ${storeLift};\n}`);
    if (!css.includes(storeLift)) {
      css += `\n\n.store-preview__surface {\n  ${storeLift};\n}\n`;
    }
  }
  write(rel, css);
}

function patchTokensFile(rel) {
  if (!exists(rel)) return;
  let css = read(rel);
  css = ensureLine(css, '--gg-preview-hero-height', 'clamp(300px, 50dvh, 500px)', '--gg-preview-panel-initial-height');
  css = ensureLine(css, '--gg-preview-hero-max-height', 'calc(var(--gg-preview-panel-max-height) * .62)', '--gg-preview-hero-height');
  css = ensureLine(css, '--gg-preview-hero-aspect', '4 / 5', '--gg-preview-hero-max-height');
  css = ensureLine(css, '--gg-preview-content-lift', 'clamp(56px, 10vw, 88px)', '--gg-preview-hero-aspect');
  css = ensureLine(css, '--gg-preview-store-content-lift', 'clamp(48px, 9vw, 76px)', '--gg-preview-content-lift');
  css = ensureLine(css, '--gg-preview-overlay-lift', 'var(--gg-preview-content-lift)', '--gg-preview-store-content-lift');
  css = css.replace(/--gg-preview-overlay-lift\s*:\s*clamp\(108px,\s*18vw,\s*148px\)\s*;/g, '--gg-preview-overlay-lift: var(--gg-preview-content-lift);');
  write(rel, css);
}

function patchGeneratedBlock(rel) {
  if (!exists(rel)) return;
  let css = read(rel);
  const source = read('src/css/components/gg-preview-frame.css').trim();
  const blockRe = /\/\* BEGIN GENERATED: gg-preview-frame \*\/[\s\S]*?\/\* END GENERATED: gg-preview-frame \*\//m;
  const replacement = `/* BEGIN GENERATED: gg-preview-frame */\n${source}\n/* END GENERATED: gg-preview-frame */`;
  if (blockRe.test(css)) {
    css = css.replace(blockRe, replacement);
  } else if (/\.gg-preview__hero,\s*\n\.store-preview__hero\s*\{/m.test(css)) {
    css = patchHeroBlockInCss(css, rel);
  }
  write(rel, css);
}

function cleanupMisplacedTempScript() {
  const rel = 'qa/store-modal-preview-contract.mjs';
  if (exists(rel)) {
    fs.rmSync(abs(rel));
    changed.push(`${rel} (removed temporary patch script from qa/)`);
  }
}

function syncComponentsIfAvailable() {
  if (!exists('tools/sync-shared-css-components.mjs')) return;
  try {
    childProcess.execFileSync('npm', ['run', 'gaga:sync-components'], { cwd: root, stdio: 'inherit' });
  } catch (error) {
    warnings.push('npm run gaga:sync-components failed; run it manually after this script.');
  }
}

function verifyLocalContract() {
  const files = [
    'src/css/components/gg-preview-frame.css',
    'src/css/gg-app.source.css',
    'src/store/store.css',
  ].filter(exists);
  const heroRe = /\.gg-preview__hero,\s*\.store-preview__hero\s*\{[\s\S]*?height:\s*min\(var\(--gg-preview-hero-height\), var\(--gg-preview-hero-max-height\)\)[\s\S]*?min-height:\s*0[\s\S]*?max-height:\s*var\(--gg-preview-hero-max-height\)[\s\S]*?aspect-ratio:\s*auto/m;
  const failures = [];
  for (const rel of files) {
    const css = read(rel);
    const source = rel.includes('gg-app.source') || rel.includes('store.css')
      ? (css.match(/\/\* BEGIN GENERATED: gg-preview-frame \*\/[\s\S]*?\/\* END GENERATED: gg-preview-frame \*\//m)?.[0] || css)
      : css;
    if (!heroRe.test(source)) failures.push(`${rel}: preview hero contract still missing`);
  }
  const tokenFiles = ['src/css/modules/tokens.css', 'src/css/components/gg-visual-tokens.css', 'src/store/store.css'].filter(exists);
  for (const rel of tokenFiles) {
    const css = read(rel);
    if (!css.includes('--gg-preview-content-lift: clamp(56px, 10vw, 88px)')) failures.push(`${rel}: missing root preview lift token`);
    if (!css.includes('--gg-preview-store-content-lift: clamp(48px, 9vw, 76px)')) failures.push(`${rel}: missing store preview lift token`);
  }
  if (failures.length) throw new Error(`Local contract still failing:\n- ${failures.join('\n- ')}`);
}

cleanupMisplacedTempScript();
patchPreviewSource();
patchTokensFile('src/css/modules/tokens.css');
patchTokensFile('src/css/components/gg-visual-tokens.css');
patchTokensFile('src/store/store.css');
syncComponentsIfAvailable();
// Extra direct generated-block normalization, in case local sync missed a surface.
for (const rel of ['src/css/gg-app.source.css', 'landing.html', 'src/store/store.css']) patchGeneratedBlock(rel);
verifyLocalContract();

console.log(changed.length ? `Updated:\n- ${changed.join('\n- ')}` : 'No source changes needed.');
for (const warning of warnings) console.warn(`WARN: ${warning}`);
console.log('Next commands:');
console.log('npm run gaga:template:pack');
console.log('npm run gaga:verify-store-modal-preview');
console.log('npm run ci:cloudflare');
