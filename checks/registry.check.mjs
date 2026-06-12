import { promises as fs } from 'node:fs';
import { join } from 'node:path';
async function walk(dir){ let out=[]; for(const e of await fs.readdir(dir,{withFileTypes:true})){ const p=join(dir,e.name); if(e.isDirectory()) out=out.concat(await walk(p)); else if(e.name.endsWith('.json')) out.push(p); } return out; }
const files = [...await walk('registry'), ...await walk('config')];
const bad=[];
for(const file of files){ try{ JSON.parse(await fs.readFile(file,'utf8')); } catch(error){ bad.push({file,error:String(error.message)}); } }
if(bad.length){ console.error(JSON.stringify({ok:false, check:'registry', bad}, null, 2)); process.exit(1); }
console.log(JSON.stringify({ok:true, check:'registry', files:files.length}, null, 2));
