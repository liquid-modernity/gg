export function getNetworkState(navigatorLike) {
  return navigatorLike && navigatorLike.onLine === false ? 'offline' : 'online';
}

export function isNetworkUnavailable(navigatorLike) {
  return getNetworkState(navigatorLike) === 'offline';
}

export function getFallbackPosts(posts, limit) {
  var items = Array.isArray(posts) ? posts : [];
  var max = typeof limit === 'number' ? limit : 3;

  return items.filter(function (post) {
    return !!(post && post.href && post.title);
  }).slice(0, max);
}

export function getFallbackUiState(posts, currentState) {
  var items = Array.isArray(posts) ? posts : [];

  if (items.length) return 'success';
  if (currentState === 'loading') return 'loading';
  if (currentState === 'failure') return 'failure';
  return 'idle';
}

export function getFallbackLoadState(posts) {
  return Array.isArray(posts) && posts.length ? 'success' : 'failure';
}

export function getFeedbackStatusPayload(fallbackState, copyKeys = {}) {
  if (fallbackState === 'loading') {
    return {
      visible: true,
      copyKey: copyKeys.loading || ''
    };
  }

  if (fallbackState === 'failure') {
    return {
      visible: true,
      copyKey: copyKeys.failure || ''
    };
  }

  return {
    visible: false,
    copyKey: ''
  };
}

export function getSearchEmptyStatusPayload(config = {}) {
  return {
    active: !!config.active,
    query: config.query || '',
    resultCount: config.resultCount || 0,
    fallbackState: config.fallbackState || 'idle',
    fallbackCount: config.fallbackCount || 0,
    timeoutMs: config.timeoutMs || 0
  };
}

export function getErrorStatusPayload(config = {}) {
  return {
    active: !!config.active,
    fallbackState: config.fallbackState || 'idle',
    fallbackCount: config.fallbackCount || 0,
    timeoutMs: config.timeoutMs || 0
  };
}

export function safeErrorMessage(error, fallback) {
  return error && error.message ? String(error.message) : (fallback || 'fallback-failed');
}

(function attachOfflineFallbackBridge(global) {
  if (!global) return;

  var GG = global.GG = global.GG || {};
  GG.offlineFallbackBridge = GG.offlineFallbackBridge || {};
  GG.offlineFallbackBridge.getNetworkState = getNetworkState;
  GG.offlineFallbackBridge.isNetworkUnavailable = isNetworkUnavailable;
  GG.offlineFallbackBridge.getFallbackPosts = getFallbackPosts;
  GG.offlineFallbackBridge.getFallbackUiState = getFallbackUiState;
  GG.offlineFallbackBridge.getFallbackLoadState = getFallbackLoadState;
  GG.offlineFallbackBridge.getFeedbackStatusPayload = getFeedbackStatusPayload;
  GG.offlineFallbackBridge.getSearchEmptyStatusPayload = getSearchEmptyStatusPayload;
  GG.offlineFallbackBridge.getErrorStatusPayload = getErrorStatusPayload;
  GG.offlineFallbackBridge.safeErrorMessage = safeErrorMessage;
})(typeof window !== 'undefined' ? window : globalThis);
