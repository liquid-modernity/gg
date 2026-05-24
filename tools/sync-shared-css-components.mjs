#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

const components = {
  'gg-sheet-core': 'src/css/components/gg-sheet-core.css',
  'gg-sheet-modal': 'src/css/components/gg-sheet-modal.css',
  'gg-more-sheet': 'src/css/components/gg-more-sheet.css',
  'gg-discovery-sheet': 'src/css/components/gg-discovery-sheet.css',
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

function block(name) {
  return `/* BEGIN GENERATED: ${name} */\n${component(name)}\n/* END GENERATED: ${name} */\n`;
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

for (const source of Object.values(components)) component(path.basename(source, '.css'));

write('src/css/modules/sheets.css', `${component('gg-sheet-core')}\n`);
write('src/css/modules/more.css', `${component('gg-more-sheet')}\n`);
write('src/css/modules/discovery.css', `${component('gg-discovery-sheet')}\n`);

syncFile('src/css/modules/dock.css', [
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-modal',
    /body\[data-gg-panel-active='true'\] \.gg-dock \{[\s\S]*?\n\}\n(?=\n\.gg-dock__item \{)/
  ),
]);

syncFile('src/css/gg-app.source.css', [
  (contents) => stripRootDiscoveryDuplicates(contents),
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-modal',
    /body\[data-gg-panel-active='true'\] \.gg-dock \{[\s\S]*?\n\}\n(?=\n\.gg-dock__item \{)/
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
    'gg-more-sheet',
    /\.gg-more-sheet \{[\s\S]*?\n\}\n(?=\n@media \(max-width: 480px\) \{)/
  ),
]);

syncFile('landing.html', [
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
  (contents) => replaceOrFallback(
    contents,
    'gg-sheet-modal',
    /    body\[data-gg-panel-active='true'\] \.gg-dock \{[\s\S]*?    body\[data-gg-panel-active='true'\] \.gg-dock::after \{\n      opacity: 1;\n    \}\n/
  ),
  (contents) => replaceOrFallback(
    contents,
    'gg-more-sheet',
    /\.gg-more-sheet \{[\s\S]*?\.store-bottom-sheet \.gg-more-footer \{ padding-bottom: 6px; \}\n/
  ),
]);

console.log('Synced shared CSS components.');
