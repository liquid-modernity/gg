var POPULAR_RANGE_LABELS = {
  ALL_TIME: 'All time',
  LAST_YEAR: 'Last year',
  LAST_MONTH: 'Last 30 days',
  LAST_WEEK: 'Last 7 days'
};

export function normalizePopularRange(range, options = {}) {
  var fallback = options.fallback || 'ALL_TIME';
  var ranges = Array.isArray(options.ranges) && options.ranges.length ? options.ranges : Object.keys(POPULAR_RANGE_LABELS);
  var value = String(range || '').trim();
  return ranges.indexOf(value) === -1 ? fallback : value;
}

export function getPopularRangeFromHash(hash, options = {}) {
  var routeHash = options.routeHash || '#popularpost';
  var raw = String(hash || '');
  var range = '';

  if (raw.indexOf(routeHash) !== 0) return '';
  range = raw.split(':')[1] || options.fallback || 'ALL_TIME';
  return normalizePopularRange(range, options);
}

export function getPopularRangeHref(range, options = {}) {
  var routeHash = options.routeHash || '#popularpost';
  return routeHash + ':' + normalizePopularRange(range, options);
}

export function getPopularRangeLabel(range, options = {}) {
  var labels = options.labels || POPULAR_RANGE_LABELS;
  var key = normalizePopularRange(range, options);
  return labels[key] || key;
}

export function getRelatedDateScore(value, options = {}) {
  var time = Date.parse(value || '');
  var now = typeof options.now === 'number' ? options.now : Date.now();
  if (isNaN(time)) return 0;
  return Math.max(0, Math.min(6, Math.round((time - now + (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 60))));
}

export function normalizeRelatedPost(post, options = {}) {
  var source = post || {};
  var stripText = typeof options.stripText === 'function' ? options.stripText : function (value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  };
  var sanitizeTopics = typeof options.sanitizeTopics === 'function' ? options.sanitizeTopics : function (items) {
    return Array.isArray(items) ? items : [];
  };

  return {
    title: stripText(source.title || ''),
    href: source.href || '',
    summary: stripText(source.summary || ''),
    labelTexts: sanitizeTopics(source.labelTexts || []),
    image: source.image || source.thumbnail || '',
    date: source.date || source.published || '',
    score: typeof options.score === 'number' ? options.score : 0
  };
}

export function getRelatedPageState(items, currentPage, visibleMax) {
  var list = Array.isArray(items) ? items : [];
  var size = Math.max(1, parseInt(visibleMax, 10) || 1);
  var pageCount = Math.max(1, Math.ceil(list.length / size));
  var page = Math.min(Math.max(0, parseInt(currentPage, 10) || 0), pageCount - 1);
  var start = page * size;
  var end = start + size;

  return {
    page: page,
    pageCount: pageCount,
    visible: list.slice(start, end),
    hasPagination: list.length > size
  };
}

export function getRelatedDotState(index, currentPage) {
  var page = Math.max(0, parseInt(index, 10) || 0);
  var active = page === (Math.max(0, parseInt(currentPage, 10) || 0));

  return {
    page: page,
    pageAttribute: String(page),
    label: 'Related posts group ' + String(page + 1),
    current: active
  };
}

(function attachPopularRelatedBridge(global) {
  if (!global) return;

  var GG = global.GG = global.GG || {};
  GG.popularRelatedBridge = GG.popularRelatedBridge || {};
  GG.popularRelatedBridge.normalizePopularRange = normalizePopularRange;
  GG.popularRelatedBridge.getPopularRangeFromHash = getPopularRangeFromHash;
  GG.popularRelatedBridge.getPopularRangeHref = getPopularRangeHref;
  GG.popularRelatedBridge.getPopularRangeLabel = getPopularRangeLabel;
  GG.popularRelatedBridge.getRelatedDateScore = getRelatedDateScore;
  GG.popularRelatedBridge.normalizeRelatedPost = normalizeRelatedPost;
  GG.popularRelatedBridge.getRelatedPageState = getRelatedPageState;
  GG.popularRelatedBridge.getRelatedDotState = getRelatedDotState;
})(typeof window !== 'undefined' ? window : globalThis);
