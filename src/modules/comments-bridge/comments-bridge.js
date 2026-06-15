export function stripParentIdFromCommentSrc(src, options = {}) {
  var raw = String(src || '');
  var hash = '';
  var hashIndex;
  var cleaned;
  var baseHref = options.baseHref || (typeof window !== 'undefined' && window.location ? window.location.href : '');

  if (!raw) return raw;

  try {
    var url = new URL(raw, baseHref);
    url.searchParams.forEach(function (value, key) {
      if (String(key).toLowerCase() === 'parentid') url.searchParams.delete(key);
    });
    return url.toString();
  } catch (error) {
    var queryIndex;
    var basePath;
    var query;
    hashIndex = raw.indexOf('#');
    if (hashIndex >= 0) {
      hash = raw.slice(hashIndex);
      raw = raw.slice(0, hashIndex);
    }
    queryIndex = raw.indexOf('?');
    if (queryIndex < 0) return raw + hash;
    basePath = raw.slice(0, queryIndex);
    query = raw.slice(queryIndex + 1).split('&').filter(function (part) {
      return part && !/^parentID=/i.test(part);
    }).join('&');
    cleaned = basePath + (query ? '?' + query : '');
    return cleaned + hash;
  }
}

export function commentSrcHasParentId(src, options = {}) {
  var raw = String(src || '');
  var baseHref = options.baseHref || (typeof window !== 'undefined' && window.location ? window.location.href : '');

  if (!raw) return false;

  try {
    var url = new URL(raw, baseHref);
    var hasParentId = false;
    url.searchParams.forEach(function (value, key) {
      if (String(key).toLowerCase() === 'parentid') hasParentId = true;
    });
    return hasParentId;
  } catch (error) {
    return /[?&]parentID=/i.test(raw);
  }
}

export function withCommentParentId(src, parentId, options = {}) {
  var raw = String(src || '');
  var hash = '';
  var hashIndex;
  var separator;
  var baseHref = options.baseHref || (typeof window !== 'undefined' && window.location ? window.location.href : '');

  if (!raw || !parentId) return raw;

  try {
    var url = new URL(raw, baseHref);
    url.searchParams.set('parentID', parentId);
    return url.toString();
  } catch (error) {
    hashIndex = raw.indexOf('#');
    if (hashIndex >= 0) {
      hash = raw.slice(hashIndex);
      raw = raw.slice(0, hashIndex);
    }
    raw = stripParentIdFromCommentSrc(raw, options);
    separator = raw.indexOf('?') >= 0 ? '&' : '?';
    return raw + separator + 'parentID=' + encodeURIComponent(parentId) + hash;
  }
}

export function normalizeReplyHandle(author) {
  var clean = String(author || '').replace(/^@+/, '').replace(/\s+/g, '').replace(/[^\w.\-]/g, '');
  return clean ? '@' + clean : '';
}

export function normalizeHashId(value) {
  var raw = String(value || '').replace(/^#/, '');
  try {
    return decodeURIComponent(raw);
  } catch (error) {
    return raw;
  }
}

export function isCommentsHash(value, options = {}) {
  var fallbackHash = options.hash || (typeof window !== 'undefined' && window.location ? window.location.hash : '');
  var hash = String(value || fallbackHash || '');
  var id = normalizeHashId(hash);
  return id === 'comments' || id === 'comment-form' || /^c\d+/.test(id);
}

export function getCommentPermalink(id, baseUrl, options = {}) {
  var baseHref = options.baseHref || (typeof window !== 'undefined' && window.location ? window.location.href : '');
  var url;

  if (!id) return '';

  url = baseUrl || baseHref;
  try {
    url = new URL(url, baseHref).href;
  } catch (error) {
    url = baseHref;
  }

  return url.replace(/#.*$/, '') + '#' + id;
}

(function attachCommentsBridge(global) {
  if (!global) return;

  var GG = global.GG = global.GG || {};
  GG.commentsBridge = GG.commentsBridge || {};
  GG.commentsBridge.stripParentIdFromCommentSrc = stripParentIdFromCommentSrc;
  GG.commentsBridge.commentSrcHasParentId = commentSrcHasParentId;
  GG.commentsBridge.withCommentParentId = withCommentParentId;
  GG.commentsBridge.normalizeReplyHandle = normalizeReplyHandle;
  GG.commentsBridge.normalizeHashId = normalizeHashId;
  GG.commentsBridge.isCommentsHash = isCommentsHash;
  GG.commentsBridge.getCommentPermalink = getCommentPermalink;
})(typeof window !== 'undefined' ? window : globalThis);
