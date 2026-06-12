import { readFile } from 'node:fs/promises';
const schema = JSON.parse(await readFile('config/secrets.schema.json','utf8'));
const keys = [...new Set([...(schema.requiredForHostedConsole||[]), ...(schema.requiredForBloggerPublish||[]), ...(schema.requiredForCloudflareDeploy||[])])];
const status = keys.map((name)=>({ name, available: !!process.env[name], requiredForProductionOnly: true }));
console.log(JSON.stringify({ok:true, check:'env', note:'Missing secrets do not fail local starter checks; production deploy must provide them.', status}, null, 2));
