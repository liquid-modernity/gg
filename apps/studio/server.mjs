#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readBloggerTargetsConfig, validateBloggerTargetsConfig, bloggerTargetsReport } from '../_shared/blogger-targets.mjs';

const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), '../..'));
const APP_DIR = join(ROOT, 'apps/studio');
const PORT = Number(process.env.STUDIO_PORT || 8790);
const HOST = process.env.STUDIO_HOST || '127.0.0.1';
const MODE = process.env.STUDIO_MODE || 'local';
const args = new Set(process.argv.slice(2));

function send(res, status, body, type='application/json'){
  res.writeHead(status, {'content-type': type + '; charset=utf-8','cache-control':'no-store'});
  res.end(type === 'application/json' ? JSON.stringify(body,null,2) : body);
}

async function targets(){ return await readBloggerTargetsConfig(ROOT); }

async function route(req,res){
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try{
    if(url.pathname === '/api/blogger-targets') return send(res,200,await targets());
    if(url.pathname === '/api/health') return send(res,200,{mode:MODE, hasBloggerTargets:existsSync(join(ROOT,'config/blogger.targets.json'))});
    let file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const full = normalize(join(APP_DIR,file));
    if(!full.startsWith(APP_DIR)) return send(res,403,'Forbidden','text/plain');
    const buf = await readFile(full);
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
    return send(res,200,buf,types[extname(full)] || 'application/octet-stream');
  }catch(error){ return send(res,500,{ok:false,error:String(error.message || error)}); }
}

if(args.has('--check')){
  let t;
  try { t = await targets(); } catch { console.error('Failed to read blogger.targets.json'); process.exit(1); }
  const v = validateBloggerTargetsConfig(t);
  if (!v.ok) { console.error(JSON.stringify({ ok:false, bloggerTargetsError: v.errors }, null, 2)); process.exit(1); }
  const report = bloggerTargetsReport(t);
  console.log(JSON.stringify({ ok:true, app:'studio', mode:MODE, targets: report }, null, 2));
}else{
  createServer(route).listen(PORT,HOST,()=>console.log(`GG Studio listening on http://${HOST}:${PORT} (${MODE})`));
}
