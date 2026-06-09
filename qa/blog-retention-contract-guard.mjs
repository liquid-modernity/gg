#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const files = {
  packageJson: 'package.json',
  index: 'index.xml',
  appJs: 'src/js/gg-app.source.js',
  appCss: 'src/css/gg-app.source.css',
  detailCss: 'src/css/modules/detail.css',
  en: 'registry/copy/gg-copy-en.json',
  id: 'registry/copy/gg-copy-id.json'
};

const text = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, readFileSync(file, 'utf8')]));
const failures = [];

function fail(message) {
  failures.push(message);
}

function requireIncludes(source, needle, message) {
  if (!source.includes(needle)) fail(message);
}

function requirePattern(source, pattern, message) {
  if (!pattern.test(source)) fail(message);
}

function openingTagByClass(source, className) {
  const tags = source.match(/<[^>]+>/g) || [];
  return tags.find((tag) => new RegExp(`\\bclass=(['"])[^'"]*\\b${className}\\b[^'"]*\\1`, 'i').test(tag)) || '';
}

function openingTagById(source, id) {
  const tags = source.match(/<[^>]+>/g) || [];
  return tags.find((tag) => new RegExp(`\\bid=(['"])${id}\\1`, 'i').test(tag)) || '';
}

function hasAttrValue(tag, attr, value) {
  const escapedAttr = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escapedAttr}=(['"])${escapedValue}\\1`, 'i').test(tag);
}

function readJson(source, label) {
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`${label}: invalid JSON`);
    return {};
  }
}

const en = readJson(text.en, 'EN copy');
const id = readJson(text.id, 'ID copy');

[
  ['related.title', 'Related posts', 'Posting terkait'],
  ['related.empty', 'No related posts yet.', 'Belum ada posting terkait.'],
  ['saved.action.save', 'Save', 'Simpan'],
  ['saved.action.saved', 'Saved', 'Tersimpan'],
  ['saved.action.saveArticle', 'Save article', 'Simpan artikel'],
  ['saved.action.savedArticle', 'Saved article', 'Artikel tersimpan'],
  ['saved.empty.title', 'No saved articles yet.', 'Belum ada artikel tersimpan.'],
  ['saved.empty.body', 'Save articles from previews or article pages to find them here.', 'Simpan artikel dari pratinjau atau halaman artikel untuk menemukannya di sini.'],
  ['saved.empty.unavailable', 'Saved articles are unavailable on this browser.', 'Artikel tersimpan tidak tersedia di browser ini.']
].forEach(([key, enValue, idValue]) => {
  if (en[key] !== enValue) fail(`EN copy missing ${key}`);
  if (id[key] !== idValue) fail(`ID copy missing ${key}`);
});

const previewSaveTag = openingTagByClass(text.index, 'gg-preview__save');
const articleSaveTag = openingTagByClass(text.index, 'gg-article-save');
const relatedTag = openingTagById(text.index, 'gg-related-posts');

if (!previewSaveTag || !hasAttrValue(previewSaveTag, 'data-gg-save-article', 'true') || !hasAttrValue(previewSaveTag, 'aria-pressed', 'false') || !hasAttrValue(previewSaveTag, 'type', 'button')) {
  fail('index.xml: preview save button contract missing');
}

if (!articleSaveTag || !hasAttrValue(articleSaveTag, 'data-gg-save-article', 'true') || !hasAttrValue(articleSaveTag, 'aria-pressed', 'false') || !hasAttrValue(articleSaveTag, 'type', 'button')) {
  fail('index.xml: detail article save button contract missing');
}

if (!relatedTag || !hasAttrValue(relatedTag, 'data-gg-module', 'related-posts') || !hasAttrValue(relatedTag, 'aria-labelledby', 'gg-related-posts-title')) {
  fail('index.xml: related posts section contract missing');
}

requireIncludes(text.index, 'id=\'gg-related-posts-title\'', 'index.xml: related posts heading id missing');
requireIncludes(text.index, 'id=\'gg-related-posts-list\' role=\'list\'', 'index.xml: related posts list role missing');

requireIncludes(text.appJs, "savedStorageKey: 'gg:saved:v1'", 'app JS: saved localStorage key contract missing');
requireIncludes(text.appJs, 'function safeReadSavedArticles', 'app JS: guarded saved reader missing');
requireIncludes(text.appJs, 'function safeWriteSavedArticles', 'app JS: guarded saved writer missing');
requirePattern(text.appJs, /function safeReadSavedArticles[\s\S]*?try \{[\s\S]*?localStorage[\s\S]*?\} catch/i, 'app JS: saved reader must guard localStorage with try/catch');
requirePattern(text.appJs, /function safeWriteSavedArticles[\s\S]*?try \{[\s\S]*?localStorage[\s\S]*?\} catch/i, 'app JS: saved writer must guard localStorage with try/catch');
requireIncludes(text.appJs, 'function toggleSaveArticle', 'app JS: save toggle missing');
requireIncludes(text.appJs, 'function syncSavedListingFromHash', 'app JS: #saved listing behavior missing');
requireIncludes(text.appJs, "savedRouteHash: '#saved'", 'app JS: #saved route contract missing');
requireIncludes(text.appJs, 'savedArticlesAdapter', 'app JS: saved discovery adapter missing');
requireIncludes(text.appJs, "active === 'saved'", 'app JS: discovery saved filter missing');
requireIncludes(text.appJs, 'item.saved === true', 'app JS: discovery saved filter must use saved flag');

requireIncludes(text.appJs, 'function buildRelatedPosts', 'app JS: related posts builder missing');
requireIncludes(text.appJs, 'function scoreRelatedPost', 'app JS: related scoring missing');
requireIncludes(text.appJs, 'requestCommandFeedEnhancement(true)', 'app JS: related posts must use feed enhancement fallback');
requireIncludes(text.appJs, 'isStoreContent(candidate)', 'app JS: related posts must exclude Store/Yellow Cart content');
requireIncludes(text.appJs, 'relatedMin: 3', 'app JS: related min contract missing');
requireIncludes(text.appJs, 'relatedMax: 6', 'app JS: related max contract missing');
requireIncludes(text.appJs, 'data-gg-related-source', 'app JS: related source attribute update missing');
requireIncludes(text.appJs, 'gg-related-posts__item', 'app JS: related item class missing');

requireIncludes(text.appCss, '.gg-preview__save', 'app CSS: preview save style missing');
requireIncludes(text.appCss, '.gg-related-posts', 'app CSS: related posts style missing');
requireIncludes(text.appCss, '.gg-saved-listing-empty', 'app CSS: saved empty style missing');
requireIncludes(text.detailCss, '.gg-related-posts', 'detail CSS: related posts source style missing');

requireIncludes(text.packageJson, '"gaga:verify-blog-retention"', 'package.json: blog retention guard script missing');
requireIncludes(text.packageJson, 'qa/blog-retention-contract-guard.mjs', 'package.json: blog retention guard path missing');
requireIncludes(text.packageJson, 'npm run gaga:verify-blog-retention', 'package.json: ci:qa must include blog retention guard');

if (failures.length) {
  console.error('BLOG RETENTION CONTRACT GUARD CONTRACT_FAILURE');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('BLOG RETENTION CONTRACT GUARD PASS');
