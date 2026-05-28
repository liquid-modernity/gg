#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootArgIndex = process.argv.indexOf('--root');
const ROOT = path.resolve(rootArgIndex >= 0 ? (process.argv[rootArgIndex + 1] || process.cwd()) : process.cwd());
const RUN_QA = process.argv.includes('--run-qa');

function filePath(rel) { return path.join(ROOT, rel); }
function exists(rel) { return fs.existsSync(filePath(rel)); }
function read(rel) { return fs.readFileSync(filePath(rel), 'utf8'); }
function writeIfChanged(rel, next) {
  const file = filePath(rel);
  const prev = fs.readFileSync(file, 'utf8');
  if (prev === next) return false;
  fs.writeFileSync(file, next);
  return true;
}
function patchFile(rel, patcher) {
  if (!exists(rel)) return false;
  const next = patcher(read(rel), rel);
  const changed = writeIfChanged(rel, next);
  console.log(`${changed ? 'patched' : 'ok     '} ${rel}`);
  return changed;
}

const STATIC_META_DESCRIPTION = 'Pak RPP publishes practical articles, project notes, and curated resources for learning, work, and digital production.';
const META_DESCRIPTION_BLOCK = `    <b:if cond='data:view.description'>\n      <meta expr:content='data:view.description' name='description'/>\n    <b:else/>\n      <b:if cond='data:blog.metaDescription'>\n        <meta expr:content='data:blog.metaDescription' name='description'/>\n      <b:else/>\n        <meta content='${STATIC_META_DESCRIPTION}' name='description'/>\n      </b:if>\n    </b:if>`;

function stripDescriptionMeta(source) {
  return source
    // Remove old route-aware block from v16.
    .replace(/\n\s*<b:if\s+cond='data:view\.isPost'>\s*\n\s*<meta\s+expr:content='data:view\.description \?: data:post\.snippet\.escaped \?: data:blog\.metaDescription \?: data:blog\.title\.escaped'\s+name='description'\/>\s*\n\s*<b:else\/>\s*\n\s*<meta\s+expr:content='data:view\.description \?: data:blog\.metaDescription \?: data:blog\.title\.escaped'\s+name='description'\/>\s*\n\s*<\/b:if>/g, '')
    // Remove old/new single self-closing meta description tags, including the Mary sample and empty dynamic variants.
    .replace(/\n\s*<meta\b(?=[^>]*\bname=(['"])description\1)[^>]*\/>/gi, '')
    .replace(/\n\s*<meta\b(?=[^>]*\bname='description')[^>]*\/>/gi, '')
    .replace(/\n\s*<meta\b(?=[^>]*\bname="description")[^>]*\/>/gi, '')
    // Remove accidental Lighthouse sample if it was copied into title.
    .replace(/<title><data:blog\.title\/>\s*&#8226;\s*Mary&#39;s simple recipe for maple bacon donuts[\s\S]*?coming back for\.<\/title>/g, '<title><data:blog.title/></title>');
}

function patchHeadMetaDescription(source) {
  let next = stripDescriptionMeta(source);
  const canonical = /\n\s*<link\s+expr:href='data:view\.url\.canonical \?: data:post\.url\.canonical \?: data:blog\.homepageUrl'\s+rel='canonical'\/>/;
  if (canonical.test(next)) {
    next = next.replace(canonical, '\n' + META_DESCRIPTION_BLOCK + '$&');
    return next;
  }
  const include = "\n\n    <b:include data='blog' name='all-head-content'/>";
  if (next.includes(include)) {
    next = next.replace(include, '\n' + META_DESCRIPTION_BLOCK + include);
    return next;
  }
  throw new Error('Could not find a safe head insertion point for meta description.');
}

function patchListingAndArticleSummaryAttrs(source) {
  let next = source;

  // Listing rows need a summary payload; otherwise preview has nothing useful when fetched detail has no meta/body paragraph.
  next = next.replace(
    /(<article\s+class='gg-entry-row'(?:(?!>).)*?expr:data-gg-post-url='data:post\.url')(?![^>]*data-gg-post-summary)(\s*)>/gs,
    "$1 expr:data-gg-post-summary='data:post.snippet.escaped'$2>"
  );

  // Detail article also carries the same SSR payload for fetch-parsed previews.
  next = next.replace(
    /(<article\s+class='gg-article'(?:(?!>).)*?expr:data-gg-post-url='data:post\.url')(?![^>]*data-gg-post-summary)(\s*)>/gs,
    "$1 expr:data-gg-post-summary='data:post.snippet.escaped'$2>"
  );

  return next;
}

function patchXml(source) {
  let next = patchHeadMetaDescription(source);
  next = patchListingAndArticleSummaryAttrs(next);
  next = patchPreviewRuntime(next);
  return next;
}

const renderPreviewDataReplacement = `function renderPreviewData(payload, detail) {
          var metaItems;
          var summary;
          if (!ui.previewTitle) return;

          payload = payload || {};
          detail = detail || {};
          summary = detail.summary || payload.summary || getCopy('preview.noSummary');

          ui.previewTitle.textContent = detail.title || payload.title || getCopy('preview.titleFallback');
          ui.previewSummary.textContent = summary;
          metaItems = buildPreviewMetaItems(detail);
          syncPreviewMeta(metaItems);
          syncPreviewTaxonomy(detail.labels);

          if (detail.image) {
            ui.previewImage.src = detail.image;
            ui.previewImage.alt = detail.title || payload.title || '';
            ui.previewMedia.hidden = false;
          } else {
            ui.previewImage.removeAttribute('src');
            ui.previewMedia.hidden = true;
          }

          if (detail.headings && detail.headings.length) {
            ui.previewStatus.textContent = getCopy('preview.sectionMap');
            syncPreviewTocItems(detail.headings);
          } else {
            ui.previewStatus.textContent = getCopy('preview.noHeadings');
            syncPreviewTocItems([]);
          }
          window.requestAnimationFrame(function () { resetPreviewScroll('open-after-render'); });
        }

        `;

const parsePreviewHtmlReplacement = `function parsePreviewHtml(html, url) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var article = doc.querySelector('.gg-article');
          var body = doc.querySelector('.gg-post-body, .entry-content');
          var metaDescriptionNodes = doc.querySelectorAll('meta[name="description"]');
          var jsonLdNodes = doc.querySelectorAll('script[type="application/ld+json"]');
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

          function isPreviewGenericSiteSummary(value) {
            var clean = normalizePreviewSummary(value).toLowerCase();
            return clean === '${STATIC_META_DESCRIPTION.toLowerCase()}';
          }

          function cleanPreviewSummary(value, options) {
            var clean = normalizePreviewSummary(value);
            var allowGeneric = !!(options && options.allowGeneric);
            if (!clean || isPreviewDummySummary(clean)) return '';
            if (!allowGeneric && isPreviewGenericSiteSummary(clean)) return '';
            return clean;
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

          function descriptionFromBody() {
            var nodes;
            var candidate;
            var j;
            if (!body) return '';
            nodes = body.querySelectorAll('p, li, blockquote');
            for (j = 0; j < nodes.length; j += 1) {
              candidate = cleanPreviewSummary(nodes[j].textContent || nodes[j].innerHTML || '');
              if (candidate && candidate.length >= 36) return candidate.slice(0, 260);
            }
            candidate = cleanPreviewSummary(body.textContent || '');
            return candidate ? candidate.slice(0, 260) : '';
          }

          function descriptionFromMeta() {
            var candidate;
            var j;
            for (j = 0; j < metaDescriptionNodes.length; j += 1) {
              candidate = cleanPreviewSummary(metaDescriptionNodes[j].getAttribute('content') || '', { allowGeneric: false });
              if (candidate) return candidate;
            }
            return '';
          }

          articleSummary = article ? cleanPreviewSummary(article.getAttribute('data-gg-post-summary') || '') : '';
          summary = articleSummary || descriptionFromJsonLd() || descriptionFromBody() || descriptionFromMeta();

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

const getRowPayloadReplacement = `function getRowPayload(row) {
          if (!row) return null;
          return {
            url: row.getAttribute('data-gg-post-url') || '',
            title: row.getAttribute('data-gg-post-title') || '',
            summary: stripHtml(row.getAttribute('data-gg-post-summary') || '')
          };
        }

        `;

function replaceFunctionBlock(source, functionName, nextFunctionName, replacement) {
  const startNeedle = `function ${functionName}`;
  const endNeedle = `function ${nextFunctionName}`;
  const start = source.indexOf(startNeedle);
  if (start === -1) return source;
  const end = source.indexOf(endNeedle, start);
  if (end === -1) return source;
  return source.slice(0, start) + replacement + source.slice(end);
}

function patchPreviewRuntime(source) {
  let next = source;
  next = replaceFunctionBlock(next, 'renderPreviewData(payload, detail) {', 'parsePreviewHtml(html, url) {', renderPreviewDataReplacement);
  next = replaceFunctionBlock(next, 'parsePreviewHtml(html, url) {', 'loadPreviewDetail(payload) {', parsePreviewHtmlReplacement);
  next = replaceFunctionBlock(next, 'getRowPayload(row) {', 'parseCommentCount(value) {', getRowPayloadReplacement);

  // Fetch failure should still display the SSR listing summary instead of forcing "No summary".
  next = next.replace(
    /\.catch\(function \(\) \{\s*ui\.previewStatus\.textContent = getCopy\('preview\.fetchFailed'\);\s*ui\.previewSummary\.textContent = getCopy\('preview\.noSummary'\);/g,
    ".catch(function () {\n              ui.previewStatus.textContent = getCopy('preview.fetchFailed');\n              ui.previewSummary.textContent = (payload && payload.summary) || getCopy('preview.noSummary');"
  );

  return next;
}

const xmlFiles = [
  'index.xml',
  'dist/index.final.xml',
  'dist/index.final.production.xml',
  'dist/index.standalone.development.xml',
  'dist/index.extracted.development.xml',
  'dist/index.extracted.production.xml',
  'dist/blogger-template.publish.xml'
];

const jsFiles = [
  'src/js/gg-app.source.js',
  'src/js/modules/controllers/outline-preview.fragment.js',
  '__gg/assets/js/gg-app.dev.js',
  '__gg/assets/js/gg-app.min.js',
  'dist/assets/js/gg-app.dev.js',
  'dist/assets/js/gg-app.min.js'
];

let changedCount = 0;
for (const rel of xmlFiles) if (patchFile(rel, patchXml)) changedCount += 1;
for (const rel of jsFiles) if (patchFile(rel, patchPreviewRuntime)) changedCount += 1;

function assertXml(rel) {
  if (!exists(rel)) return;
  const content = read(rel);
  if (/Mary(&apos;|&#39;|')s simple recipe for maple bacon donuts/i.test(content)) {
    throw new Error(`${rel} still contains the Mary Lighthouse sample text.`);
  }
  const descriptionTags = content.match(/<meta\b(?=[^>]*\bname=(['"])description\1)[^>]*\/>/gi) || [];
  if (descriptionTags.length !== 3) {
    // One expr data:view.description, one expr blog metaDescription, one static fallback inside condition branches.
    throw new Error(`${rel} should contain exactly 3 conditional meta description leaves; found ${descriptionTags.length}.`);
  }
  if (!content.includes(STATIC_META_DESCRIPTION)) {
    throw new Error(`${rel} lacks a static non-empty Lighthouse-safe meta description fallback.`);
  }
  if (!/class='gg-entry-row'[^>]*data-gg-post-summary/s.test(content)) {
    throw new Error(`${rel} listing rows do not expose data-gg-post-summary.`);
  }
  if (content.includes('function parsePreviewHtml(html, url)') && !content.includes('function descriptionFromBody()')) {
    throw new Error(`${rel} inline preview parser was not updated.`);
  }
  if (/var\s+metaDescription\s*=\s*doc\.querySelector\('meta\[name="description"\]'\)/.test(content) || /var\s+summary\s*=\s*metaDescription\s*\?/.test(content)) {
    throw new Error(`${rel} still has the old first-meta-only preview parser.`);
  }
}

function assertJs(rel) {
  if (!exists(rel)) return;
  const content = read(rel);
  if (!content.includes('function descriptionFromBody()')) {
    throw new Error(`${rel} missing body-based preview summary extraction.`);
  }
  if (content.includes('function getRowPayload(row)') && !content.includes("summary: stripHtml(row.getAttribute('data-gg-post-summary') || '')")) {
    throw new Error(`${rel} getRowPayload does not carry SSR summary.`);
  }
  if (!content.includes("detail.summary || payload.summary || getCopy('preview.noSummary')")) {
    throw new Error(`${rel} renderPreviewData does not fall back to payload.summary.`);
  }
}

assertXml('index.xml');
assertXml('dist/blogger-template.publish.xml');
assertJs('src/js/gg-app.source.js');
assertJs('src/js/modules/controllers/outline-preview.fragment.js');
assertJs('__gg/assets/js/gg-app.dev.js');

if (RUN_QA) {
  for (const rel of jsFiles) {
    if (!exists(rel) || rel.includes('/modules/')) continue;
    execSync(`node --check ${JSON.stringify(filePath(rel))}`, { stdio: 'inherit' });
  }
}

console.log(`preview snippet + Lighthouse meta description v17 complete (${changedCount} file(s) changed).`);
