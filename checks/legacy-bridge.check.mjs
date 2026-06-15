import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
  console.error('FAIL:', message);
}

function warn(message) {
  warnings.push(message);
  console.warn('WARN:', message);
}

async function readText(relPath) {
  return readFile(join(ROOT, relPath), 'utf8');
}

async function exists(relPath) {
  try {
    await stat(join(ROOT, relPath));
    return true;
  } catch {
    return false;
  }
}

async function readJson(relPath) {
  try {
    return JSON.parse(await readText(relPath));
  } catch (error) {
    fail(`${relPath} is not valid JSON: ${error.message}`);
    return null;
  }
}

async function walk(dir, extensions, results = []) {
  let entries;
  try {
    entries = await readdir(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const rel = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['dist', '.cloudflare-build', 'legacy-donor', 'node_modules'].includes(entry.name)) continue;
      await walk(rel, extensions, results);
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(rel);
    }
  }

  return results;
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function hasTemplateId(markup, id) {
  const pattern = new RegExp(`\\bid\\s*=\\s*(['"])${id}\\1`);
  return pattern.test(markup);
}

function countCreateElementFindings(files, publicDomPolicy, fileContents) {
  const ceAudit = publicDomPolicy.createElementAudit || {};
  const allowedSmallTags = new Set(ceAudit.allowedSmallTags || []);
  const needsTemplateTags = new Set(ceAudit.needsTemplateTags || []);
  const reviewedOccurrences = ceAudit.unclassifiedElementAudit?.reviewedOccurrences || [];
  const reviewedMap = new Map();

  for (const occurrence of reviewedOccurrences) {
    reviewedMap.set(`${occurrence.file}:${occurrence.line}:${occurrence.tag}`, occurrence);
  }

  const result = {
    createElement: 0,
    allowedSmall: 0,
    allowedReviewed: 0,
    needsTemplate: 0,
    unclassified: 0
  };
  const pattern = /document\.createElement\s*\(\s*(['"])([a-zA-Z0-9-]+)\1\s*\)/g;

  for (const file of files) {
    const content = fileContents.get(file);
    if (!content) continue;
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(line)) !== null) {
        const lineNumber = i + 1;
        const tag = match[2].toLowerCase();
        result.createElement += 1;

        if (allowedSmallTags.has(tag)) {
          result.allowedSmall += 1;
        } else if (needsTemplateTags.has(tag)) {
          result.needsTemplate += 1;
        } else if (reviewedMap.has(`${file}:${lineNumber}:${tag}`)) {
          const reviewed = reviewedMap.get(`${file}:${lineNumber}:${tag}`);
          if (reviewed.classification === 'needsTemplate') {
            result.needsTemplate += 1;
          } else {
            result.allowedReviewed += 1;
          }
        } else {
          result.unclassified += 1;
        }
      }
    }
  }

  return result;
}

console.log('=== legacy-bridge check ===\n');

const policy = await readJson('config/legacy-app-bridge-policy.json');
const publicDomPolicy = await readJson('config/public-dom-generation-policy.json');
const packageJson = await readJson('package.json');
const registry = await readJson('registry/modules.json');

if (!policy || !publicDomPolicy || !packageJson || !registry) process.exit(1);

const legacyAppPath = policy.legacyAppPath || 'src/modules/legacy-app/legacy-app.js';
const legacyDonorPath = policy.legacyDonorPath || 'legacy-donor';
const genericTemplates = policy.forbidden?.genericTemplates || [];
const extractionBuckets = policy.extractionBuckets || [];
const legacyBudget = policy.legacyAppBudget || {};
const requiredBridgeModules = policy.requiredBridgeModules || [];
const classicRuntimeHelperModules = policy.classicRuntimeHelperModules || [];

if (policy.status !== 'active-bridge') fail('legacy bridge policy status must be active-bridge');
if (policy.doNotDeleteYet !== true) fail('legacy bridge policy must set doNotDeleteYet=true');
if (!(await exists(legacyAppPath))) fail(`${legacyAppPath} is missing`);
if (!(await exists(legacyDonorPath))) fail(`${legacyDonorPath}/ is missing`);

const legacyApp = await readText(legacyAppPath).catch((error) => {
  fail(`Cannot read ${legacyAppPath}: ${error.message}`);
  return '';
});
const legacyStat = await stat(join(ROOT, legacyAppPath)).catch(() => ({ size: 0 }));
const legacyLines = legacyApp ? legacyApp.split('\n').length - (legacyApp.endsWith('\n') ? 1 : 0) : 0;

if (packageJson.scripts?.['check:legacy-bridge'] !== 'node checks/legacy-bridge.check.mjs') {
  fail('package.json missing script check:legacy-bridge');
}

if (typeof legacyBudget.maxBytes === 'number' && legacyStat.size > legacyBudget.maxBytes) {
  fail(`${legacyAppPath} exceeds byte budget: ${legacyStat.size} > ${legacyBudget.maxBytes} (baseline ${legacyBudget.baselineBytes ?? 'unknown'})`);
}
if (typeof legacyBudget.maxLines === 'number' && legacyLines > legacyBudget.maxLines) {
  fail(`${legacyAppPath} exceeds line budget: ${legacyLines} > ${legacyBudget.maxLines} (baseline ${legacyBudget.baselineLines ?? 'unknown'})`);
}

if (typeof legacyBudget.buckets === 'number' && extractionBuckets.length !== legacyBudget.buckets) {
  fail(`config/legacy-app-bridge-policy.json extraction bucket count must be ${legacyBudget.buckets}, got ${extractionBuckets.length}`);
} else if (extractionBuckets.length < 8) {
  fail('config/legacy-app-bridge-policy.json must define at least 8 extraction buckets');
}

for (const bucket of extractionBuckets) {
  if (!bucket.id || !bucket.name || !Array.isArray(bucket.ownerFiles) || !bucket.status || !bucket.nextTaskRecommendation) {
    fail(`extraction bucket is incomplete: ${JSON.stringify(bucket)}`);
  }
}

const inventoryPath = 'docs/legacy-app-bridge-inventory.md';
const inventory = await readText(inventoryPath).catch((error) => {
  fail(`${inventoryPath} is missing or unreadable: ${error.message}`);
  return '';
});
const requiredHeadings = [
  '# Legacy App Bridge Inventory',
  '## Purpose',
  '## Current Runtime Role',
  '## Domain Buckets',
  '## Extraction Order',
  '## Do Not Delete Yet',
  '## Done Criteria For Removing legacy-app'
];
for (const heading of requiredHeadings) {
  if (!inventory.includes(heading)) fail(`${inventoryPath} missing heading: ${heading}`);
}

const legacyBundleIndex = registry.bundleOrder?.indexOf('legacy-app') ?? -1;
if (legacyBundleIndex < 0) fail('registry/modules.json bundleOrder must include legacy-app');
for (const required of requiredBridgeModules) {
  const id = required.id;
  const moduleConfig = registry.modules?.[id];
  const moduleIndex = registry.bundleOrder?.indexOf(id) ?? -1;

  if (!id) {
    fail(`required bridge module entry missing id: ${JSON.stringify(required)}`);
    continue;
  }
  if (!moduleConfig) {
    fail(`registry/modules.json missing required bridge module: ${id}`);
    continue;
  }
  if (moduleConfig.enabled !== true) fail(`required bridge module must be enabled: ${id}`);
  if (required.type && moduleConfig.type !== required.type) fail(`required bridge module ${id} type must be ${required.type}, got ${moduleConfig.type || 'missing'}`);
  if (required.js && moduleConfig.js !== required.js) fail(`required bridge module ${id} js must be ${required.js}, got ${moduleConfig.js || 'missing'}`);
  if (moduleIndex < 0) fail(`registry/modules.json bundleOrder missing required bridge module: ${id}`);
  if (legacyBundleIndex >= 0 && moduleIndex >= legacyBundleIndex) fail(`required bridge module must bundle before legacy-app: ${id}`);
}

const buildSource = await readText('tools/build.mjs').catch((error) => {
  fail(`tools/build.mjs is missing or unreadable: ${error.message}`);
  return '';
});
const helperSetMatch = buildSource.match(/CLASSIC_RUNTIME_HELPER_MODULES\s*=\s*new Set\(\s*\[([\s\S]*?)\]\s*\)/);
if (!helperSetMatch) {
  fail('tools/build.mjs must declare CLASSIC_RUNTIME_HELPER_MODULES as an auditable literal Set');
} else {
  const actualHelpers = Array.from(helperSetMatch[1].matchAll(/['"]([^'"]+)['"]/g)).map((match) => match[1]).sort();
  const expectedHelpers = classicRuntimeHelperModules.slice().sort();
  if (JSON.stringify(actualHelpers) !== JSON.stringify(expectedHelpers)) {
    fail(`tools/build.mjs CLASSIC_RUNTIME_HELPER_MODULES must match policy exactly. expected=${expectedHelpers.join(',')} actual=${actualHelpers.join(',')}`);
  }
}

const publicSurfaceFiles = [
  ...(await walk('src', ['.js', '.mjs'])),
  ...(await walk('apps/blog', ['.html', '.xml', '.js', '.mjs'])),
  ...(await walk('apps/store', ['.html', '.xml', '.js', '.mjs'])),
  ...(await walk('apps/landing', ['.html', '.xml', '.js', '.mjs']))
];
const fileContents = new Map();

for (const file of publicSurfaceFiles) {
  let content = '';
  try {
    content = await readText(file);
  } catch (error) {
    warn(`Cannot read ${file}: ${error.message}`);
    continue;
  }
  fileContents.set(file, content);

  const donorRuntimePattern = /(?:from\s+['"][^'"]*legacy-donor|import\s*\([^)]*legacy-donor|(?:src|href)\s*=\s*['"][^'"]*legacy-donor|['"][^'"]*legacy-donor\/)/;
  if (policy.forbidden?.legacyDonorRuntimeImports && donorRuntimePattern.test(content)) {
    fail(`public runtime source references ${legacyDonorPath}: ${file}`);
  }
}

for (const surface of ['apps/blog/index.xml', 'apps/store/store.html']) {
  const markup = await readText(surface).catch((error) => {
    fail(`Cannot read ${surface}: ${error.message}`);
    return '';
  });
  for (const id of genericTemplates) {
    if (hasTemplateId(markup, id)) fail(`forbidden generic template id in ${surface}: ${id}`);
  }
}

if (policy.forbidden?.newHiddenUiGeneration) {
  const blockedCreateTags = ['section', 'article', 'button', 'nav', 'header', 'footer', 'dialog', 'form'];
  for (const tag of blockedCreateTags) {
    const pattern = new RegExp(`document\\.createElement\\s*\\(\\s*(['"])${tag}\\1\\s*\\)`);
    const match = pattern.exec(legacyApp);
    if (match) fail(`${legacyAppPath}:${lineNumberAt(legacyApp, match.index)} forbidden createElement('${tag}')`);
  }

  for (const pattern of [
    { name: 'innerHTML template-literal UI assignment', regex: /innerHTML\s*=\s*`/g },
    { name: 'insertAdjacentHTML', regex: /\binsertAdjacentHTML\b/g },
    { name: 'outerHTML', regex: /\bouterHTML\b/g }
  ]) {
    let match;
    while ((match = pattern.regex.exec(legacyApp)) !== null) {
      fail(`${legacyAppPath}:${lineNumberAt(legacyApp, match.index)} forbidden hidden UI generation pattern: ${pattern.name}`);
    }
  }
}

const srcFiles = await walk('src', ['.js', '.mjs']);
for (const file of srcFiles) {
  if (!fileContents.has(file)) {
    try {
      fileContents.set(file, await readText(file));
    } catch {
      // Already warned in the public surface pass if relevant.
    }
  }
}
const ceSummary = countCreateElementFindings(srcFiles, publicDomPolicy, fileContents);

if (typeof legacyBudget.createElement === 'number' && ceSummary.createElement > legacyBudget.createElement) {
  fail(`public DOM createElement count exceeds budget: ${ceSummary.createElement} > ${legacyBudget.createElement}`);
}
if (typeof legacyBudget.allowedSmall === 'number' && ceSummary.allowedSmall !== legacyBudget.allowedSmall) {
  fail(`public DOM allowedSmall must be ${legacyBudget.allowedSmall}, got ${ceSummary.allowedSmall}`);
}
if (typeof legacyBudget.allowedReviewed === 'number' && ceSummary.allowedReviewed !== legacyBudget.allowedReviewed) {
  fail(`public DOM allowedReviewed must be ${legacyBudget.allowedReviewed}, got ${ceSummary.allowedReviewed}`);
}
if (typeof legacyBudget.needsTemplate === 'number' && ceSummary.needsTemplate !== legacyBudget.needsTemplate) {
  fail(`public DOM needsTemplate must be ${legacyBudget.needsTemplate}, got ${ceSummary.needsTemplate}`);
}
if (typeof legacyBudget.unclassified === 'number' && ceSummary.unclassified !== legacyBudget.unclassified) {
  fail(`public DOM unclassified must be ${legacyBudget.unclassified}, got ${ceSummary.unclassified}`);
}
if (policy.publicDomPolicy?.requiresNeedsTemplateZero && ceSummary.needsTemplate !== 0) {
  fail(`public DOM needsTemplate must be 0, got ${ceSummary.needsTemplate}`);
}
if (policy.publicDomPolicy?.requiresUnclassifiedZero && ceSummary.unclassified !== 0) {
  fail(`public DOM unclassified must be 0, got ${ceSummary.unclassified}`);
}

if (errors.length) {
  console.error(`\nlegacy-bridge FAIL: errors=${errors.length} warnings=${warnings.length}`);
  process.exit(1);
}

console.log(
  `legacy-bridge ok: bytes=${legacyStat.size}/${legacyBudget.maxBytes ?? 'unbudgeted'} lines=${legacyLines}/${legacyBudget.maxLines ?? 'unbudgeted'} createElement=${ceSummary.createElement}/${legacyBudget.createElement ?? 'unbudgeted'} allowedSmall=${ceSummary.allowedSmall} allowedReviewed=${ceSummary.allowedReviewed} needsTemplate=${ceSummary.needsTemplate} unclassified=${ceSummary.unclassified} buckets=${extractionBuckets.length}/${legacyBudget.buckets ?? 'unbudgeted'} bridgeModules=${requiredBridgeModules.length}`
);
