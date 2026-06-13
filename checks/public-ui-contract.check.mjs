import { readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let errors = [];

function fail(msg) {
  errors.push(msg);
  console.error('FAIL:', msg);
}

async function exists(relPath) {
  try { await access(join(ROOT, relPath)); return true; } catch { return false; }
}

async function readText(relPath) {
  return readFile(join(ROOT, relPath), 'utf8');
}

// --- main ---
console.log('=== public-ui-contract check ===\n');

// 1. .gg-icon CSS exists and includes font-family and text-transform:none
const shellCss = await readText('src/modules/shell/shell.css');
const iconBlock = shellCss.match(/\.gg-icon\s*\{([^}]+)\}/s);
if (!iconBlock) {
  fail('.gg-icon rule not found in src/modules/shell/shell.css');
} else {
  const body = iconBlock[1];
  if (/font-family/.test(body)) {
    console.log('ok: .gg-icon includes font-family');
  } else {
    fail('.gg-icon missing font-family');
  }
  if (/text-transform:\s*none/.test(body)) {
    console.log('ok: .gg-icon includes text-transform: none');
  } else {
    fail('.gg-icon missing text-transform: none');
  }
  if (/line-height:\s*1/.test(body)) {
    console.log('ok: .gg-icon includes line-height: 1');
  } else {
    fail('.gg-icon missing line-height: 1');
  }
  console.log('ok: .gg-icon canonical contract present');
}

// 2. Blog font subset includes required icons
const blogXml = await readText('apps/blog/index.xml');
const requiredIcons = ['arrow_back_ios_new', 'ios_share'];
for (const icon of requiredIcons) {
  if (blogXml.includes(icon)) {
    console.log(`ok: Blog font subset includes ${icon}`);
  } else {
    fail(`Blog font subset missing ${icon}`);
  }
}

// 3. data-copy / data-gg-copy is not on composite element containing .gg-icon
async function checkCompositeCopyMarkers(filePath) {
  if (!(await exists(filePath))) {
    console.log(`skip: ${filePath} not found`);
    return;
  }
  const content = await readText(filePath);

  // Strategy: scan per-line for two dangerous patterns
  // A. data-copy/gg-copy AND gg-icon on the SAME opening tag (same-element composite)
  // B. data-copy/gg-copy on an element that spans multiple lines and contains a child with gg-icon

  const lines = content.split('\n');

  // Helper: find all opening tags in a line, returning {start, end, fullMatch} for each
  function findOpeningTags(line) {
    const tags = [];
    const re = /<(\w+)([^>]*)>/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      tags.push({
        tagName: m[1],
        attrs: m[2],
        start: m.index,
        end: m.index + m[0].length,
        full: m[0]
      });
    }
    return tags;
  }

  // Helper: does an attribute string contain data-copy or data-gg-copy?
  function hasCopyAttr(attrs) {
    return /\b(?:data-copy|data-gg-copy)\s*=\s*['"]/.test(attrs);
  }

  // Helper: does an attribute string's class contain gg-icon?
  function hasGgIconClass(attrs) {
    return /class\s*=\s*['"][^'"]*\bgg-icon\b/.test(attrs);
  }

  // Helper: count close tags in a line
  function countCloseTags(line) {
    return (line.match(/<\/\w+>/g) || []).length;
  }

  // Pass 1: same-line — data-copy/gg-copy opening tag also has gg-icon in its class
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/(?:data-copy|data-gg-copy)\s*=\s*['"]/.test(line)) continue;

    const tags = findOpeningTags(line);
    for (const tag of tags) {
      if (hasCopyAttr(tag.attrs) && hasGgIconClass(tag.attrs)) {
        fail(`${filePath}:${i + 1} data-copy on element that also contains .gg-icon class`);
      }
    }
  }

  // Pass 2: multi-line — data-copy/gg-copy on a parent that spans lines and contains .gg-icon child
  let inCopyParent = false;
  let copyDepth = 0;
  let copyLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<(\w+)([^>]*)>/g) || []).filter(t => !/\/\s*>$/.test(t)).length;
    const closes = countCloseTags(line);

    if (!inCopyParent) {
      // Check if this line has a copy-attributed opening tag that doesn't self-close
      const tags = findOpeningTags(line);
      let foundCopyTag = false;
      for (const tag of tags) {
        if (hasCopyAttr(tag.attrs) && !tag.full.trimEnd().endsWith('/>')) {
          foundCopyTag = true;
          break;
        }
      }
      if (foundCopyTag) {
        inCopyParent = true;
        copyDepth = opens - closes;
        copyLine = i;
        if (copyDepth <= 0) {
          // Element opened and closed on same line — no children, safe
          inCopyParent = false;
        }
        continue;
      }
    } else {
      // We're inside a copy-attributed parent
      // Check for gg-icon at current depth
      if (/(?:class\s*=\s*['"][^'"]*\bgg-icon\b|data-gg-icon)/.test(line)) {
        fail(`${filePath}:${copyLine + 1} data-copy on composite element that contains .gg-icon child`);
        inCopyParent = false;
        continue;
      }

      copyDepth += opens - closes;
      if (copyDepth <= 0) {
        inCopyParent = false;
      }
    }
  }

  console.log(`ok: ${filePath} composite copy marker check complete`);
}

await checkCompositeCopyMarkers('apps/blog/index.xml');
await checkCompositeCopyMarkers('apps/store/store.html');
await checkCompositeCopyMarkers('apps/landing/landing.html');

// 4. Vendor icon classes not required in public markup
// Warn if new material-symbols- classes found beyond the preconnect/font links
const vendorClassPattern = /class\s*=\s*['"][^'"]*\bmaterial-symbols-(?:rounded|outlined|sharp)\b/gi;
const blogMatches = blogXml.match(vendorClassPattern);
if (blogMatches && blogMatches.length > 0) {
  blogMatches.forEach(m => {
    fail(`Blog index.xml uses vendor icon class: ${m.trim()}`);
  });
} else {
  console.log('ok: Blog index.xml has no vendor icon classes in markup');
}

// 5. CSS includes rules for .gg-preview__save, .gg-preview__cta, .gg-comment-more__button
const requiredCssRules = [
  { selector: '.gg-preview__save', file: 'src/modules/preview-frame/preview-frame.css' },
  { selector: '.gg-preview__cta', file: 'src/modules/preview-frame/preview-frame.css' },
  { selector: '.gg-comment-more__button', file: 'src/modules/comments/comments.css' },
];

for (const { selector, file } of requiredCssRules) {
  if (!(await exists(file))) {
    fail(`Missing ${file}`);
    continue;
  }
  const cssContent = await readText(file);
  // Match the selector as a CSS rule (followed by {)
  const pattern = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{', 'g');
  if (pattern.test(cssContent)) {
    console.log(`ok: ${selector} rule exists in ${file}`);
  } else {
    fail(`Missing ${selector} rule in ${file}`);
  }
}

// --- final ---
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach(e => console.error('  -', e));
  process.exit(1);
}

console.log('\npublic-ui-contract check passed');