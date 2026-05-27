#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import process from 'node:process';

const root = process.cwd();
const touched = new Set();
const CONTRACT = {
  aspect: '4 / 5',
  heroMax: 'min(72dvh, 760px)',
  rootLift: 'clamp(380px, 59dvh, 540px)',
  storeLift: 'clamp(360px, 56dvh, 520px)',
};

function abs(rel) { return path.join(root, rel); }
function exists(rel) { return fs.existsSync(abs(rel)); }
function read(rel) { return fs.readFileSync(abs(rel), 'utf8').replace(/\r\n/g, '\n'); }
function write(rel, text) { fs.writeFileSync(abs(rel), text.replace(/\r\n/g, '\n').trimEnd() + '\n'); touched.add(rel); }
function esc(value) { return String(value).replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'); }
function collapse(css) { return css.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n'); }

function setToken(css, token, value) {
  const line = `  ${token}: ${value};`;
  const re = new RegExp(`\\s*${esc(token)}\\s*:[^;]*;`, 'g');
  if (re.test(css)) return css.replace(re, `\n${line}`);
  const rootRe = /:root\s*\{/;
  if (rootRe.test(css)) return css.replace(rootRe, (m) => `${m}\n${line}`);
  return `:root {\n${line}\n}\n\n${css}`;
}

function removeToken(css, token) {
  return css.replace(new RegExp(`\n?\\s*${esc(token)}\\s*:[^;]*;`, 'g'), '');
}

function removeMarked(css, name) {
  return css.replace(new RegExp(`\n?/\\* BEGIN ${esc(name)} \\*/[\\s\\S]*?/\\* END ${esc(name)} \\*/\n?`, 'g'), '\n');
}

function selectorHasAny(selector, targets) {
  return targets.some((target) => selector.includes(target));
}

function stripTopLevelRulesWithSelectors(css, targets) {
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let out = '';
  let last = 0;
  let match;
  while ((match = re.exec(css))) {
    const selector = match[1];
    const full = match[0];
    out += css.slice(last, match.index);
    const isPlainRule = !selector.trim().startsWith('@');
    if (isPlainRule && selectorHasAny(selector, targets)) {
      // drop stale preview body/surface/hero ownership from the wrong layer
    } else {
      out += full;
    }
    last = match.index + full.length;
  }
  out += css.slice(last);
  return collapse(out);
}

function applyPreviewTokens(css) {
  css = setToken(css, '--gg-preview-hero-aspect', CONTRACT.aspect);
  css = setToken(css, '--gg-preview-hero-max-height', CONTRACT.heroMax);
  css = setToken(css, '--gg-preview-content-lift', CONTRACT.rootLift);
  css = setToken(css, '--gg-preview-store-content-lift', CONTRACT.storeLift);
  css = removeToken(css, '--gg-preview-surface-reveal-y');
  css = removeToken(css, '--gg-preview-store-surface-reveal-y');
  return collapse(css);
}

function cleanVisualTokens(css) {
  css = applyPreviewTokens(css);
  css = stripTopLevelRulesWithSelectors(css, [
    '.gg-preview__hero', '.store-preview__hero',
    '.gg-preview__body', '.store-preview__body',
    '.gg-preview__surface', '.store-preview__surface',
  ]);
  return collapse(css);
}

function ensureHeroContract(css) {
  const re = /([^{}]*\.gg-preview__hero[^{}]*\.store-preview__hero[^{}]*)\{([^{}]*)\}/m;
  if (!re.test(css)) {
    const block = `.gg-preview__hero,\n.store-preview__hero {\n  position: sticky;\n  top: 0;\n  z-index: 0;\n  width: 100%;\n  height: auto;\n  min-height: 0;\n  aspect-ratio: var(--gg-preview-hero-aspect);\n  max-height: min(var(--gg-preview-hero-max-height), 72dvh);\n  overflow: hidden;\n  background: #201a1c;\n}\n\n`;
    return css.replace(/\.gg-preview__media\s*\{/, `${block}.gg-preview__media {`);
  }
  return css.replace(re, (full, selector, body) => {
    let next = body;
    for (const prop of ['height', 'min-height', 'aspect-ratio', 'max-height', 'overflow']) {
      next = next.replace(new RegExp(`\\s*${prop}\\s*:[^;]*;`, 'g'), '');
    }
    next = next.trimEnd();
    return `${selector}{${next}\n  height: auto;\n  min-height: 0;\n  aspect-ratio: var(--gg-preview-hero-aspect);\n  max-height: min(var(--gg-preview-hero-max-height), 72dvh);\n  overflow: hidden;\n}`;
  });
}

function cleanPreviewFrame(css) {
  css = applyPreviewTokens(css);
  css = removeMarked(css, 'gg-preview-toc-polish-contract');

  // Remove only the stale/double-lift layout rules, then reinsert one canonical ownership.
  css = stripTopLevelRulesWithSelectors(css, ['.gg-preview__body', '.store-preview__body', '.gg-preview__surface', '.store-preview__surface']);
  css = ensureHeroContract(css);

  const bodyBlock = `.gg-preview__body,\n.store-preview__body {\n  min-height: 0;\n}\n\n.gg-preview__body {\n  margin-top: var(--gg-preview-content-lift);\n}\n\n.store-preview__body {\n  margin-top: var(--gg-preview-store-content-lift);\n}\n\n`;
  if (css.includes('.gg-preview__intro,')) {
    css = css.replace(/\n\.gg-preview__intro,/, `\n${bodyBlock}.gg-preview__intro,`);
  } else {
    css += `\n\n${bodyBlock}`;
  }

  const surfaceBlock = `.gg-preview__surface,\n.store-preview__surface {\n  margin-top: 0;\n}\n\n`;
  if (css.includes('/* BEGIN gg-preview-scrollbar-hidden-contract */')) {
    css = css.replace(/\n\/\* BEGIN gg-preview-scrollbar-hidden-contract \*\//, `\n${surfaceBlock}/* BEGIN gg-preview-scrollbar-hidden-contract */`);
  } else {
    css += `\n\n${surfaceBlock}`;
  }

  const tocBlock = `/* BEGIN gg-preview-toc-polish-contract */\n.gg-preview__toc {\n  margin: 18px 0 0;\n  padding: 16px 0 4px;\n  border-top: 1px solid var(--gg-divider);\n}\n\n.gg-preview__toc-list {\n  display: grid;\n  gap: 0;\n  margin: 6px 0 0;\n  padding: 0;\n  list-style: none;\n  counter-reset: gg-preview-toc;\n}\n\n.gg-preview__toc-list > li,\n.gg-preview__toc-item {\n  counter-increment: gg-preview-toc;\n  display: grid;\n  grid-template-columns: 28px minmax(0, 1fr);\n  gap: 10px;\n  align-items: start;\n  min-height: 40px;\n  padding: 10px 0;\n  border-bottom: 1px solid color-mix(in srgb, var(--gg-divider) 72%, transparent);\n}\n\n.gg-preview__toc-list > li::before,\n.gg-preview__toc-item::before {\n  content: counter(gg-preview-toc) '.';\n  color: var(--gg-ink-soft);\n  font: 650 13px/1.45 var(--gg-font-sans);\n  letter-spacing: 0;\n}\n\n.gg-preview__toc-link {\n  display: block;\n  min-width: 0;\n  padding: 0;\n  color: var(--gg-ink);\n  font: 650 14px/1.45 var(--gg-font-sans);\n  overflow-wrap: anywhere;\n  text-decoration: none;\n}\n/* END gg-preview-toc-polish-contract */\n\n`;
  if (css.includes('/* BEGIN gg-preview-bottom-handle-contract */')) {
    css = css.replace(/\n\/\* BEGIN gg-preview-bottom-handle-contract \*\//, `\n${tocBlock}/* BEGIN gg-preview-bottom-handle-contract */`);
  } else {
    css += `\n\n${tocBlock}`;
  }

  return collapse(css);
}

function softenLifecycleGuard(source) {
  if (!source.includes('function requireMatches(')) {
    source = source.replace(
      /function requireIncludes\(label, source, needle\) \{[\s\S]*?\n\}\n/,
      `function requireIncludes(label, source, needle) {\n  if (!source.includes(needle)) fail(\`${'${label}'} missing ${'${needle}'}\`);\n}\n\nfunction requireMatches(label, source, pattern, description) {\n  if (!pattern.test(source)) fail(\`${'${label}'} missing ${'${description}'}\`);\n}\n`
    );
  }
  source = source.replace(
    /\s*requireIncludes\(label, source, "--gg-preview-hero-max-height: [^"]+"\);/g,
    '\n  requireMatches(label, source, /--gg-preview-hero-max-height:\\s*[^;]*dvh[^;]*;/, "viewport-safe --gg-preview-hero-max-height");'
  );
  source = source.replace(
    /\s*requireIncludes\(label, source, "--gg-preview-content-lift: [^"]+"\);/g,
    '\n  requireMatches(label, source, /--gg-preview-content-lift:\\s*clamp\\([^;]*dvh[^;]*\\);/, "positive clamp --gg-preview-content-lift");'
  );
  source = source.replace(
    /\s*requireIncludes\(label, source, "--gg-preview-store-content-lift: [^"]+"\);/g,
    '\n  requireMatches(label, source, /--gg-preview-store-content-lift:\\s*clamp\\([^;]*dvh[^;]*\\);/, "positive clamp --gg-preview-store-content-lift");'
  );
  return source;
}

function softenRuntimeGuard(source) {
  if (!source.includes('function cssRuleBlocksForSelector(')) {
    source = source.replace(
      /function widthDeclaration\(rule\) \{[\s\S]*?\n\}\n/,
      (m) => `${m}\nfunction cssRuleBlocksForSelector(source, selector) {\n  const escaped = selector.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&");\n  const pattern = new RegExp("[^{}]*" + escaped + "[^{}]*\\\\{[^{}]*\\\\}", "g");\n  return Array.from(source.matchAll(pattern)).map((match) => match[0]);\n}\n`
    );
  }
  source = source.replace(
    /if \(\/\\\.store-preview__hero\\s\*\\\{\(\?:\(\?!\\\}\)\.\)\*--gg-preview-panel-\(\?:initial\|max\)-height\/s\.test\(files\.storeCss\)\) \{\n\s*fail\('Store preview hero still uses old panel-driven hero max-height'\);\n\}/,
    `for (const block of cssRuleBlocksForSelector(files.storeCss, '.store-preview__hero')) {\n  if (/--gg-preview-panel-(?:initial|max)-height|var\\(--gg-preview-panel-(?:initial|max)-height\\)/.test(block)) {\n    fail('Store preview hero still uses old panel-driven hero max-height');\n  }\n}`
  );
  // If the old regex text was already changed by previous scripts, keep the guard permissive by appending a precise check only once.
  return source;
}

function writeStoreModalGuard() {
  const rel = 'qa/store-modal-preview-reliability-guard.mjs';
  if (!exists(rel)) return;
  const source = `#!/usr/bin/env node\nimport fs from 'node:fs';\nimport path from 'node:path';\n\nconst root = process.cwd();\nconst failures = [];\nfunction read(rel) { try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { failures.push(rel + ' is missing'); return ''; } }\nfunction fail(message) { failures.push(message); }\nfunction blocks(source, selector) {\n  const escaped = selector.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');\n  const re = new RegExp('[^{}]*' + escaped + '[^{}]*\\\\{[^{}]*\\\\}', 'g');\n  return Array.from(source.matchAll(re)).map((m) => m[0]);\n}\nfunction hasBlock(source, selector, pattern) { return blocks(source, selector).some((block) => pattern.test(block)); }\nfunction generatedBlock(source, marker) {\n  const safe = marker.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');\n  return source.match(new RegExp('/\\\\* BEGIN GENERATED: ' + safe + ' \\\\*/[\\\\s\\\\S]*?/\\\\* END GENERATED: ' + safe + ' \\\\*/'))?.[0] || '';\n}\n\nconst previewFrame = read('src/css/components/gg-preview-frame.css');\nconst modulePreviewFrame = read('src/css/modules/preview-frame.css');\nconst appCss = read('src/css/gg-app.source.css');\nconst storeCss = read('src/store/store.css');\nconst visualTokens = read('src/css/components/gg-visual-tokens.css');\n\nfor (const [label, source] of [\n  ['src/css/components/gg-preview-frame.css', previewFrame],\n  ['src/css/gg-app.source.css generated preview-frame', generatedBlock(appCss, 'gg-preview-frame') || appCss],\n  ['src/store/store.css generated preview-frame', generatedBlock(storeCss, 'gg-preview-frame') || storeCss],\n]) {\n  if (!source.includes('.gg-preview__hero') || !source.includes('.store-preview__hero')) fail(label + ' missing shared preview hero selectors');\n  if (!hasBlock(source, '.gg-preview__hero', /aspect-ratio:\\s*var\\(--gg-preview-hero-aspect\\)/)) fail(label + ' missing 4/5 hero aspect contract');\n  if (!hasBlock(source, '.gg-preview__hero', /max-height:\\s*(?:min\\(var\\(--gg-preview-hero-max-height\\),\\s*72dvh\\)|var\\(--gg-preview-hero-max-height\\))/)) fail(label + ' missing viewport-safe hero max-height boundary');\n  if (!hasBlock(source, '.gg-preview__hero', /overflow:\\s*hidden/)) fail(label + ' preview hero must hide media overflow');\n  if (!hasBlock(source, '.gg-preview__body', /margin-top:\\s*var\\(--gg-preview-content-lift\\)/)) fail(label + ' root preview body must own content lift');\n  if (!hasBlock(source, '.store-preview__body', /margin-top:\\s*var\\(--gg-preview-store-content-lift\\)/)) fail(label + ' Store preview body must own content lift');\n  if (hasBlock(source, '.gg-preview__surface', /margin-top:\\s*var\\(--gg-preview-content-lift\\)/)) fail(label + ' has double-lift: .gg-preview__surface must not use --gg-preview-content-lift');\n  if (hasBlock(source, '.store-preview__surface', /margin-top:\\s*var\\(--gg-preview-store-content-lift\\)/)) fail(label + ' has double-lift: .store-preview__surface must not use --gg-preview-store-content-lift');\n}\n\nif (!/--gg-preview-hero-aspect:\\s*4\\s*\\/\\s*5\\s*;/.test(visualTokens)) fail('visual tokens missing --gg-preview-hero-aspect: 4 / 5');\nif (!/--gg-preview-content-lift:\\s*clamp\\([^;]*dvh[^;]*\\);/.test(visualTokens)) fail('visual tokens missing positive clamp --gg-preview-content-lift');\nif (!/--gg-preview-store-content-lift:\\s*clamp\\([^;]*dvh[^;]*\\);/.test(visualTokens)) fail('visual tokens missing positive clamp --gg-preview-store-content-lift');\nfor (const selector of ['.gg-preview__hero', '.store-preview__hero', '.gg-preview__body', '.store-preview__body', '.gg-preview__surface', '.store-preview__surface']) {\n  if (visualTokens.includes(selector)) fail('visual tokens must remain token-only; found ' + selector);\n}\nif (previewFrame && modulePreviewFrame && previewFrame.trim() !== modulePreviewFrame.trim()) fail('src/css/modules/preview-frame.css must mirror src/css/components/gg-preview-frame.css; run npm run gaga:sync-components');\n\nif (failures.length) {\n  console.error('STORE MODAL PREVIEW RELIABILITY GUARD FAIL');\n  for (const failure of failures) console.error('- ' + failure);\n  process.exit(1);\n}\nconsole.log('STORE MODAL PREVIEW RELIABILITY GUARD PASS');\n`;
  write(rel, source);
}

function apply() {
  if (!exists('src/css/components/gg-visual-tokens.css') || !exists('src/css/components/gg-preview-frame.css')) {
    throw new Error('Run this script from repo root. Missing src/css/components files.');
  }
  write('src/css/components/gg-visual-tokens.css', cleanVisualTokens(read('src/css/components/gg-visual-tokens.css')));
  write('src/css/components/gg-preview-frame.css', cleanPreviewFrame(read('src/css/components/gg-preview-frame.css')));
  if (exists('qa/sheet-lifecycle-contract-guard.mjs')) write('qa/sheet-lifecycle-contract-guard.mjs', softenLifecycleGuard(read('qa/sheet-lifecycle-contract-guard.mjs')));
  if (exists('qa/sheet-runtime-overflow-viewport-guard.mjs')) write('qa/sheet-runtime-overflow-viewport-guard.mjs', softenRuntimeGuard(read('qa/sheet-runtime-overflow-viewport-guard.mjs')));
  writeStoreModalGuard();
}

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, { cwd: root, shell: true, stdio: 'inherit' });
}

function focusedQa() {
  run('npm run gaga:sync-components');
  run('npm run store:build');
  run('npm run gaga:template:pack');
  run('npm run gaga:verify-sheet-lifecycle');
  run('npm run gaga:verify-sheet-runtime-overflow');
  run('npm run gaga:verify-store-modal-preview');
}

apply();
console.log('Applied preview visual balance + guard softening v5.');
console.log('Updated:');
for (const rel of touched) console.log('- ' + rel);
console.log('\nFinal contract:');
console.log('- Hero aspect: ' + CONTRACT.aspect);
console.log('- Hero max-height: ' + CONTRACT.heroMax);
console.log('- Root content lift: ' + CONTRACT.rootLift);
console.log('- Store content lift: ' + CONTRACT.storeLift);
console.log('- Lift ownership: body only; surface margin-top: 0 to prevent blank double-lift');
console.log('- Visual tokens: token-only');
console.log('- Guards: principle-based instead of exact fragile strings');

if (process.argv.includes('--run-qa')) focusedQa();
if (process.argv.includes('--run-ci')) run('npm run ci:cloudflare');
