import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
const reg = JSON.parse(await readFile('registry/modules.json','utf8'));
const bad=[];
for(const id of reg.bundleOrder){
  const mod = reg.modules[id];
  if(!mod) bad.push({id, error:'missing module registry'});
  for(const key of ['css','js']) if(mod?.[key] && !existsSync(mod[key])) bad.push({id, file:mod[key], error:'missing file'});
  const contract = `src/modules/${id}/${id}.contract.json`;
  if(!existsSync(contract)) bad.push({id, file:contract, error:'missing contract'});
}
if(bad.length){ console.error(JSON.stringify({ok:false, check:'module', bad}, null, 2)); process.exit(1); }
console.log(JSON.stringify({ok:true, check:'module', modules:reg.bundleOrder.length}, null, 2));
