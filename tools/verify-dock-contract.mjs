import fs from 'fs';
import path from 'path';

const root = process.cwd();
const files = ['index.dev.xml', 'index.prod.xml'];
const requiredActions = ['home', 'blog', 'search', 'contact', 'more'];
const failures = [];

function read(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: missing file`);
    return '';
  }
  return fs.readFileSync(abs, 'utf8');
}

function attr(tag, name) {
  const re = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const m = String(tag || '').match(re);
  return m ? String(m[2] || '') : '';
}

function verifyFile(rel, src) {
  const dockMatch = src.match(/<nav\b(?=[^>]*id=['"]gg-dock['"])[\s\S]*?<\/nav>/i);
  if (!dockMatch) {
    failures.push(`${rel}: missing <nav id='gg-dock'> block`);
    return;
  }

  const dock = dockMatch[0];
  const linkTags = dock.match(/<a\b[^>]*data-gg-primary=['"]1['"][^>]*>/gi) || [];
  if (linkTags.length !== 5) {
    failures.push(`${rel}: dock primary link count must be 5 (found ${linkTags.length})`);
  }

  const actions = [];
  linkTags.forEach((tag) => {
    const action = attr(tag, 'data-gg-action').toLowerCase();
    const href = attr(tag, 'href');
    const exprHref = attr(tag, 'expr:href');
    actions.push(action);
    if (!action) failures.push(`${rel}: primary dock link missing data-gg-action`);
    if (!href && !exprHref) failures.push(`${rel}: primary dock link action='${action || '-'}' missing href/expr:href`);
  });

  const seenSorted = actions.slice().sort();
  const requiredSorted = requiredActions.slice().sort();
  if (seenSorted.length === requiredSorted.length) {
    for (let i = 0; i < requiredSorted.length; i += 1) {
      if (seenSorted[i] !== requiredSorted[i]) {
        failures.push(
          `${rel}: primary dock actions must be exactly ${requiredActions.join(', ')} (found ${actions.join(', ') || '-'})`
        );
        break;
      }
    }
  } else {
    failures.push(`${rel}: primary dock actions must be exactly ${requiredActions.join(', ')}`);
  }

  const illegalPrimary = dock.match(/<(?!a\b)\w+\b[^>]*data-gg-primary=['"]1['"][^>]*>/i);
  if (illegalPrimary) {
    failures.push(`${rel}: non-<a> element found with data-gg-primary='1'`);
  }

  if (!/id=['"]gg-dock-more['"]/i.test(src)) {
    failures.push(`${rel}: missing #gg-dock-more panel`);
  }
  if (!/id=['"]gg-left-panel['"]/i.test(src)) {
    failures.push(`${rel}: missing #gg-left-panel anchor target`);
  }
  if (!/id=['"]gg-page-end['"]/i.test(src)) {
    failures.push(`${rel}: missing #gg-page-end anchor target`);
  }
}

for (const rel of files) {
  verifyFile(rel, read(rel));
}

if (failures.length) {
  console.error('VERIFY_DOCK_CONTRACT: FAIL');
  failures.forEach((entry) => console.error(`- ${entry}`));
  process.exit(1);
}

console.log('VERIFY_DOCK_CONTRACT: PASS');
