#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
const checks = ['path','registry','module','microcopy','icon','env','syntax'];
for (const name of checks) {
  const result = spawnSync(process.execPath, [`checks/${name}.check.mjs`], { stdio:'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(JSON.stringify({ ok:true, doctor:'green', checks }, null, 2));
