(function () {
  'use strict';

  var DEFAULT_DISCOVERY_SRC = '/assets/store/store-discovery.js';
  var app = document.getElementById('store-app');
  var discoverySheet = document.getElementById('store-discovery-sheet');
  var discoveryStatus = document.getElementById('store-discovery-status');
  var currentScript = document.currentScript;
  var discoverySrc = (currentScript && currentScript.getAttribute('data-store-discovery-src')) || DEFAULT_DISCOVERY_SRC;
  var discoveryPromise = null;
  var discoveryFailed = false;

  document.documentElement.setAttribute('data-store-js', 'booting');

  function enhancedRuntimeReady() {
    return !!(window.StoreSurface && typeof window.StoreSurface.snapshot === 'function');
  }

  function setStoreJsState(value) {
    document.documentElement.setAttribute('data-store-js', value);
  }

  function isModifiedActivation(event) {
    return !!(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (typeof event.button === 'number' && event.button !== 0));
  }

  function setCoreState(value) {
    if (app) app.setAttribute('data-store-core-state', value);
  }

  function setSheetState(sheet, value) {
    if (!sheet) return;
    sheet.setAttribute('data-gg-state', value);
    sheet.setAttribute('data-gg-sheet-state', value);
  }

  function setDiscoveryStatus(message) {
    if (discoveryStatus && message) discoveryStatus.textContent = message;
  }

  function openDiscoveryFallback() {
    setCoreState('discovery-failed');
    setDiscoveryStatus('Discovery belum tersedia. Katalog statis tetap bisa dibaca.');
    if (!discoverySheet) return;
    discoverySheet.hidden = false;
    discoverySheet.removeAttribute('inert');
    discoverySheet.setAttribute('aria-hidden', 'false');
    setSheetState(discoverySheet, 'open');
    if (document.body) document.body.setAttribute('data-gg-panel-active', 'true');
  }

  function loadDiscoveryRuntime() {
    var script;
    if (enhancedRuntimeReady()) return Promise.resolve(window.StoreSurface);
    if (discoveryFailed) return Promise.reject(new Error('store-discovery-failed'));
    if (discoveryPromise) return discoveryPromise;

    setStoreJsState('loading');
    setCoreState('loading-discovery');
    discoveryPromise = new Promise(function (resolve, reject) {
      script = document.createElement('script');
      script.src = discoverySrc;
      script.defer = true;
      script.async = true;
      script.setAttribute('data-store-discovery-runtime', 'true');
      script.onload = function () {
        setCoreState('ready');
        setStoreJsState(enhancedRuntimeReady() ? 'ready' : 'core-ready');
        resolve(window.StoreSurface || null);
      };
      script.onerror = function () {
        discoveryFailed = true;
        discoveryPromise = null;
        reject(new Error('store-discovery-load-error'));
      };
      (document.head || document.documentElement).appendChild(script);
    });

    return discoveryPromise;
  }

  function replayClick(target, fallbackHref) {
    loadDiscoveryRuntime().then(function () {
      window.setTimeout(function () {
        if (target && typeof target.click === 'function') target.click();
      }, 0);
    }).catch(function () {
      if (fallbackHref) window.location.assign(fallbackHref);
      else openDiscoveryFallback();
    });
  }

  function lazyTriggerFromEvent(event) {
    var target = event.target;
    var trigger;
    if (!target || !target.closest) return null;
    trigger = target.closest(
      '#store-dock-discover, #store-saved-open, #store-more-open, #store-loadmore, ' +
      '[data-store-open-preview], [data-store-open-slug], [data-store-filter], ' +
      '[data-store-intent], [data-store-price-band], [data-store-sort], ' +
      '[data-store-semantic-category], [data-store-semantic-more]'
    );
    return trigger;
  }

  document.addEventListener('click', function (event) {
    var trigger;
    var href;
    if (enhancedRuntimeReady()) return;
    trigger = lazyTriggerFromEvent(event);
    if (!trigger) return;
    if (isModifiedActivation(event)) return;

    href = trigger.getAttribute && trigger.getAttribute('href');
    event.preventDefault();
    event.stopPropagation();
    replayClick(trigger, href);
  }, true);

  document.addEventListener('keydown', function (event) {
    var key = String(event.key || '').toLowerCase();
    if (enhancedRuntimeReady()) return;
    if ((event.metaKey || event.ctrlKey) && key === 'k') {
      event.preventDefault();
      loadDiscoveryRuntime().then(function (surface) {
        if (surface && typeof surface.openDiscovery === 'function') surface.openDiscovery();
      }).catch(openDiscoveryFallback);
    } else if (key === '/' && !/^(input|textarea|select)$/i.test((event.target && event.target.tagName) || '')) {
      event.preventDefault();
      loadDiscoveryRuntime().then(function (surface) {
        if (surface && typeof surface.openDiscovery === 'function') surface.openDiscovery();
      }).catch(openDiscoveryFallback);
    }
  });

  if (/[?&]item=|#item-/.test(window.location.search + window.location.hash)) {
    loadDiscoveryRuntime().catch(function () {});
  }

  setCoreState('ready');
  setStoreJsState('core-ready');
}());
