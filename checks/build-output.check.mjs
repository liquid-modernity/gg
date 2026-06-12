import { existsSync } from 'node:fs';
const required = ['dist/dev/assets/gg-app.bundle.css','dist/dev/assets/gg-app.bundle.js','dist/prod/assets/gg-app.min.css','dist/prod/assets/gg-app.min.js','.cloudflare-build/public/manifest.webmanifest','.cloudflare-build/worker.js'];
const missing = required.filter((p)=>!existsSync(p));
if(missing.length){ console.error(JSON.stringify({ok:false, check:'build-output', missing, fix:'Run npm run build'}, null, 2)); process.exit(1); }
console.log(JSON.stringify({ok:true, check:'build-output'}, null, 2));
