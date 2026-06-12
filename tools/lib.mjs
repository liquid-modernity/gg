import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
export async function readJson(path){ return JSON.parse(await fs.readFile(path, 'utf8')); }
export async function writeFile(path, text){ await fs.mkdir(dirname(path), { recursive:true }); await fs.writeFile(path, text); }
export async function copyFile(src,dst){ await fs.mkdir(dirname(dst), { recursive:true }); await fs.copyFile(src,dst); }
export async function copyDir(src,dst){ if(!existsSync(src)) return; await fs.mkdir(dst,{recursive:true}); for(const entry of await fs.readdir(src,{withFileTypes:true})){ if(entry.name === '.DS_Store') continue; const s=join(src,entry.name), d=join(dst,entry.name); if(entry.isDirectory()) await copyDir(s,d); else await copyFile(s,d); } }
export function minifyCss(text){ return text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,>])\s*/g,'$1').trim(); }
export function minifyJs(text){ return text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|\n)\s*\/\/[^\n]*/g,'$1').replace(/\s+/g,' ').trim(); }
