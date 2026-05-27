#!/usr/bin/env node
/**
 * One-time guard reconciliation for GG preview hero reveal.
 *
 * Purpose:
 * - Keep the new visual contract where preview content is pushed down so the 4/5 hero thumbnail is dominant first.
 * - Reconcile qa/sheet-lifecycle-contract-guard.mjs so it no longer expects the old small negative/compact lift token.
 *
 * Run from repo root:
 *   node fix-sheet-lifecycle-reveal-token-guard.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const guardPath = resolve(root, 'qa/sheet-lifecycle-contract-guard.mjs');

if (!existsSync(guardPath)) {
  console.error('FAIL: qa/sheet-lifecycle-contract-guard.mjs not found. Run this script from the repo root.');
  process.exit(1);
}

let text = readFileSync(guardPath, 'utf8');
const before = text;

const replacements = [
  {
    name: 'root preview content reveal token',
    from: /--gg-preview-content-lift:\s*clamp\(56px,\s*10vw,\s*88px\)/g,
    to: '--gg-preview-content-lift: clamp(96px, 18dvh, 220px)',
  },
  {
    name: 'store preview content reveal token',
    from: /--gg-preview-store-content-lift:\s*clamp\(48px,\s*9vw,\s*76px\)/g,
    to: '--gg-preview-store-content-lift: clamp(88px, 16dvh, 196px)',
  },
  {
    name: 'legacy compact root token in string literals',
    from: /clamp\(56px,\s*10vw,\s*88px\)/g,
    to: 'clamp(96px, 18dvh, 220px)',
  },
  {
    name: 'legacy compact store token in string literals',
    from: /clamp\(48px,\s*9vw,\s*76px\)/g,
    to: 'clamp(88px, 16dvh, 196px)',
  },
];

const applied = [];
for (const item of replacements) {
  const next = text.replace(item.from, item.to);
  if (next !== text) applied.push(item.name);
  text = next;
}

if (text === before) {
  console.log('No legacy compact content-lift expectations found. Guard may already be reconciled.');
} else {
  writeFileSync(guardPath, text);
  console.log('Updated qa/sheet-lifecycle-contract-guard.mjs');
  for (const name of applied) console.log(`- ${name}`);
}

const mustContain = [
  '--gg-preview-content-lift: clamp(96px, 18dvh, 220px)',
  '--gg-preview-store-content-lift: clamp(88px, 16dvh, 196px)',
];
const updated = readFileSync(guardPath, 'utf8');
const missing = mustContain.filter((needle) => !updated.includes(needle));
if (missing.length) {
  console.warn('WARN: Guard does not contain the expected reveal-token literals. If QA still fails, open the guard and replace the remaining exact token checks manually:');
  for (const needle of missing) console.warn(`- ${needle}`);
} else {
  console.log('Guard reveal-token contract is now aligned.');
}
