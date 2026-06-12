#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { copyDir, copyFile, minifyCss, minifyJs, readJson, writeFile } from './lib.mjs';
const ROOT = process.cwd();
async function safeReadJson(path) { try { return await readJson(path); } catch { return null; } }
const SECRET_PATTERNS = ['secret','token','key','password','client_id','client_secret','refresh_token','session','api_key','apikey','private'];
function scrubSecrets(obj) { if (!obj || typeof obj !== 'object') return obj; if (Array.isArray(obj)) return obj.map(scrubSecrets); const out = {}; for (const [k,v] of Object.entries(obj)) { const kl = k.toLowerCase(); const isSecret = SECRET_PATTERNS.some(p => kl.includes(p)); if (isSecret && typeof v === 'string') { out[k] = '[redacted]'; } else if (v && typeof v === 'object') { out[k] = scrubSecrets(v); } else { out[k] = v; } } return out; }
async function emitPublicConfig(outDir) { const surfaces = await safeReadJson(join(ROOT,'registry/surfaces.json')); const navigation = await safeReadJson(join(ROOT,'registry/navigation.json')); const seo = await safeReadJson(join(ROOT,'registry/seo.json')); const themeTokens = await safeReadJson(join(ROOT,'registry/theme-tokens.json')); const microcopyId = await safeReadJson(join(ROOT,'registry/microcopy.id.json')); const microcopyEn = await safeReadJson(join(ROOT,'registry/microcopy.en.json')); const icons = await safeReadJson(join(ROOT,'registry/icons.json')); const publicConfig = { version: '0.1.0', generatedAt: new Date().toISOString(), surfaces: surfaces ? scrubSecrets(surfaces) : null, navigation: navigation ? scrubSecrets(navigation) : null, seo: seo ? scrubSecrets(seo) : null, themeTokens: themeTokens ? scrubSecrets(themeTokens) : null, microcopy: microcopyId || microcopyEn ? { id: microcopyId, en: microcopyEn } : null, icons: icons ? scrubSecrets(icons) : null }; const runtimeDir = join(outDir,'runtime'); await fs.mkdir(runtimeDir, { recursive: true }); await writeFile(join(runtimeDir,'public-config.json'), JSON.stringify(publicConfig, null, 2) + '\n'); }
const args = new Set(process.argv.slice(2));
const modeArg = process.argv[process.argv.indexOf('--mode') + 1] || 'all';
const modes = modeArg === 'all' ? ['dev','prod'] : [modeArg];
async function concatModules(kind){
  const registry = await readJson(join(ROOT,'registry/modules.json'));
  let out = `/* GG generated ${kind} bundle. Do not edit. Source: src/modules/* */\n`;
  for(const id of registry.bundleOrder){
    const mod = registry.modules[id];
    if(!mod?.enabled) continue;
    const rel = kind === 'css' ? mod.css : mod.js;
    if(!rel || !existsSync(join(ROOT, rel))) continue;
    out += `\n/* @gg-module ${id} */\n` + await fs.readFile(join(ROOT, rel), 'utf8') + '\n';
  }
  return out;
}
async function buildMode(mode){
  const outDir = join(ROOT, 'dist', mode);
  await fs.rm(outDir, { recursive:true, force:true });
  await fs.mkdir(outDir, { recursive:true });
  const css = await concatModules('css');
  const js = await concatModules('js');
  const cssOut = mode === 'prod' ? minifyCss(css) : css;
  const jsOut = mode === 'prod' ? minifyJs(js) : js;
  await writeFile(join(outDir,'assets', mode === 'prod' ? 'gg-app.min.css' : 'gg-app.bundle.css'), cssOut + '\n');
  await writeFile(join(outDir,'assets', mode === 'prod' ? 'gg-app.min.js' : 'gg-app.bundle.js'), jsOut + '\n');
  await copyDir(join(ROOT,'public'), join(outDir,'public'));
  await copyDir(join(ROOT,'registry'), join(outDir,'registry'));
  await copyDir(join(ROOT,'config'), join(outDir,'config'));
  await copyDir(join(ROOT,'apps'), join(outDir,'apps'));
  await writeFile(join(outDir,'runtime.json'), JSON.stringify({ mode, builtAt:new Date().toISOString(), source:'src/modules' }, null, 2) + '\n');
  await emitPublicConfig(outDir);
}
for (const mode of modes) await buildMode(mode);
await fs.rm(join(ROOT,'.cloudflare-build'), { recursive:true, force:true });
await copyDir(join(ROOT,'dist/prod/public'), join(ROOT,'.cloudflare-build/public'));
await copyDir(join(ROOT,'dist/prod/runtime'), join(ROOT,'.cloudflare-build/public/runtime'));
if (existsSync(join(ROOT,'dist/prod/apps/landing/landing.html'))) await copyFile(join(ROOT,'dist/prod/apps/landing/landing.html'), join(ROOT,'.cloudflare-build/public/landing.html'));
if (existsSync(join(ROOT,'dist/prod/apps/store/store.html'))) await copyFile(join(ROOT,'dist/prod/apps/store/store.html'), join(ROOT,'.cloudflare-build/public/store.html'));
if (existsSync(join(ROOT,'dist/prod/apps/blog/offline.html'))) await copyFile(join(ROOT,'dist/prod/apps/blog/offline.html'), join(ROOT,'.cloudflare-build/public/offline.html'));
if (existsSync(join(ROOT,'src/worker/worker.js'))) await copyFile(join(ROOT,'src/worker/worker.js'), join(ROOT,'.cloudflare-build/worker.js'));
console.log(JSON.stringify({ ok:true, built:modes, output:['dist/dev','dist/prod','.cloudflare-build'] }, null, 2));
