import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Config key whitelist — maps API keys to file paths.
 * Only these keys are allowed via /api/config/:key.
 */
export const CONFIG_REGISTRY = Object.freeze({
  'blogger-targets':     'config/blogger.targets.json',
  'cache-policy':        'config/cache-policy.json',
  'softcode-inventory':  'config/softcode.inventory.json',
  'surfaces':            'registry/surfaces.json',
  'theme-tokens':        'registry/theme-tokens.json',
  'navigation':          'registry/navigation.json',
  'seo':                 'registry/seo.json',
});

/** @returns {string[]} */
export function listConfigKeys() {
  return Object.keys(CONFIG_REGISTRY);
}

/**
 * @param {string} key
 * @returns {{ key: string, path: string } | null}
 */
export function getConfigEntry(key) {
  const p = CONFIG_REGISTRY[key];
  if (!p) return null;
  return { key, path: p };
}

/**
 * Simple contract validation for known softcode files.
 * Returns { ok: boolean, errors?: string[] }
 */
export function validateConfigByKey(key, json, root) {
  const errors = [];

  if (key === 'blogger-targets') {
    if (!json || typeof json !== 'object') errors.push('blogger-targets must be an object');
    if (!json.targets || typeof json.targets !== 'object') errors.push('blogger-targets must have "targets" object');
    if (json.targets) {
      const requiredTargets = ['mainBlog', 'storeBlog'];
      for (const t of requiredTargets) {
        if (!json.targets[t]) errors.push(`blogger-targets missing "${t}"`);
      }
    }
    return { ok: errors.length === 0, errors: errors.length ? errors : undefined };
  }

  if (key === 'softcode-inventory') {
    if (!json || typeof json !== 'object') errors.push('softcode-inventory must be an object');
    if (!json.categories || typeof json.categories !== 'object') errors.push('softcode-inventory must have "categories" object');
    if (!json.version) errors.push('softcode-inventory missing "version"');
    return { ok: errors.length === 0, errors: errors.length ? errors : undefined };
  }

  if (key === 'surfaces') {
    if (!json || typeof json !== 'object') errors.push('surfaces must be an object');
    if (!Array.isArray(json.surfaces)) errors.push('surfaces must have "surfaces" array');
    if (json.surfaces) {
      const ids = new Set(json.surfaces.map(s => s.id));
      ['blog','landing','store','console','studio'].forEach(id => {
        if (!ids.has(id)) errors.push(`surfaces missing id: ${id}`);
      });
    }
    return { ok: errors.length === 0, errors: errors.length ? errors : undefined };
  }

  if (key === 'theme-tokens') {
    if (!json || typeof json !== 'object') errors.push('theme-tokens must be an object');
    if (!json.tokens || typeof json.tokens !== 'object') errors.push('theme-tokens must have "tokens" object');
    if (json.tokens) {
      ['color','radius','spacing','typography','motion','shadow'].forEach(k => {
        if (!json.tokens[k]) errors.push(`theme-tokens missing tokens.${k}`);
      });
    }
    return { ok: errors.length === 0, errors: errors.length ? errors : undefined };
  }

  if (key === 'navigation') {
    if (!json || typeof json !== 'object') errors.push('navigation must be an object');
    if (!json.nav || typeof json.nav !== 'object') errors.push('navigation must have "nav" object');
    if (json.nav) {
      ['publicPrimary','storePrimary','adminPrimary'].forEach(k => {
        if (!Array.isArray(json.nav[k])) errors.push(`navigation missing nav.${k}`);
      });
    }
    return { ok: errors.length === 0, errors: errors.length ? errors : undefined };
  }

  if (key === 'seo') {
    if (!json || typeof json !== 'object') errors.push('seo must be an object');
    if (!json.seo || typeof json.seo !== 'object') errors.push('seo must have "seo" object');
    if (json.seo) {
      ['blog','landing','store'].forEach(k => {
        if (!json.seo[k]) errors.push(`seo missing seo.${k}`);
      });
    }
    return { ok: errors.length === 0, errors: errors.length ? errors : undefined };
  }

  if (key === 'cache-policy') {
    if (!json || typeof json !== 'object') errors.push('cache-policy must be an object');
    return { ok: errors.length === 0, errors: errors.length ? errors : undefined };
  }

  return { ok: true };
}

/**
 * Read config by key.
 * @param {string} key
 * @param {string} root - repo root path
 * @param {object} localFile - local-file adapter module
 * @returns {Promise<object>}
 */
export async function readConfigByKey(key, root, localFile) {
  const entry = getConfigEntry(key);
  if (!entry) throw Object.assign(new Error(`Unknown config key: ${key}`), { statusCode: 404 });

  const fullPath = join(root, entry.path);
  if (!existsSync(fullPath)) throw Object.assign(new Error(`Config file not found: ${entry.path}`), { statusCode: 404 });

  return localFile.readJson(entry.path);
}

/**
 * Write config by key (local mode only, validation included).
 * @param {string} key
 * @param {object} json
 * @param {{ root: string, mode: string, localFile: object }} ctx
 * @returns {Promise<{ ok: boolean, errors?: string[] }>}
 */
export async function writeConfigByKey(key, json, ctx) {
  const entry = getConfigEntry(key);
  if (!entry) throw Object.assign(new Error(`Unknown config key: ${key}`), { statusCode: 404 });

  if (ctx.mode !== 'local') {
    throw Object.assign(new Error('Hosted write adapter is not enabled yet. Use GitHub/Cloudflare adapter.'), { statusCode: 403 });
  }

  // For blogger-targets, use dedicated validator
  if (key === 'blogger-targets') {
    const { validateBloggerTargetsConfig } = await import('./blogger-targets.mjs');
    const v = validateBloggerTargetsConfig(json);
    if (!v.ok) throw Object.assign(new Error(JSON.stringify(v.errors)), { statusCode: 422, validationErrors: v.errors });
  } else {
    const v = validateConfigByKey(key, json, ctx.root);
    if (!v.ok) throw Object.assign(new Error(JSON.stringify(v.errors)), { statusCode: 422, validationErrors: v.errors });
  }

  return ctx.localFile.writeJson(entry.path, json);
}