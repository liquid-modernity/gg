#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as localFile from './adapters/local-file.adapter.mjs';
import { readBloggerTargetsConfig, validateBloggerTargetsConfig, bloggerTargetsReport } from '../_shared/blogger-targets.mjs';
import { listConfigKeys, getConfigEntry, readConfigByKey, writeConfigByKey, validateConfigByKey } from '../_shared/config-registry.mjs';

const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), '../..'));
const APP_DIR = join(ROOT, 'apps/console');
const PORT = Number(process.env.CONSOLE_PORT || 8789);
const HOST = process.env.CONSOLE_HOST || '127.0.0.1';
const MODE = process.env.CONSOLE_MODE || 'local';
const args = new Set(process.argv.slice(2));

function send(res, status, body, type='application/json'){
  res.writeHead(status, { 'content-type': type + '; charset=utf-8', 'cache-control':'no-store' });
  res.end(type === 'application/json' ? JSON.stringify(body, null, 2) : body);
}
async function readBody(req){
  const chunks=[]; for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}
function secretStatus(name){ return { name, available: !!process.env[name], valueVisible: false }; }
async function health(){
  const required = ['registry/modules.json','registry/microcopy.id.json','registry/microcopy.en.json','config/blogger.targets.json','config/domains.config.json'];
  return { mode: MODE, root: ROOT, writable: MODE === 'local', required: required.map((p)=>({ path:p, exists: existsSync(join(ROOT,p)) })) };
}
async function route(req, res){
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/api/health') return send(res, 200, await health());
    if (url.pathname === '/api/secrets') return send(res, 200, [
      'SESSION_SECRET','ADMIN_EMAIL','GOOGLE_BLOGGER_CLIENT_ID','GOOGLE_BLOGGER_CLIENT_SECRET','GOOGLE_BLOGGER_REFRESH_TOKEN','CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN'
    ].map(secretStatus));
    if (url.pathname === '/api/blogger-targets') {
      const bt = await readBloggerTargetsConfig(ROOT);
      if (req.method === 'GET') {
        const v = validateBloggerTargetsConfig(bt);
        return send(res, v.ok ? 200 : 422, { ok: v.ok, config: bt, ...(v.ok ? {} : { error: v.errors }) });
      }
      if (req.method === 'PUT') {
        if (MODE !== 'local') return send(res, 403, { ok: false, error: 'Hosted write adapter is not enabled yet. Use GitHub/Cloudflare adapter.' });
        const value = JSON.parse(await readBody(req));
        const v = validateBloggerTargetsConfig(value);
        if (!v.ok) return send(res, 422, { ok: false, error: v.errors });
        const result = await localFile.writeJson('config/blogger.targets.json', value);
        return send(res, 200, { ok: true, ...result });
      }
      return send(res, 405, { ok: false, error: 'Method not allowed' });
    }

    // ---- Config API (TASK-002D) ----
    if (url.pathname === '/api/config-list') {
      if (req.method !== 'GET') return send(res, 405, { ok: false, error: 'Method not allowed' });
      const keys = listConfigKeys();
      const result = [];
      for (const k of keys) {
        const entry = getConfigEntry(k);
        result.push({ key: k, path: entry.path });
      }
      return send(res, 200, { ok: true, keys: result });
    }

    if (url.pathname.startsWith('/api/config/') && url.pathname.length > '/api/config/'.length) {
      const key = url.pathname.slice('/api/config/'.length);
      // Reject path traversal in key
      if (!/^[a-z0-9._-]+$/.test(key) || key.includes('..')) {
        return send(res, 400, { ok: false, error: 'Invalid config key. Use whitelisted keys only.' });
      }
      const entry = getConfigEntry(key);
      if (!entry) return send(res, 404, { ok: false, error: `Unknown config key: ${key}` });

      if (req.method === 'GET') {
        try {
          const data = await readConfigByKey(key, ROOT, localFile);
          return send(res, 200, { ok: true, key, data });
        } catch (e) {
          return send(res, e.statusCode || 500, { ok: false, error: e.message });
        }
      }

      if (req.method === 'PUT') {
        try {
          const raw = await readBody(req);
          let value;
          try { value = JSON.parse(raw); } catch (_) {
            return send(res, 400, { ok: false, error: 'Malformed JSON body' });
          }
          const result = await writeConfigByKey(key, value, { root: ROOT, mode: MODE, localFile });
          return send(res, 200, { ok: true, key, ...result });
        } catch (e) {
          if (e.validationErrors) return send(res, e.statusCode || 422, { ok: false, error: e.validationErrors });
          return send(res, e.statusCode || 500, { ok: false, error: e.message });
        }
      }

      return send(res, 405, { ok: false, error: 'Method not allowed' });
    }
    if (url.pathname === '/api/json') {
      const relPath = url.searchParams.get('path');
      if (req.method === 'GET') return send(res, 200, await localFile.readJson(relPath));
      if (req.method === 'PUT') {
        if (MODE !== 'local') return send(res, 403, { ok:false, error:'Hosted write adapter is not enabled yet. Use GitHub/Cloudflare adapter.' });
        const value = JSON.parse(await readBody(req));
        return send(res, 200, await localFile.writeJson(relPath, value));
      }
    }
    let file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const full = normalize(join(APP_DIR, file));
    if (!full.startsWith(APP_DIR)) return send(res, 403, 'Forbidden', 'text/plain');
    const buf = await readFile(full);
    const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css'};
    return send(res, 200, buf, types[extname(full)] || 'application/octet-stream');
  } catch (error) {
    return send(res, 500, { ok:false, error:String(error.message || error) });
  }
}

if (args.has('--check')) {
  const h = await health();
  const missing = h.required.filter((x)=>!x.exists);
  if (missing.length) { console.error(JSON.stringify({ ok:false, missing }, null, 2)); process.exit(1); }
  const bt = await readBloggerTargetsConfig(ROOT);
  const v = validateBloggerTargetsConfig(bt);
  if (!v.ok) { console.error(JSON.stringify({ ok:false, bloggerTargetsError: v.errors }, null, 2)); process.exit(1); }
  const report = bloggerTargetsReport(bt);
  console.log(JSON.stringify({ ok:true, app:'console', mode:MODE, bloggerTargets: report }, null, 2));
} else {
  createServer(route).listen(PORT, HOST, () => console.log(`GG Console listening on http://${HOST}:${PORT} (${MODE})`));
}
