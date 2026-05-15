#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const REQUIRED = {
  en: {
    'comments.title': 'Comments',
    'comments.dismiss': 'Dismiss comments panel',
    'comments.action.add': 'Add comment',
    'comments.action.addReply': 'Add a reply',
    'comments.action.reply': 'Reply',
    'comments.action.replyToOriginal': 'Reply to original comment',
    'comments.action.copyLink': 'Copy link',
    'comments.action.delete': 'Delete comment',
    'comments.action.more': 'More comment actions',
    'comments.action.cancelReply': 'Cancel reply',
    'comments.replyingTo': 'Replying to',
    'comments.originalComment': 'Original comment',
    'comments.replies.title': 'Replies',
    'comments.replies.view.one': 'View 1 reply',
    'comments.replies.view.many': 'View {count} replies',
    'comments.replies.count.one': '1 reply',
    'comments.replies.count.many': '{count} replies',
    'comments.loadMore': 'Load more comments',
    'comments.loadMoreReplies': 'Load more replies',
    'comments.empty.title': 'No comments yet',
    'comments.empty.body': 'Be the first to add one.',
    'comments.toolbar.add': 'Add comment',
    'comments.toolbar.disabled': 'Comments disabled',
    'comments.toolbar.count.one': '1 comment',
    'comments.toolbar.count.many': '{count} comments',
    'comments.status.copying': 'Copying comment link...',
    'comments.status.copied': 'Comment link copied',
    'comments.status.failed': 'Comment action failed'
  },
  id: {
    'comments.title': 'Komentar',
    'comments.dismiss': 'Tutup panel komentar',
    'comments.action.add': 'Tambah komentar',
    'comments.action.addReply': 'Tambah balasan',
    'comments.action.reply': 'Balas',
    'comments.action.replyToOriginal': 'Balas komentar awal',
    'comments.action.copyLink': 'Salin tautan',
    'comments.action.delete': 'Hapus komentar',
    'comments.action.more': 'Aksi komentar lainnya',
    'comments.action.cancelReply': 'Batalkan balasan',
    'comments.replyingTo': 'Membalas',
    'comments.originalComment': 'Komentar awal',
    'comments.replies.title': 'Balasan',
    'comments.replies.view.one': 'Lihat 1 balasan',
    'comments.replies.view.many': 'Lihat {count} balasan',
    'comments.replies.count.one': '1 balasan',
    'comments.replies.count.many': '{count} balasan',
    'comments.loadMore': 'Muat komentar lainnya',
    'comments.loadMoreReplies': 'Muat balasan lainnya',
    'comments.empty.title': 'Belum ada komentar',
    'comments.empty.body': 'Jadilah yang pertama berkomentar.',
    'comments.toolbar.add': 'Tambah komentar',
    'comments.toolbar.disabled': 'Komentar dinonaktifkan',
    'comments.toolbar.count.one': '1 komentar',
    'comments.toolbar.count.many': '{count} komentar',
    'comments.status.copying': 'Menyalin tautan komentar...',
    'comments.status.copied': 'Tautan komentar disalin',
    'comments.status.failed': 'Aksi komentar gagal'
  }
};

const LEGACY_KEYS = [
  'comments.toolbar.width.sidebar',
  'comments.toolbar.width.wide',
  'comments.toolbar.sort.newest',
  'comments.toolbar.sort.oldest',
  'comments.toolbar.sort.toggleToNewest',
  'comments.toolbar.sort.toggleToOldest'
];

const FORBIDDEN_SOURCE_LITERALS = [
  'Original comment',
  'Add a reply',
  'Add a reply to original comment',
  'Cancel reply',
  'Comments disabled',
  'Add comment',
  'Copy link',
  'Delete comment',
  'More comment actions',
  'Replying to ',
  'Comment link copied',
  'Delete unavailable'
];

const SOURCE_FILES = [
  'src/js/gg-app.source.js',
  'src/js/modules/controllers/panel-controller.fragment.js',
  'src/js/modules/controllers/listing-growth.fragment.js',
  'src/js/modules/core/events.fragment.js',
  'src/js/modules/core/state-dom.fragment.js',
  'template/partials/19-big-app-script-wrapper-original.xml'
];

function read(file) {
  return readFileSync(path.join(ROOT, file), 'utf8');
}

function decodeEntities(input) {
  return String(input || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseWrappedCopy(file, locale, issues) {
  const text = read(file);
  const expectedId = `gg-copy-${locale}`;
  if (!new RegExp(`<script\\b[^>]*id=['"]${expectedId}['"]`, 'i').test(text)) {
    issues.push(`${file} must use script id='${expectedId}'`);
  }
  const match = text.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) {
    issues.push(`${file} is missing script wrapper`);
    return {};
  }
  return JSON.parse(decodeEntities(match[1]).trim());
}

function parseRegistry(file) {
  return JSON.parse(read(file));
}

function assertRequired(label, copy, locale, issues) {
  for (const [key, expected] of Object.entries(REQUIRED[locale])) {
    if (!(key in copy)) {
      issues.push(`${label} missing ${key}`);
    } else if (copy[key] !== expected) {
      issues.push(`${label} ${key} expected ${JSON.stringify(expected)} got ${JSON.stringify(copy[key])}`);
    }
  }
  for (const key of LEGACY_KEYS) {
    if (key in copy) issues.push(`${label} still contains deprecated ${key}`);
  }
}

function assertLanguage(label, copy, locale, issues) {
  if (locale === 'en') {
    if (copy['global.cancel'] !== 'Cancel' || copy['lang.current'] !== 'English') {
      issues.push(`${label} does not read as English`);
    }
  } else if (copy['global.cancel'] !== 'Batal' || copy['lang.current'] !== 'Bahasa Indonesia') {
    issues.push(`${label} does not read as Indonesian`);
  }
}

function stripCopyObject(text) {
  return text.replace(/var COPY = \{[\s\S]*?\n\s*var startupState = /, 'var startupState = ');
}

function assertNoHardcodedSourceStrings(issues) {
  for (const file of SOURCE_FILES) {
    let text = stripCopyObject(read(file));
    for (const literal of FORBIDDEN_SOURCE_LITERALS) {
      if (text.includes(literal)) issues.push(`${file} contains hardcoded comment UI literal ${JSON.stringify(literal)}`);
    }
  }
}

function main() {
  const issues = [];
  const rootEn = parseWrappedCopy('gg-copy-en.json', 'en', issues);
  const rootId = parseWrappedCopy('gg-copy-id.json', 'id', issues);
  const regEn = parseRegistry('registry/copy/gg-copy-en.json');
  const regId = parseRegistry('registry/copy/gg-copy-id.json');

  assertLanguage('root EN', rootEn, 'en', issues);
  assertLanguage('root ID', rootId, 'id', issues);
  assertLanguage('registry EN', regEn, 'en', issues);
  assertLanguage('registry ID', regId, 'id', issues);

  assertRequired('root EN', rootEn, 'en', issues);
  assertRequired('root ID', rootId, 'id', issues);
  assertRequired('registry EN', regEn, 'en', issues);
  assertRequired('registry ID', regId, 'id', issues);
  assertNoHardcodedSourceStrings(issues);

  if (issues.length) {
    console.error('COPY REGISTRY GUARD RESULT: FAIL');
    issues.forEach((issue, index) => console.error(`${index + 1}. ${issue}`));
    process.exit(1);
  }

  console.log('COPY REGISTRY GUARD RESULT: PASS');
}

main();
