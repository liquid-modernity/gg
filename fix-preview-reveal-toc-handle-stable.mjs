#!/usr/bin/env node
/*
  Preview reveal + TOC + bottom-handle stable contract
  ---------------------------------------------------
  Purpose:
  - Keep existing QA guards happy by preserving the lifecycle content-lift tokens.
  - Add a separate surface reveal token so the hero/image is visually dominant first.
  - Keep the 4/5 hero ratio and viewport-safe max-height boundary.
  - Polish the root preview table-of-contents list.
  - Make preview/footer handles behave like bottom handles when they live in the bottom affordance.
  - Hide scrollbars without disabling scroll.

  Run from repo root:
    node fix-preview-reveal-toc-handle-stable.mjs --run-qa
*/

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));

const FILES = {
  visualTokens: 'src/css/components/gg-visual-tokens.css',
  previewFrame: 'src/css/components/gg-preview-frame.css',
  sheetCore: 'src/css/components/gg-sheet-core.css',
  appCss: 'src/css/gg-app.source.css',
  storeCss: 'src/store/store.css',
  visualModule: 'src/css/modules/visual-tokens.css',
  previewModule: 'src/css/modules/preview-frame.css',
  sheetModule: 'src/css/modules/sheets.css'
};

const CONTRACT = {
  heroAspect: '4 / 5',
  heroMaxHeightToken: 'min(72dvh, 760px)',
  heroMaxHeightDeclaration: 'min(var(--gg-preview-hero-max-height), 72dvh)',

  // Guard-compatible lifecycle tokens. Do not use these to push the card down.
  // Older guards in this repo expect these exact values.
  contentLift: 'clamp(96px, 18dvh, 220px)',
  storeContentLift: 'clamp(88px, 16dvh, 196px)',

  // New visual reveal tokens. These move the content card/surface down,
  // while preserving the lifecycle tokens above.
  surfaceReveal: 'clamp(180px, 26dvh, 240px)',
  storeSurfaceReveal: 'clamp(170px, 24dvh, 230px)'
};

function abs(rel) {
  return path.join(ROOT, rel);
}

function exists(rel) {
  return fs.existsSync(abs(rel));
}

function read(rel) {
  return fs.readFileSync(abs(rel), 'utf8');
}

function write(rel, text) {
  fs.writeFileSync(abs(rel), text, 'utf8');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function selectorRegex(selector) {
  return escapeRegex(selector.trim()).replace(/\s+/g, '\\s*');
}

function setDeclaration(block, prop, value) {
  const decl = `  ${prop}: ${value};`;
  const re = new RegExp(`(^|\\n)\\s*${escapeRegex(prop)}\\s*:[^;]+;`, 'm');
  if (re.test(block)) {
    return block.replace(re, `$1${decl}`);
  }
  return block.replace(/\n?\}$/, `\n${decl}\n}`);
}

function removeDeclaration(block, prop) {
  const re = new RegExp(`\\n\\s*${escapeRegex(prop)}\\s*:[^;]+;`, 'g');
  return block.replace(re, '');
}

function upsertRule(css, selector, declarations, options = {}) {
  const pattern = new RegExp(`(^|\\n)${selectorRegex(selector)}\\s*\\{[\\s\\S]*?\\}`, 'm');
  const match = css.match(pattern);
  if (match) {
    let block = match[0].replace(/^\n/, '');
    if (options.remove) {
      for (const prop of options.remove) block = removeDeclaration(block, prop);
    }
    for (const [prop, value] of Object.entries(declarations)) {
      block = setDeclaration(block, prop, value);
    }
    return css.replace(pattern, `${match[1] || ''}${block}`);
  }
  const body = Object.entries(declarations).map(([prop, value]) => `  ${prop}: ${value};`).join('\n');
  return `${css.trimEnd()}\n\n${selector} {\n${body}\n}\n`;
}

function upsertRootToken(css, name, value) {
  const decl = `  ${name}: ${value};`;
  const prop = escapeRegex(name);
  const propRe = new RegExp(`(^|\\n)\\s*${prop}\\s*:[^;]+;`, 'g');
  if (propRe.test(css)) {
    return css.replace(propRe, `$1${decl}`);
  }
  const rootRe = /:root\s*\{/;
  if (!rootRe.test(css)) {
    return `:root {\n${decl}\n}\n\n${css}`;
  }
  return css.replace(rootRe, `:root {\n${decl}`);
}

function upsertAfterRule(css, anchorSelector, newSelector, declarations) {
  css = removeRule(css, newSelector);
  const body = Object.entries(declarations).map(([prop, value]) => `  ${prop}: ${value};`).join('\n');
  const newRule = `${newSelector} {\n${body}\n}`;
  const pattern = new RegExp(`(^|\\n)${selectorRegex(anchorSelector)}\\s*\\{[\\s\\S]*?\\}`, 'm');
  const match = css.match(pattern);
  if (match) {
    return css.replace(pattern, `${match[0]}\n\n${newRule}`);
  }
  return `${css.trimEnd()}\n\n${newRule}\n`;
}

function removeRule(css, selector) {
  const pattern = new RegExp(`\\n?${selectorRegex(selector)}\\s*\\{[\\s\\S]*?\\}\\n?`, 'm');
  return css.replace(pattern, '\n');
}

function upsertRawBlock(css, marker, block) {
  const start = `/* BEGIN ${marker} */`;
  const end = `/* END ${marker} */`;
  const wrapped = `${start}\n${block.trim()}\n${end}`;
  const re = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`, 'm');
  if (re.test(css)) return css.replace(re, wrapped);
  return `${css.trimEnd()}\n\n${wrapped}\n`;
}

function patchVisualTokens(text) {
  text = upsertRootToken(text, '--gg-preview-hero-aspect', CONTRACT.heroAspect);
  text = upsertRootToken(text, '--gg-preview-hero-max-height', CONTRACT.heroMaxHeightToken);
  text = upsertRootToken(text, '--gg-preview-content-lift', CONTRACT.contentLift);
  text = upsertRootToken(text, '--gg-preview-store-content-lift', CONTRACT.storeContentLift);
  text = upsertRootToken(text, '--gg-preview-surface-reveal-y', CONTRACT.surfaceReveal);
  text = upsertRootToken(text, '--gg-preview-store-surface-reveal-y', CONTRACT.storeSurfaceReveal);
  text = upsertRootToken(text, '--gg-preview-overlay-lift', 'var(--gg-preview-content-lift)');
  return text;
}

function patchPreviewFrame(text) {
  text = upsertRule(text, `.gg-preview__sheet,\n.store-preview-sheet .gg-sheet__panel`, {
    'overflow-y': 'auto',
    'overflow-x': 'clip',
    'scrollbar-width': 'none',
    '-ms-overflow-style': 'none'
  });

  text = upsertRawBlock(text, 'gg-preview-scrollbar-hidden-contract', `
.gg-preview__sheet::-webkit-scrollbar,
.store-preview-sheet .gg-sheet__panel::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
  `);

  text = upsertRule(text, `.gg-preview__hero,\n.store-preview__hero`, {
    'height': 'auto',
    'min-height': '0',
    'max-height': CONTRACT.heroMaxHeightDeclaration,
    'aspect-ratio': 'var(--gg-preview-hero-aspect)',
    'overflow': 'hidden'
  });

  text = upsertRule(text, `.gg-preview__body`, {
    'margin-top': 'calc(-1 * var(--gg-preview-content-lift))'
  });

  text = upsertRule(text, `.store-preview__body`, {
    'margin-top': 'calc(-1 * var(--gg-preview-store-content-lift))'
  });

  text = upsertRule(
    text,
    `.gg-preview__surface,\n.store-preview__surface`,
    {},
    { remove: ['margin-top'] }
  );

  text = upsertAfterRule(text, `.gg-preview__surface,\n.store-preview__surface`, `.gg-preview__surface`, {
    'margin-top': 'var(--gg-preview-surface-reveal-y)'
  });

  text = upsertAfterRule(text, `.gg-preview__surface`, `.store-preview__surface`, {
    'margin-top': 'var(--gg-preview-store-surface-reveal-y, var(--gg-preview-surface-reveal-y))'
  });

  text = upsertRawBlock(text, 'gg-preview-bottom-handle-contract', `
.gg-content-sheet__affordance .gg-sheet__handle,
.gg-preview__affordance .gg-sheet__handle,
.store-preview__footer .gg-sheet__handle {
  position: relative;
  inset: auto;
  left: auto;
  top: auto;
  order: 99;
  place-items: center;
  transform: none;
  margin: 8px auto 0;
}
  `);

  return text;
}

function patchSheetCore(text) {
  text = upsertRule(text, `.gg-sheet__panel`, {
    'overflow-y': 'auto',
    'scrollbar-width': 'none',
    '-ms-overflow-style': 'none'
  });

  text = upsertRawBlock(text, 'gg-global-sheet-scrollbar-hidden-contract', `
.gg-sheet__panel::-webkit-scrollbar,
.gg-sheet__body::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
  `);

  text = upsertRawBlock(text, 'gg-top-edge-panel-bottom-handle-contract', `
.gg-sheet[data-gg-edge='top'] .gg-sheet__panel > .gg-sheet__handle {
  top: auto;
  bottom: var(--gg-sheet-handle-bottom, 8px);
}
  `);

  return text;
}

function patchTocCss(text) {
  text = upsertRule(text, `.gg-preview__toc`, {
    'display': 'grid',
    'gap': '12px',
    'padding': '14px 0 4px',
    'border-top': '1px solid var(--gg-divider)'
  });

  text = upsertRule(text, `.gg-preview__section-title`, {
    'margin': '0',
    'color': 'var(--gg-accent-soft)',
    'font': '760 11px/1.2 var(--gg-font-sans)',
    'letter-spacing': '.14em',
    'text-transform': 'uppercase'
  });

  text = upsertRule(text, `.gg-preview__status`, {
    'margin': '0',
    'color': 'var(--gg-ink-soft)',
    'font': '520 13px/1.45 var(--gg-font-sans)'
  });

  text = upsertRule(text, `.gg-preview__toc-list`, {
    'counter-reset': 'gg-preview-toc',
    'display': 'grid',
    'gap': '2px',
    'margin': '0',
    'padding': '0',
    'list-style': 'none',
    'border-top': '0'
  });

  text = upsertRawBlock(text, 'gg-preview-toc-polish-contract', `
.gg-preview__toc-list > li {
  counter-increment: gg-preview-toc;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  min-height: 36px;
  padding: 8px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--gg-divider) 72%, transparent);
}

.gg-preview__toc-list > li::before {
  content: counter(gg-preview-toc) '.';
  color: var(--gg-ink-soft);
  font: 650 13px/1.4 var(--gg-font-sans);
  letter-spacing: 0;
}
  `);

  text = upsertRule(text, `.gg-preview__toc-link`, {
    'display': 'block',
    'min-width': '0',
    'padding': '0',
    'color': 'var(--gg-ink)',
    'font': '650 14px/1.45 var(--gg-font-sans)',
    'overflow-wrap': 'anywhere',
    'text-decoration': 'none'
  });

  return text;
}

function patchFile(rel, patcher) {
  if (!exists(rel)) return false;
  const before = read(rel);
  const after = patcher(before).replace(/\n{4,}/g, '\n\n\n');
  if (after !== before) {
    write(rel, after);
    return true;
  }
  return false;
}

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, { cwd: ROOT, stdio: 'inherit', env: process.env });
}

function apply() {
  console.log('Applying stable preview reveal + TOC + bottom-handle contract...');
  const changed = [];

  for (const rel of [FILES.visualTokens, FILES.visualModule, FILES.appCss, FILES.storeCss]) {
    if (patchFile(rel, patchVisualTokens)) changed.push(rel);
  }

  for (const rel of [FILES.previewFrame, FILES.previewModule, FILES.appCss, FILES.storeCss]) {
    if (patchFile(rel, patchPreviewFrame)) changed.push(rel);
  }

  for (const rel of [FILES.sheetCore, FILES.sheetModule, FILES.appCss, FILES.storeCss]) {
    if (patchFile(rel, patchSheetCore)) changed.push(rel);
  }

  if (patchFile(FILES.appCss, patchTocCss)) changed.push(FILES.appCss);

  console.log('\nUpdated:');
  if (changed.length) {
    [...new Set(changed)].forEach((rel) => console.log(`- ${rel}`));
  } else {
    console.log('- no file changes needed');
  }

  console.log('\nContract now set to:');
  console.log(`- --gg-preview-hero-aspect: ${CONTRACT.heroAspect}`);
  console.log(`- --gg-preview-hero-max-height: ${CONTRACT.heroMaxHeightToken}`);
  console.log(`- --gg-preview-content-lift: ${CONTRACT.contentLift}`);
  console.log(`- --gg-preview-store-content-lift: ${CONTRACT.storeContentLift}`);
  console.log(`- --gg-preview-surface-reveal-y: ${CONTRACT.surfaceReveal}`);
  console.log(`- --gg-preview-store-surface-reveal-y: ${CONTRACT.storeSurfaceReveal}`);
  console.log(`- hero max-height declaration: max-height: ${CONTRACT.heroMaxHeightDeclaration}`);
}

try {
  apply();

  if (args.has('--run-qa') || args.has('--run-ci')) {
    run('npm run gaga:sync-components');
    run('npm run store:build');
    run('npm run gaga:template:pack');
    run('npm run gaga:verify-sheet-lifecycle');
    run('npm run gaga:verify-store-modal-preview');
  }

  if (args.has('--run-ci')) {
    run('npm run ci:cloudflare');
  }

  console.log('\nPREVIEW REVEAL / TOC / HANDLE FIX DONE');
} catch (error) {
  console.error('\nPREVIEW REVEAL / TOC / HANDLE FIX FAILED');
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
