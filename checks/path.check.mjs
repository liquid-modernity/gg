import { existsSync } from 'node:fs';
const required = ['package.json','AGENTS.md','src/modules','src/entries','apps/console/server.mjs','apps/studio/server.mjs','registry/modules.json','config/blogger.targets.json','public/manifest.webmanifest','tools/build.mjs'];
const missing = required.filter((p)=>!existsSync(p));
if(missing.length){ console.error(JSON.stringify({ok:false, check:'path', missing}, null, 2)); process.exit(1); }
console.log(JSON.stringify({ok:true, check:'path'}, null, 2));
