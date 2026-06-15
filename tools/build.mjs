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
const CLASSIC_RUNTIME_HELPER_MODULES = new Set(['template-hydration', 'comments-bridge', 'saved-listing-bridge', 'popular-related-bridge', 'offline-fallback-bridge']);
async function concatModules(kind){
  const registry = await readJson(join(ROOT,'registry/modules.json'));
  let out = `/* GG generated ${kind} bundle. Do not edit. Source: src/modules/* */\n`;
  for(const id of registry.bundleOrder){
    const mod = registry.modules[id];
    if(!mod?.enabled) continue;
    const rel = kind === 'css' ? mod.css : mod.js;
    if(!rel || !existsSync(join(ROOT, rel))) continue;
    let source = await fs.readFile(join(ROOT, rel), 'utf8');
    if (kind === 'js' && (mod.type === 'runtime-helper' || CLASSIC_RUNTIME_HELPER_MODULES.has(id))) {
      source = source.replace(/^export\s+(function|const|let|var|class)\s+/gm, '$1 ');
    }
    out += `\n/* @gg-module ${id} */\n` + source + '\n';
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
// Copy deployed assets into public root so they are served under /assets/
await copyDir(join(ROOT,'dist/prod/assets'), join(ROOT,'.cloudflare-build/public/assets'));
// Copy store runtime assets (store.css, store-core.js, store-discovery.js) to public/assets/store/
if (existsSync(join(ROOT,'src/modules/store/store.css'))) {
  await fs.mkdir(join(ROOT,'.cloudflare-build/public/assets/store'), { recursive: true });
  await copyFile(join(ROOT,'src/modules/store/store.css'), join(ROOT,'.cloudflare-build/public/assets/store/store.css'));
}
if (existsSync(join(ROOT,'src/modules/store/store-core.js'))) {
  await copyFile(join(ROOT,'src/modules/store/store-core.js'), join(ROOT,'.cloudflare-build/public/assets/store/store-core.js'));
}
if (existsSync(join(ROOT,'src/modules/store/store-discovery.js'))) {
  await copyFile(join(ROOT,'src/modules/store/store-discovery.js'), join(ROOT,'.cloudflare-build/public/assets/store/store-discovery.js'));
}
// __gg prefix path for blog (Blogger XML uses /__gg/assets/...)
if (existsSync(join(ROOT,'dist/prod/assets/gg-app.min.css'))) {
  await fs.mkdir(join(ROOT,'.cloudflare-build/public/__gg/assets/css'), { recursive: true });
  await copyFile(join(ROOT,'dist/prod/assets/gg-app.min.css'), join(ROOT,'.cloudflare-build/public/__gg/assets/css/gg-app.min.css'));
}
if (existsSync(join(ROOT,'dist/prod/assets/gg-app.min.js'))) {
  await fs.mkdir(join(ROOT,'.cloudflare-build/public/__gg/assets/js'), { recursive: true });
  await copyFile(join(ROOT,'dist/prod/assets/gg-app.min.js'), join(ROOT,'.cloudflare-build/public/__gg/assets/js/gg-app.min.js'));
  // gg-app.dev.js alias for Blogger compatibility
  await copyFile(join(ROOT,'dist/prod/assets/gg-app.min.js'), join(ROOT,'.cloudflare-build/public/__gg/assets/js/gg-app.dev.js'));
}
// Also mirror assets into dist/prod/public/assets for consistency
await copyDir(join(ROOT,'dist/prod/assets'), join(ROOT,'dist/prod/public/assets'));
// Mirror store runtime assets into dist/prod/public/assets/store
if (existsSync(join(ROOT,'src/modules/store/store.css'))) {
  await fs.mkdir(join(ROOT,'dist/prod/public/assets/store'), { recursive: true });
  await copyFile(join(ROOT,'src/modules/store/store.css'), join(ROOT,'dist/prod/public/assets/store/store.css'));
}
if (existsSync(join(ROOT,'src/modules/store/store-core.js'))) {
  await copyFile(join(ROOT,'src/modules/store/store-core.js'), join(ROOT,'dist/prod/public/assets/store/store-core.js'));
}
if (existsSync(join(ROOT,'src/modules/store/store-discovery.js'))) {
  await copyFile(join(ROOT,'src/modules/store/store-discovery.js'), join(ROOT,'dist/prod/public/assets/store/store-discovery.js'));
}
// __gg alias in dist/prod/public
if (existsSync(join(ROOT,'dist/prod/assets/gg-app.min.css'))) {
  await fs.mkdir(join(ROOT,'dist/prod/public/__gg/assets/css'), { recursive: true });
  await copyFile(join(ROOT,'dist/prod/assets/gg-app.min.css'), join(ROOT,'dist/prod/public/__gg/assets/css/gg-app.min.css'));
}
if (existsSync(join(ROOT,'dist/prod/assets/gg-app.min.js'))) {
  await fs.mkdir(join(ROOT,'dist/prod/public/__gg/assets/js'), { recursive: true });
  await copyFile(join(ROOT,'dist/prod/assets/gg-app.min.js'), join(ROOT,'dist/prod/public/__gg/assets/js/gg-app.min.js'));
  await copyFile(join(ROOT,'dist/prod/assets/gg-app.min.js'), join(ROOT,'dist/prod/public/__gg/assets/js/gg-app.dev.js'));
}
// Mirror public/assets into dev too
if (existsSync(join(ROOT,'dist/dev/assets'))) {
  await copyDir(join(ROOT,'dist/dev/assets'), join(ROOT,'dist/dev/public/assets'));
}
if (existsSync(join(ROOT,'src/modules/store/store.css'))) {
  await fs.mkdir(join(ROOT,'dist/dev/public/assets/store'), { recursive: true });
  await copyFile(join(ROOT,'src/modules/store/store.css'), join(ROOT,'dist/dev/public/assets/store/store.css'));
}
if (existsSync(join(ROOT,'src/modules/store/store-core.js'))) {
  await copyFile(join(ROOT,'src/modules/store/store-core.js'), join(ROOT,'dist/dev/public/assets/store/store-core.js'));
}
if (existsSync(join(ROOT,'src/modules/store/store-discovery.js'))) {
  await copyFile(join(ROOT,'src/modules/store/store-discovery.js'), join(ROOT,'dist/dev/public/assets/store/store-discovery.js'));
}
// __gg alias in dist/dev/public
if (existsSync(join(ROOT,'dist/dev/assets/gg-app.bundle.css'))) {
  await fs.mkdir(join(ROOT,'dist/dev/public/__gg/assets/css'), { recursive: true });
  await copyFile(join(ROOT,'dist/dev/assets/gg-app.bundle.css'), join(ROOT,'dist/dev/public/__gg/assets/css/gg-app.bundle.css'));
}
if (existsSync(join(ROOT,'dist/dev/assets/gg-app.bundle.js'))) {
  await fs.mkdir(join(ROOT,'dist/dev/public/__gg/assets/js'), { recursive: true });
  await copyFile(join(ROOT,'dist/dev/assets/gg-app.bundle.js'), join(ROOT,'dist/dev/public/__gg/assets/js/gg-app.bundle.js'));
}
// Copy runtime public-config into dist/public for both modes
for (const mode of modes) {
  const srcRuntime = join(ROOT, 'dist', mode, 'runtime', 'public-config.json');
  const dstRuntimeDir = join(ROOT, 'dist', mode, 'public', 'runtime');
  if (existsSync(srcRuntime)) {
    await fs.mkdir(dstRuntimeDir, { recursive: true });
    await copyFile(srcRuntime, join(dstRuntimeDir, 'public-config.json'));
  }
}
if (existsSync(join(ROOT,'dist/prod/apps/landing/landing.html'))) await copyFile(join(ROOT,'dist/prod/apps/landing/landing.html'), join(ROOT,'.cloudflare-build/public/landing.html'));
if (existsSync(join(ROOT,'dist/prod/apps/store/store.html'))) await copyFile(join(ROOT,'dist/prod/apps/store/store.html'), join(ROOT,'.cloudflare-build/public/store.html'));
if (existsSync(join(ROOT,'dist/prod/apps/blog/offline.html'))) await copyFile(join(ROOT,'dist/prod/apps/blog/offline.html'), join(ROOT,'.cloudflare-build/public/offline.html'));
if (existsSync(join(ROOT,'src/worker/worker.js'))) await copyFile(join(ROOT,'src/worker/worker.js'), join(ROOT,'.cloudflare-build/worker.js'));
console.log(JSON.stringify({ ok:true, built:modes, output:['dist/dev','dist/prod','.cloudflare-build'] }, null, 2));
