#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const dry = process.argv.includes('--dry-run');
if(!existsSync('.cloudflare-build/public') || !existsSync('.cloudflare-build/worker.js')){
  console.error('Missing .cloudflare-build output. Run npm run build first.');
  process.exit(1);
}
if(dry){
  console.log(JSON.stringify({ ok:true, dryRun:true, deployable:true, note:'Cloudflare build output exists. Real deploy requires wrangler/auth.' }, null, 2));
  process.exit(0);
}
const result = spawnSync('npx', ['wrangler','deploy'], { stdio:'inherit', shell: process.platform === 'win32' });
process.exit(result.status || 0);
