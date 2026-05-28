#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootArgIndex = process.argv.indexOf('--root');
const ROOT = path.resolve(rootArgIndex >= 0 ? (process.argv[rootArgIndex + 1] || process.cwd()) : process.cwd());
const RUN_QA = process.argv.includes('--run-qa');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, next) {
  const prev = read(file);
  if (prev === next) return false;
  fs.writeFileSync(file, next);
  return true;
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function patchXmlDescriptionContract(source) {
  let next = source;

  // Remove the default Blogger/sample meta description that appears before the dynamic description.
  next = next.replace(
    /\n\s*<meta\s+content='Mary&apos;s simple recipe for maple bacon donuts[\s\S]*?coming back for\.'\s+name='description'\/>/g,
    ''
  );

  // Remove the default Blogger/sample homepage title suffix.
  next = next.replace(
    /<title><data:blog\.title\/>\s*&#8226;\s*Mary&#39;s simple recipe for maple bacon donuts[\s\S]*?coming back for\.<\/title>/g,
    '<title><data:blog.title/></title>'
  );

  // Give the detail article a stable, article-owned summary payload for preview parsing.
  next = next.replace(
    /(<article\s+class='gg-article'(?:(?!>).)*?expr:data-gg-post-url='data:post\.url')(?![^>]*data-gg-post-summary)(\s*)>/gs,
    "$1 expr:data-gg-post-summary='data:post.snippet.escaped'$2>"
  );

  return next;
}

const parsePreviewHtmlReplacement = `function parsePreviewHtml(html, url) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var article = doc.querySelector('.gg-article');
          var body = doc.querySelector('.gg-post-body, .entry-content');
          var metaDescriptionNodes = doc.querySelectorAll('meta[name="description"]');
          var jsonLdNodes = doc.querySelectorAll('script[type="application/ld+json"]');
          var firstParagraph = body ? body.querySelector('p') : null;
          var firstImage = body ? body.querySelector('img') : null;
          var labelNodes = doc.querySelectorAll('.gg-taxonomy__link, .post-labels a[rel="tag"]');
          var labels = [];
          var headings = collectOutlineHeadings(body, {
            absoluteBase: url,
            limit: 8,
            prefix: 'gg-preview-section'
          });
          var i;
          var text;
          var href;
          var articleSummary;
          var summary;

          function normalizePreviewSummary(value) {
            return stripHtml(value || '').replace(/\\s+/g, ' ').trim();
          }

          function isPreviewDummySummary(value) {
            var clean = normalizePreviewSummary(value).toLowerCase();
            return clean.indexOf("mary's simple recipe for maple bacon donuts") !== -1 && clean.indexOf('coming back for') !== -1;
          }

          function cleanPreviewSummary(value) {
            var clean = normalizePreviewSummary(value);
            return clean && !isPreviewDummySummary(clean) ? clean : '';
          }

          function collectJsonLdObjects(value, target) {
            var key;
            if (!value) return;
            if (Array.isArray(value)) {
              for (key = 0; key < value.length; key += 1) collectJsonLdObjects(value[key], target);
              return;
            }
            if (typeof value !== 'object') return;
            target.push(value);
            if (value['@graph']) collectJsonLdObjects(value['@graph'], target);
            if (value.mainEntity) collectJsonLdObjects(value.mainEntity, target);
            if (value.mainEntityOfPage) collectJsonLdObjects(value.mainEntityOfPage, target);
          }

          function getJsonLdType(item) {
            var type = item ? item['@type'] : '';
            if (Array.isArray(type)) type = type.join(' ');
            return String(type || '').toLowerCase();
          }

          function descriptionFromJsonLd() {
            var objects = [];
            var fallback = '';
            var raw;
            var parsed;
            var type;
            var description;
            var j;

            for (j = 0; j < jsonLdNodes.length; j += 1) {
              raw = String(jsonLdNodes[j].textContent || '').trim();
              if (!raw) continue;
              if (raw.indexOf('&quot;') !== -1 || raw.indexOf('&#34;') !== -1) raw = stripHtml(raw);
              try {
                parsed = JSON.parse(raw);
              } catch (error) {
                continue;
              }
              collectJsonLdObjects(parsed, objects);
            }

            for (j = 0; j < objects.length; j += 1) {
              type = getJsonLdType(objects[j]);
              description = cleanPreviewSummary(objects[j].description || '');
              if (!description) continue;
              if (/\\b(blogposting|article|newsarticle|product|webpage)\\b/.test(type)) return description;
              if (!fallback) fallback = description;
            }

            return fallback;
          }

          function descriptionFromMeta() {
            var candidate;
            var j;
            for (j = 0; j < metaDescriptionNodes.length; j += 1) {
              candidate = cleanPreviewSummary(metaDescriptionNodes[j].getAttribute('content') || '');
              if (candidate) return candidate;
            }
            return '';
          }

          articleSummary = article ? cleanPreviewSummary(article.getAttribute('data-gg-post-summary') || '') : '';
          summary = articleSummary || descriptionFromJsonLd() || descriptionFromMeta();
          if (!summary && firstParagraph) summary = cleanPreviewSummary(firstParagraph.innerHTML || firstParagraph.textContent || '');

          for (i = 0; i < labelNodes.length; i += 1) {
            text = stripHtml(labelNodes[i].textContent || '');
            href = labelNodes[i].getAttribute('href') || '';
            if (!text) continue;
            labels.push({
              text: text,
              href: href ? toAbsoluteUrl(href, url) : ''
            });
          }

          return {
            title: article ? (article.getAttribute('data-gg-post-title') || '') : '',
            author: article ? (article.getAttribute('data-gg-post-author') || '') : '',
            published: article ? (article.getAttribute('data-gg-post-published') || '') : '',
            updated: article ? (article.getAttribute('data-gg-post-updated') || '') : '',
            readTime: estimateReadTimeMinutes(body ? (body.textContent || summary) : summary),
            image: firstImage ? toAbsoluteUrl(firstImage.getAttribute('src') || '', url) : '',
            summary: summary,
            headings: headings,
            labels: labels
          };
        }

        `;

function patchPreviewParser(source) {
  const start = source.indexOf('function parsePreviewHtml(html, url) {');
  const end = source.indexOf('function loadPreviewDetail(payload) {', start);
  if (start === -1 || end === -1) return source;
  return source.slice(0, start) + parsePreviewHtmlReplacement + source.slice(end);
}

function patchFile(rel, patcher) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return false;
  const next = patcher(read(file));
  const changed = writeIfChanged(file, next);
  if (changed) console.log('patched', rel);
  else console.log('ok     ', rel);
  return changed;
}

const xmlFiles = [
  'index.xml',
  'dist/index.final.xml',
  'dist/index.final.production.xml',
  'dist/index.standalone.development.xml',
  'dist/index.extracted.development.xml',
  'dist/index.extracted.production.xml',
  'dist/blogger-template.publish.xml',
  'dist/blogger-template.publish.txt'
];

const jsFiles = [
  'src/js/gg-app.source.js',
  '__gg/assets/js/gg-app.dev.js',
  '__gg/assets/js/gg-app.min.js',
  'dist/assets/js/gg-app.dev.js',
  'dist/assets/js/gg-app.min.js'
];

let changedCount = 0;
for (const rel of xmlFiles) if (patchFile(rel, patchXmlDescriptionContract)) changedCount += 1;
for (const rel of jsFiles) if (patchFile(rel, patchPreviewParser)) changedCount += 1;

function assertNoMaryMeta(rel) {
  if (!exists(rel)) return;
  const content = read(path.join(ROOT, rel));
  if (/meta\s+content='Mary&apos;s simple recipe/.test(content)) {
    throw new Error(`${rel} still contains the dummy Mary meta description.`);
  }
}

function assertParser(rel) {
  if (!exists(rel)) return;
  const content = read(path.join(ROOT, rel));
  if (!content.includes('function isPreviewDummySummary(value)')) {
    throw new Error(`${rel} did not receive the guarded preview parser.`);
  }
  if (/var\s+summary\s*=\s*metaDescription\s*\?/.test(content)) {
    throw new Error(`${rel} still prioritizes the first meta description.`);
  }
}

assertNoMaryMeta('index.xml');
assertNoMaryMeta('dist/blogger-template.publish.xml');
assertParser('src/js/gg-app.source.js');
assertParser('__gg/assets/js/gg-app.dev.js');

if (RUN_QA) {
  for (const rel of ['src/js/gg-app.source.js', '__gg/assets/js/gg-app.dev.js', 'dist/assets/js/gg-app.dev.js']) {
    if (!exists(rel)) continue;
    execSync(`node --check ${JSON.stringify(path.join(ROOT, rel))}`, { stdio: 'inherit' });
  }
}

console.log(`preview real-snippet fix complete (${changedCount} file(s) changed).`);
