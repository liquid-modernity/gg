export function normalizeArticleUrl(url, options = {}) {
  var raw = url || '';
  var baseHref = options.baseHref || (typeof window !== 'undefined' && window.location ? window.location.href : '');
  var resolved;

  if (!raw) return '';

  try {
    resolved = new URL(raw, baseHref).href;
  } catch (error) {
    resolved = String(raw || '');
  }

  return resolved.replace(/#.*$/, '').replace(/\/$/, '');
}

export function sanitizeSavedArticle(item, options = {}) {
  var source = item || {};
  var stripText = typeof options.stripText === 'function' ? options.stripText : function (value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  };
  var now = options.now || (new Date()).toISOString();
  var url = normalizeArticleUrl(source.url || source.href || '', options);
  var title = stripText(source.title || '');

  if (!url || !title) return null;

  return {
    title: title,
    url: url,
    summary: stripText(source.summary || '').slice(0, 280),
    date: source.date || source.published || '',
    source: source.source || 'rootSource',
    surface: source.surface || 'blog',
    savedAt: source.savedAt || now
  };
}

export function parseSavedArticles(raw, options = {}) {
  var parsed;
  var items = [];
  var i;
  var item;

  if (!raw) return [];

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  for (i = 0; i < parsed.length; i += 1) {
    item = sanitizeSavedArticle(parsed[i], options);
    if (item) items.push(item);
  }

  return items;
}

export function stringifySavedArticles(items) {
  return JSON.stringify(Array.isArray(items) ? items : []);
}

export function readSavedArticles(storageHost, key, options = {}) {
  var raw;

  try {
    raw = storageHost && storageHost.localStorage ? storageHost.localStorage.getItem(key) : null;
    return {
      available: true,
      items: parseSavedArticles(raw, options)
    };
  } catch (error) {
    return {
      available: false,
      items: []
    };
  }
}

export function writeSavedArticles(storageHost, key, items) {
  try {
    if (!storageHost || !storageHost.localStorage) throw new Error('localStorage_unavailable');
    storageHost.localStorage.setItem(key, stringifySavedArticles(items));
    return true;
  } catch (error) {
    return false;
  }
}

export function isArticleSaved(items, url, options = {}) {
  var key = normalizeArticleUrl(url, options);
  var list = Array.isArray(items) ? items : [];
  var i;

  if (!key) return false;
  for (i = 0; i < list.length; i += 1) {
    if (normalizeArticleUrl(list[i].url, options) === key) return true;
  }
  return false;
}

export function toggleSavedArticle(items, payload, options = {}) {
  var list = Array.isArray(items) ? items : [];
  var key = payload ? normalizeArticleUrl(payload.url, options) : '';
  var next = [];
  var removed = false;
  var i;
  var item;

  if (!payload || !key) {
    return {
      items: list.slice(),
      removed: false,
      changed: false
    };
  }

  for (i = 0; i < list.length; i += 1) {
    if (normalizeArticleUrl(list[i].url, options) === key) {
      removed = true;
      continue;
    }
    next.push(list[i]);
  }

  if (!removed) {
    item = Object.assign({}, payload, {
      savedAt: options.now || (new Date()).toISOString()
    });
    next.unshift(item);
  }

  return {
    items: next,
    removed: removed,
    changed: true
  };
}

(function attachSavedListingBridge(global) {
  if (!global) return;

  var GG = global.GG = global.GG || {};
  GG.savedListingBridge = GG.savedListingBridge || {};
  GG.savedListingBridge.normalizeArticleUrl = normalizeArticleUrl;
  GG.savedListingBridge.sanitizeSavedArticle = sanitizeSavedArticle;
  GG.savedListingBridge.parseSavedArticles = parseSavedArticles;
  GG.savedListingBridge.stringifySavedArticles = stringifySavedArticles;
  GG.savedListingBridge.readSavedArticles = readSavedArticles;
  GG.savedListingBridge.writeSavedArticles = writeSavedArticles;
  GG.savedListingBridge.isArticleSaved = isArticleSaved;
  GG.savedListingBridge.toggleSavedArticle = toggleSavedArticle;
})(typeof window !== 'undefined' ? window : globalThis);
