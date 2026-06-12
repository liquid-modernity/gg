import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
async function walk(dir){ let out=[]; for(const e of await fs.readdir(dir,{withFileTypes:true})){ if(['dist','.cloudflare-build','legacy-donor','node_modules'].includes(e.name)) continue; const p=join(dir,e.name); if(e.isDirectory()) out=out.concat(await walk(p)); else if(/\.(mjs|js)$/.test(e.name)) out.push(p); } return out; }
const files = await walk('.');
const bad=[];
for(const file of files){ const r = spawnSync(process.execPath, ['--check', file], { encoding:'utf8' }); if(r.status !== 0) bad.push({file, error:(r.stderr||r.stdout).split('\n').slice(0,4).join('\n')}); }
if(bad.length){ console.error(JSON.stringify({ok:false, check:'syntax', bad}, null, 2)); process.exit(1); }
console.log(JSON.stringify({ok:true, check:'syntax', files:files.length}, null, 2));
