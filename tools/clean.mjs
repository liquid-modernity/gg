import { promises as fs } from 'node:fs';
await fs.rm('dist', { recursive:true, force:true });
await fs.rm('.cloudflare-build', { recursive:true, force:true });
console.log(JSON.stringify({ ok:true, cleaned:['dist','.cloudflare-build'] }, null, 2));
