import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED_FILES = [
  'config/softcode.inventory.json',
  'registry/surfaces.json',
  'registry/theme-tokens.json',
  'registry/navigation.json',
  'registry/seo.json',
];

const REQUIRED_SURFACE_IDS = ['blog', 'landing', 'store', 'console', 'studio'];
const REQUIRED_CATEGORIES = [
  'microcopy', 'routesDomains', 'themeTokens', 'navigation', 'seo',
  'storeCategories', 'featureFlags', 'icons', 'bloggerTargets', 'cachePolicy',
];

async function readJson(relPath) {
  const raw = await readFile(join(ROOT, relPath), 'utf8');
  return JSON.parse(raw);
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

// --- main ---
let errors = [];

// 1. Required files exist and are valid JSON
for (const f of REQUIRED_FILES) {
  try {
    await readJson(f);
  } catch (e) {
    errors.push(`Missing or invalid ${f}: ${e.message}`);
  }
}

if (errors.length) {
  errors.forEach(e => console.error(e));
  process.exit(1);
}

// 2. Validate surfaces
const surfaces = await readJson('registry/surfaces.json');
if (!Array.isArray(surfaces.surfaces)) fail('surfaces.json must have "surfaces" array');
const surfaceById = {};
for (const s of surfaces.surfaces) {
  surfaceById[s.id] = s;
}
for (const id of REQUIRED_SURFACE_IDS) {
  if (!surfaceById[id]) errors.push(`Missing surface: ${id}`);
}
for (const s of Object.values(surfaceById)) {
  if (s.kind === 'private') {
    if (!s.cacheProfile || !(s.cacheProfile === 'no-store' || s.cacheProfile.includes('no-store'))) {
      errors.push(`Private surface ${s.id} must have no-store cacheProfile, got: ${s.cacheProfile}`);
    }
  }
  if (s.kind === 'public') {
    if (!Array.isArray(s.hosts) || s.hosts.length === 0) errors.push(`Public surface ${s.id} must have hosts`);
    if (!Array.isArray(s.routes) || s.routes.length === 0) errors.push(`Public surface ${s.id} must have routes`);
  }
}

// 3. Validate softcode inventory
const inventory = await readJson('config/softcode.inventory.json');
if (!inventory.categories || typeof inventory.categories !== 'object') fail('softcode.inventory.json must have "categories" object');
for (const cat of REQUIRED_CATEGORIES) {
  if (!inventory.categories[cat]) errors.push(`Missing softcode category: ${cat}`);
}

// 4. Validate theme-tokens
const tokens = await readJson('registry/theme-tokens.json');
if (!tokens.tokens || typeof tokens.tokens !== 'object') fail('theme-tokens.json must have "tokens" object');
['color', 'radius', 'spacing', 'typography', 'motion', 'shadow'].forEach(k => {
  if (!tokens.tokens[k]) errors.push(`theme-tokens.json missing tokens.${k}`);
});

// 5. Validate navigation
const nav = await readJson('registry/navigation.json');
if (!nav.nav || typeof nav.nav !== 'object') fail('navigation.json must have "nav" object');
['publicPrimary', 'storePrimary', 'adminPrimary'].forEach(k => {
  if (!Array.isArray(nav.nav[k])) errors.push(`navigation.json missing nav.${k} array`);
});

// 6. Validate seo
const seo = await readJson('registry/seo.json');
if (!seo.seo || typeof seo.seo !== 'object') fail('seo.json must have "seo" object');
['blog', 'landing', 'store'].forEach(k => {
  if (!seo.seo[k]) errors.push(`seo.json missing seo.${k}`);
});

if (errors.length) {
  errors.forEach(e => console.error(e));
  process.exit(1);
}

const categoryCount = Object.keys(inventory.categories).length;
const surfaceCount = surfaces.surfaces.length;
console.log(`softcode ok: surfaces=${surfaceCount} categories=${categoryCount}`);