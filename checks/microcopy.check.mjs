import { readFile } from 'node:fs/promises';
const id = JSON.parse(await readFile('registry/microcopy.id.json','utf8'));
const en = JSON.parse(await readFile('registry/microcopy.en.json','utf8'));
const idKeys = Object.keys(id).sort();
const enKeys = Object.keys(en).sort();
const missingEn = idKeys.filter((k)=>!enKeys.includes(k));
const missingId = enKeys.filter((k)=>!idKeys.includes(k));
if(missingEn.length || missingId.length){ console.error(JSON.stringify({ok:false, check:'microcopy', missingEn, missingId}, null, 2)); process.exit(1); }
console.log(JSON.stringify({ok:true, check:'microcopy', keys:idKeys.length}, null, 2));
