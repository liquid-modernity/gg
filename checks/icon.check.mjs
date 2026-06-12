import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const icons = JSON.parse(await readFile('registry/icons.json','utf8'));
const missing = Object.entries(icons).filter(([,src]) => typeof src === 'string' && src.startsWith('/') && !existsSync(`public${src}`));
if(missing.length){ console.error(JSON.stringify({ok:false, check:'icon', missing}, null, 2)); process.exit(1); }
console.log(JSON.stringify({ok:true, check:'icon', icons:Object.keys(icons).length}, null, 2));
