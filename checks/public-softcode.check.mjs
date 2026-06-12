import { readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SECRET_KEYWORDS = [
  'secret', 'token', 'password', 'apikey', 'api_key',
  'clientsecret', 'client_secret', 'accesstoken', 'access_token',
  'refreshtoken', 'refresh_token', 'sessionsecret', 'session_secret',
  'cloudflaretoken',
];

// Well-known safe top-level keys that contain keyword substrings but are not secrets
const SAFE_TOP_LEVEL_KEYS = ['themeTokens', 'secretsSchema', 'softcodeInventory'];

let errors = [];

function fail(msg) {
  errors.push(msg);
  console.error('FAIL:', msg);
}

async function exists(relPath) {
  try { await access(join(ROOT, relPath)); return true; } catch { return false; }
}

async function readText(relPath) {
  return readFile(join(ROOT, relPath), 'utf8');
}

async function readJson(relPath) {
  return JSON.parse(await readText(relPath));
}

function deepCheckSecrets(obj, path) {
  if (obj === null || obj === undefined) return;
  if (typeof obj === 'string') {
    // Skip file path references like "config/secrets.schema.json"
    if (path.includes('configRefs') && (obj.startsWith('config/') || obj.startsWith('registry/'))) return;
    const lower = obj.toLowerCase().replace(/[_\-\s]/g, '');
    for (const kw of SECRET_KEYWORDS) {
      if (lower.includes(kw)) {
        if (!path.includes('microcopy') && !path.includes('.label') &&
            !path.includes('.title') && !path.includes('.copy')) {
          fail(`public-config.json suspicious value at ${path}: contains "${kw}"`);
        }
      }
    }
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => deepCheckSecrets(item, `${path}[${i}]`));
    return;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      deepCheckSecrets(v, path ? `${path}.${k}` : k);
    }
  }
}

// --- main ---
console.log('=== public-softcode check ===\n');

// (a) module exists
if (!(await exists('src/modules/public-softcode/public-softcode.js'))) {
  fail('Missing src/modules/public-softcode/public-softcode.js');
} else {
  console.log('ok: public-softcode module exists');
}

// (b) public-config.json emitted by build (both dev and prod)
for (let mode of ['dev', 'prod']) {
  const runtimePath = `dist/${mode}/runtime/public-config.json`;
  if (!(await exists(runtimePath))) {
    fail(`Missing ${runtimePath} — run npm run build first`);
  } else {
    console.log(`ok: dist/${mode}/runtime/public-config.json exists`);
    // Verify content is valid JSON
    const config = await readJson(runtimePath);
    const topKeys = Object.keys(config);
    for (const k of topKeys) {
      if (SAFE_TOP_LEVEL_KEYS.includes(k)) continue;
      const clean = k.toLowerCase().replace(/[_\-\s]/g, '');
      for (const kw of SECRET_KEYWORDS) {
        if (clean.includes(kw)) {
          fail(`public-config.json (${mode}) top-level key "${k}" looks secret-like`);
        }
      }
    }
    deepCheckSecrets(config, `dist/${mode}`);
    const expectedKeys = ['version', 'surfaces', 'navigation', 'seo', 'themeTokens', 'microcopy'];
    for (const k of expectedKeys) {
      if (!(k in config)) {
        fail(`public-config.json (${mode}) missing expected key: ${k}`);
      }
    }
    if (expectedKeys.every(k => k in config)) {
      console.log(`ok: public-config.json (${mode}) has all expected top-level keys`);
    }
  }
}
if (!errors.some(e => e.includes('secret') || e.includes('suspicious'))) {
  console.log('ok: public-config.json has no secret-like values');
}

// (d) entries wire public-softcode
for (const [surface, file] of [
  ['blog', 'src/entries/blog.entry.js'],
  ['store', 'src/entries/store.entry.js'],
  ['landing', 'src/entries/landing.entry.js'],
]) {
  const content = await readText(file);
  if (!content.includes('publicSoftcodeInit')) {
    fail(`${file} does not wire publicSoftcodeInit`);
  } else if (!content.includes(surface)) {
    fail(`${file} does not pass surface "${surface}"`);
  } else {
    console.log(`ok: ${file} wires public-softcode for ${surface}`);
  }
}

// (e) Blog supports data-gg-copy or data-copy
const blogXml = await readText('apps/blog/index.xml');
const hasGgCopy = blogXml.includes('data-gg-copy=');
const hasCopy = blogXml.includes('data-copy=');
if (hasGgCopy || hasCopy) {
  console.log(`ok: Blog supports ${hasGgCopy ? 'data-gg-copy' : ''}${hasGgCopy && hasCopy ? ' and ' : ''}${hasCopy ? 'data-copy' : ''}`);
} else {
  fail('Blog index.xml has no data-copy or data-gg-copy markers');
}

// (f) Store/Landing support data-copy
const storeHtml = await readText('apps/store/store.html');
if (!storeHtml.includes('data-copy=')) {
  fail('Store store.html has no data-copy markers');
} else {
  console.log('ok: Store store.html supports data-copy');
}

let landingOk = false;
try {
  const landingHtml = await readText('apps/landing/landing.html');
  if (landingHtml.includes('data-copy=')) {
    landingOk = true;
    console.log('ok: Landing landing.html supports data-copy');
  } else {
    fail('Landing landing.html has no data-copy markers');
  }
} catch {
  fail('Missing apps/landing/landing.html');
}

// (g) .cloudflare-build/runtime/public-config.json if deploy output expected
// deploy output goes to .cloudflare-build/public/, so runtime config would be there
const CF_RUNTIME = '.cloudflare-build/public/runtime/public-config.json';
if (await exists('.cloudflare-build/public')) {
  if (!(await exists(CF_RUNTIME))) {
    fail(`Missing ${CF_RUNTIME} — deploy output expected`);
  } else {
    console.log(`ok: ${CF_RUNTIME} exists`);
  }
} else {
  console.log('skip: .cloudflare-build/public not found (build may not have run)');
}

// --- final ---
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach(e => console.error('  -', e));
  process.exit(1);
}

console.log('\npublic-softcode check passed');