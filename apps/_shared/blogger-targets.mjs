import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function readBloggerTargetsConfig(rootDir) {
  const raw = await readFile(join(rootDir, 'config/blogger.targets.json'), 'utf8');
  const config = JSON.parse(raw);
  return config;
}

export function validateBloggerTargetsConfig(config) {
  const errors = [];
  if (!config || typeof config !== 'object') { return { ok: false, errors: ['config must be a JSON object'] }; }
  if (!config.targets || typeof config.targets !== 'object') { return { ok: false, errors: ['config.targets must be an object'] }; }

  const requiredTargets = ['mainBlog', 'storeBlog'];
  const requiredFields = ['label','kind','enabled','blogId','sourceUrl','canonicalUrl','contentType','defaultStatus'];

  for (const key of requiredTargets) {
    const t = config.targets[key];
    if (!t) { errors.push(`Missing target: ${key}`); continue; }
    for (const field of requiredFields) {
      if (t[field] === undefined) { errors.push(`${key}.${field} is required`); }
    }
    if (t.sourceUrl && !t.sourceUrl.startsWith('https://')) errors.push(`${key}.sourceUrl must start with https://`);
    if (t.canonicalUrl && !t.canonicalUrl.startsWith('https://')) errors.push(`${key}.canonicalUrl must start with https://`);
    if (t.aliasUrl != null && typeof t.aliasUrl === 'string' && t.aliasUrl !== '' && !t.aliasUrl.startsWith('https://')) errors.push(`${key}.aliasUrl must start with https://`);
    if (t.contentType && key === 'mainBlog' && t.contentType !== 'article') errors.push(`mainBlog.contentType should be article`);
    if (t.contentType && key === 'storeBlog' && t.contentType !== 'product') errors.push(`storeBlog.contentType should be product`);
    if (t.defaultStatus && !['draft','publish'].includes(t.defaultStatus)) errors.push(`${key}.defaultStatus must be draft or publish`);

    const secretFields = ['clientSecretValue','refreshTokenValue','apiTokenValue','clientSecret','refreshToken','apiToken'];
    for (const sf of secretFields) {
      if (t[sf] !== undefined) errors.push(`${key}.${sf} must not store raw secret value`);
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function getEnabledBloggerTargets(config) {
  const targets = config?.targets;
  if (!targets) return [];
  return Object.entries(targets).filter(([,v]) => v.enabled).map(([k,v]) => ({ key: k, ...v }));
}

export function getBloggerTarget(config, key) {
  return config?.targets?.[key] || null;
}

export function bloggerTargetsReport(config) {
  const targets = config?.targets;
  if (!targets) return 'none';
  return Object.keys(targets).filter(k => targets[k].enabled).join(',');
}