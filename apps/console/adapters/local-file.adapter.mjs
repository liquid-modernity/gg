import { promises as fs } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), '../../..'));
const ALLOWED_PREFIXES = ['registry/', 'config/', 'public/icons/'];

function resolveSafe(relPath) {
  if (!relPath || typeof relPath !== 'string' || relPath.trim() === '') throw new Error('Path is empty');
  // Normalize backslash to slash
  let clean = relPath.replace(/\\/g, '/');
  // Reject absolute paths
  if (clean.startsWith('/') || /^[A-Za-z]:/.test(clean)) throw new Error(`Absolute path rejected: ${clean}`);
  // Strip leading slashes
  clean = clean.replace(/^\/+/, '');
  // Reject traversal
  if (clean.includes('..')) throw new Error(`Traversal rejected: ${relPath}`);
  // Reject non-.json for this adapter
  if (!clean.endsWith('.json')) throw new Error(`Only .json files allowed: ${clean}`);
  // Allowlist prefix check
  if (!ALLOWED_PREFIXES.some((p) => clean.startsWith(p))) throw new Error(`Path is not console-writable: ${clean}`);
  const full = normalize(join(ROOT, clean));
  if (relative(ROOT, full).startsWith('..')) throw new Error(`Path escapes root: ${clean}`);
  return full;
}

export async function readJson(relPath) {
  const text = await fs.readFile(resolveSafe(relPath), 'utf8');
  return JSON.parse(text);
}

export async function writeJson(relPath, value) {
  const full = resolveSafe(relPath);
  await fs.mkdir(dirname(full), { recursive: true });
  await fs.writeFile(full, JSON.stringify(value, null, 2) + '\n');
  return { ok: true, relPath };
}
