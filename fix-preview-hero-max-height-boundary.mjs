#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const files = [
  'src/css/components/gg-preview-frame.css'
];

const HERO_MAX_HEIGHT = 'max-height: min(var(--gg-preview-hero-max-height), 72dvh);';
const HERO_MIN_HEIGHT = 'min-height: 0;';
const HERO_OVERFLOW = 'overflow: hidden;';

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing file: ${file}`);
  }
  return fs.readFileSync(file, 'utf8');
}

function write(file, text) {
  fs.writeFileSync(file, text);
}

function normalizeHeroBlock(css, file) {
  const selectorRegex = /(\.gg-preview__hero\s*,\s*\n\s*\.store-preview__hero\s*\{)([\s\S]*?)(\n\})/;
  const match = css.match(selectorRegex);
  if (!match) {
    throw new Error(`${file}: cannot find shared .gg-preview__hero, .store-preview__hero block`);
  }

  let body = match[2];

  // Remove stale/duplicate max-height/min-height/overflow lines inside the shared hero block only.
  body = body
    .replace(/\n\s*max-height\s*:[^;]+;/g, '')
    .replace(/\n\s*min-height\s*:[^;]+;/g, '')
    .replace(/\n\s*overflow\s*:[^;]+;/g, '');

  // Keep aspect-ratio 4/5 contract if present; do not force aspect-ratio:auto.
  if (!/aspect-ratio\s*:\s*var\(--gg-preview-hero-aspect\)\s*;/.test(body)) {
    if (/aspect-ratio\s*:[^;]+;/.test(body)) {
      body = body.replace(/aspect-ratio\s*:[^;]+;/, 'aspect-ratio: var(--gg-preview-hero-aspect);');
    } else {
      body += '\n  aspect-ratio: var(--gg-preview-hero-aspect);';
    }
  }

  // Add viewport-safe boundary after height/aspect lines so guard and runtime agree.
  const lines = body.split('\n');
  let insertAt = lines.length;
  const heightIdx = lines.findIndex((line) => /\bheight\s*:/.test(line));
  const aspectIdx = lines.findIndex((line) => /aspect-ratio\s*:/.test(line));
  insertAt = Math.max(heightIdx, aspectIdx) + 1 || lines.length;
  lines.splice(insertAt, 0, `  ${HERO_MIN_HEIGHT}`, `  ${HERO_MAX_HEIGHT}`, `  ${HERO_OVERFLOW}`);
  body = lines.join('\n').replace(/\n{3,}/g, '\n\n');

  return css.replace(selectorRegex, `$1${body}$3`);
}

let changed = false;
for (const file of files) {
  const before = read(file);
  const after = normalizeHeroBlock(before, file);
  if (after !== before) {
    write(file, after);
    changed = true;
    console.log(`Updated ${file}`);
  } else {
    console.log(`No change needed ${file}`);
  }
}

// Regenerate mirrored module/app/store CSS if repo scripts are available.
try {
  execSync('npm run gaga:sync-components', { stdio: 'inherit' });
} catch (error) {
  console.warn('WARN: npm run gaga:sync-components failed or is unavailable. Run it manually.');
}

try {
  execSync('npm run store:build', { stdio: 'inherit' });
} catch (error) {
  console.warn('WARN: npm run store:build failed or is unavailable. Run it manually.');
}

console.log(changed ? 'Preview hero max-height boundary normalized.' : 'Preview hero max-height boundary already normalized.');
