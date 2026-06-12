export async function readJson(){
  throw new Error('Remote adapter is a scaffold. Wire GitHub API, Cloudflare KV/R2/D1, or a secure backend before enabling production writes.');
}
export async function writeJson(){
  throw new Error('Production Console must not assume filesystem writes. Use GitHub/Cloudflare adapter.');
}
