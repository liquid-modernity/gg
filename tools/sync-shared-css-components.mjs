#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

const components = {
  'gg-visual-tokens': 'src/css/components/gg-visual-tokens.css',
  'gg-sheet-core': 'src/css/components/gg-sheet-core.css',
  'gg-sheet-modal': 'src/css/components/gg-sheet-modal.css',
  'gg-preview-frame': 'src/css/components/gg-preview-frame.css',
  'gg-more-sheet': 'src/css/components/gg-more-sheet.css',
  'gg-discovery-sheet': 'src/css/components/gg-discovery-sheet.css',
};

const modules = {
  'module-detail-toolbar': 'src/css/modules/detail-toolbar.css',
};

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, contents) {
  fs.writeFileSync(path.join(root, relativePath), `${contents.replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function component(name) {
  const value = read(components[name]).trim();
  if (!value) throw new Error(`${components[name]} is empty`);
  return value;
}

function moduleSource(name) {
  const value = read(modules[name]).trim();
  if (!value) throw new Error(`${modules[name]} is empty`);
  return value;
}

function block(name) {
  const source = Object.prototype.hasOwnProperty.call(components, name) ? component(name) : moduleSource(name);
  return `/* BEGIN GENERATED: ${name} */\n${source}\n/* END GENERATED: ${name} */\n`;
}

function replaceOrFallback(contents, name, fallbackPattern) {
  const begin = `/* BEGIN GENERATED: ${name} */`;
  const end = `/* END GENERATED: ${name} */`;
  const generatedPattern = new RegExp(`${escapeRegExp(begin)}[\\s\\S]*?${escapeRegExp(end)}`, 'g');
  const next = block(name);
  if (generatedPattern.test(contents)) return contents.replace(generatedPattern, next);
  if (!fallbackPattern.test(contents)) throw new Error(`Could not find ${name} insertion point`);
  return contents.replace(fallbackPattern, next);
}

function insertOrReplaceAfter(contents, name, anchorPattern) {
  const begin = `/* BEGIN GENERATED: ${name} */`;
  const end = `/* END GENERATED: ${name} */`;
  const generatedPattern = new RegExp(`${escapeRegExp(begin)}[\\s\\S]*?${escapeRegExp(end)}`, 'g');
  const next = block(name);
  if (generatedPattern.test(contents)) return contents.replace(generatedPattern, next);
  const match = contents.match(anchorPattern);
  if (!match) throw new Error(`Could not find ${name} insertion point`);
  return contents.replace(anchorPattern, `${match[0]}\n${next}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function syncFile(relativePath, transforms) {
  let contents = read(relativePath);
  for (const transform of transforms) contents = transform(contents);
  write(relativePath, contents);
}

function stripRootDiscoveryDuplicates(contents) {
  return contents
    .replace(/\n\.gg-discovery-search__field \{\n[\s\S]*?\n\}\n(?=\n\.gg-entry-list \{)/, '\n')
    .replace(/\n  \.gg-discovery-search__field \{\n[\s\S]*?\n  \}\n(?=\n  \.gg-article \{)/, '\n');
}

function stripStoreSheetCoreDuplicates(contents) {
  return contents
    .replace(
      /\n    \.gg-sheet\[data-gg-state='dragging'\] \.gg-sheet__panel,\n    \.gg-sheet\[data-gg-state='dragging'\] \.gg-sheet__scrim \{ transition: none; \}\n/g,
      '\n'
    )
    .replace(
      /\n    \.gg-sheet__head \{[\s\S]*?\n    \.gg-sheet__title \{[\s\S]*?\n    \}\n(?=\s*\.store-discovery-body)/,
      '\n'
    );
}

for (const source of Object.values(components)) component(path.basename(source, '.css'));
for (const source of Object.values(modules)) moduleSource(`module-${path.basename(source, '.css')}`);

write('src/css/modules/sheets.css', `${component('gg-sheet-core')}\n`);
write('src/css/modules/more.css', `${component('gg-more-sheet')}\n`);
write('src/css/modules/discovery.css', `${component('gg-discovery-sheet')}\n`);
write('src/css/modules/visual-tokens.css', `${component('gg-visual-tokens')}\n`);
write('src/css/modules/preview-frame.css', `${component('gg-preview-frame')}\n`);

syncFile('src/css/modules/dock.css', [
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-modal',
    /body\[data-gg-panel-active='true'\] \.gg-dock \{[\s\S]*?\n\}\n(?=\n\.gg-dock__item \{)/
  ),
]);

syncFile('src/css/gg-app.source.css', [
  (contents) => stripRootDiscoveryDuplicates(contents),
  (contents) => insertOrReplaceAfter(
    contents,
    'gg-visual-tokens',
    /html\[data-gg-theme='light'\]\s*\{\s*color-scheme:\s*light;\s*\}\n/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-modal',
    /body\[data-gg-panel-active='true'\] \.gg-dock \{[\s\S]*?\n\}\n(?=\n\.gg-dock__item \{)/
  ),
  (contents) => replaceOrFallback(
    contents,
    'module-detail-toolbar',
    /\.gg-detail-toolbar \{[\s\S]*?\.gg-detail-toolbar__action:focus-visible \{\n  background: var\(--gg-toolbar-item-hover-bg\);\n\}/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-core',
    /\.gg-sheet \{[\s\S]*?\.gg-sheet__head \.gg-sheet__handle \{\n  margin-bottom: 0;\n\}/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-discovery-sheet',
    /\.gg-discovery \{[\s\S]*?\n\}\n(?=\n\.gg-preview \{)/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-preview-frame',
    /\.gg-preview \{[\s\S]*?\.gg-preview__surface \{[\s\S]*?\n\}\n(?=\n\.gg-preview__summary \{)/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-more-sheet',
    /\.gg-more-sheet \{[\s\S]*?\n\}\n(?=\n@media \(max-width: 480px\) \{)/
  ),
]);

syncFile('landing.html', [
  (contents) => insertOrReplaceAfter(
    contents,
    'gg-visual-tokens',
    /    html\[data-gg-theme='light'\]\s*\{\s*color-scheme:\s*light;\s*\}\n/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-modal',
    /    body\[data-gg-panel-active='true'\] \.gg-dock \{[^\n]*\}\n    body\[data-gg-panel-active='true'\] \.gg-dock::after \{[^\n]*\}\n/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-core',
    /    \.gg-sheet \{[\s\S]*?    \.gg-sheet__body \{[^\n]*\}\n/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-discovery-sheet',
    /    #gg-command-panel \[data-gg-scroll-container\][\s\S]*?    \.gg-control\[aria-pressed='true'\], \.gg-control:hover, \.gg-control:focus-visible \{[^\n]*\}\n/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-more-sheet',
    /    #gg-more-panel \.gg-sheet__body \{[\s\S]*?    #gg-more-panel \.gg-more-sheet > \.gg-sheet__body \{[^\n]*\}\n/
  ),
]);

syncFile('src/store/store.css', [
  (contents) => insertOrReplaceAfter(
    contents,
    'gg-visual-tokens',
    /    html\[data-gg-theme='light'\]\s*\{\s*color-scheme:\s*light;\s*\}\n/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-modal',
    /    body\[data-gg-panel-active='true'\] \.gg-dock \{[\s\S]*?    body\[data-gg-panel-active='true'\] \.gg-dock::after \{\n      opacity: 1;\n    \}\n/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-core',
    /    \.gg-sheet \{[\s\S]*?    \.gg-sheet\[data-gg-state='opening'\] \.gg-sheet__scrim,\n    \.gg-sheet\[data-gg-state='open'\] \.gg-sheet__scrim,\n    \.gg-sheet\[data-gg-state='dragging'\] \.gg-sheet__scrim \{ opacity: 1; \}\n/
  ),
  (contents) => stripStoreSheetCoreDuplicates(contents),
  (contents) => insertOrReplaceAfter(
    contents,
    'gg-preview-frame',
    /    \.gg-dock__label \{[^\n]*\}\n/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-more-sheet',
    /\.gg-more-sheet \{[\s\S]*?\.store-bottom-sheet \.gg-more-footer \{ padding-bottom: 6px; \}\n/
  ),
]);

console.log('Synced shared CSS components.');
