// public-softcode: vanilla runtime loader for public config
// Fetches /runtime/public-config.json and applies microcopy, theme tokens, nav labels.
// Fails silently with fallback preserved.

(function () {
  'use strict';

  const cfg = {
    url: '/runtime/public-config.json',
    cacheMs: 300_000,
    selectors: {
      microcopy: ['data-copy', 'data-gg-copy'],
      navLabel: ['data-nav-label', 'data-gg-nav-label'],
      surface: 'data-gg-surface'
    }
  };

  const state = { loaded: false, data: null, error: null };

  function resolveSurfaceId() {
    const meta = document.querySelector('meta[name="gg-surface"]');
    if (meta) return meta.getAttribute('content') || null;
    const el = document.querySelector('[' + cfg.selectors.surface + ']');
    if (el) return el.getAttribute(cfg.selectors.surface) || null;
    const entries = window.GG && window.GG.entries;
    if (entries) {
      for (const k of Object.keys(entries)) { if (entries[k] && entries[k].loaded) return k; }
    }
    // fallback: detect from path
    const p = window.location.pathname;
    if (p === '/' || p === '') return 'blog';
    if (p.startsWith('/store')) return 'store';
    if (p.startsWith('/landing')) return 'landing';
    return null;
  }

  function queryAll(attrArray) {
    // return all elements matching any of the attribute selectors
    var out = [];
    attrArray.forEach(function (attr) {
      var nodes = document.querySelectorAll('[' + attr + ']');
      for (var i = 0; i < nodes.length; i++) { out.push(nodes[i]); }
    });
    return out;
  }
  function getAttr(el, attrArray) {
    for (var i = 0; i < attrArray.length; i++) {
      var v = el.getAttribute(attrArray[i]);
      if (v) return v;
    }
    return null;
  }
  function applyMicrocopy(data) {
    if (!data || !data.microcopy) return;
    const lang = document.documentElement.lang || 'id';
    const mc = data.microcopy[lang] || data.microcopy.id || data.microcopy.en || data.microcopy;
    if (!mc) return;
    const els = queryAll(cfg.selectors.microcopy);
    els.forEach(function (el) {
      const key = getAttr(el, cfg.selectors.microcopy);
      if (!key) return;
      if (mc[key] !== undefined && mc[key] !== null) {
        el.textContent = mc[key];
      }
    });
  }

  function applyNavLabels(data) {
    if (!data || !data.navigation || !data.navigation.nav || !data.navigation.nav.publicPrimary) return;
    const navItems = data.navigation.nav.publicPrimary;
    const labelMap = {};
    navItems.forEach(function (item) {
      if (item.labelKey) labelMap[item.labelKey] = item.label;
    });
    const els = queryAll(cfg.selectors.navLabel);
    els.forEach(function (el) {
      const key = getAttr(el, cfg.selectors.navLabel);
      if (!key) return;
      if (labelMap[key] !== undefined && labelMap[key] !== null) {
        el.textContent = labelMap[key];
      }
    });
  }

  function applyThemeTokens(data) {
    if (!data || !data.themeTokens || !data.themeTokens.tokens) return;
    const tokens = data.themeTokens.tokens;
    const root = document.documentElement;
    try {
      if (tokens.color) {
        for (const k of Object.keys(tokens.color)) {
          root.style.setProperty('--gg-' + k, tokens.color[k]);
        }
      }
      if (tokens.radius) {
        for (const k of Object.keys(tokens.radius)) {
          root.style.setProperty('--gg-radius-' + k, tokens.radius[k]);
        }
      }
      if (tokens.space) {
        for (const k of Object.keys(tokens.space)) {
          root.style.setProperty('--gg-space-' + k, tokens.space[k]);
        }
      }
    } catch (e) { /* silent */ }
  }

  function applySeoMeta(data, surfaceId) {
    if (!data || !data.seo || !data.seo.seo) return;
    const seo = data.seo.seo;
    const surfaceSeo = seo[surfaceId];
    if (!surfaceSeo) return;
    // Only apply if no explicit override is present in HTML
    try {
      if (surfaceSeo.titleKey && data.microcopy) {
        const lang = document.documentElement.lang || 'id';
        const mc = data.microcopy[lang] || data.microcopy.id || data.microcopy.en || data.microcopy;
        if (mc && mc[surfaceSeo.titleKey]) {
          const existing = document.querySelector('title');
          if (existing && !existing.hasAttribute('data-seo-applied')) {
            existing.textContent = mc[surfaceSeo.titleKey];
            existing.setAttribute('data-seo-applied', '1');
          }
        }
      }
    } catch (e) { /* silent */ }
  }

  function apply(data) {
    if (!data) return;
    const surfaceId = resolveSurfaceId();
    try { applyMicrocopy(data); } catch (e) { /* silent */ }
    try { applyNavLabels(data); } catch (e) { /* silent */ }
    try { applyThemeTokens(data); } catch (e) { /* silent */ }
    try { if (surfaceId) applySeoMeta(data, surfaceId); } catch (e) { /* silent */ }
    window.GG = window.GG || {};
    window.GG.publicSoftcode = { ok: true, surface: surfaceId, loadedAt: Date.now() };
  }

  function fetchConfig() {
    return fetch(cfg.url, { cache: 'default', credentials: 'omit' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (json) {
        state.data = json;
        state.loaded = true;
        apply(json);
        return json;
      })
      .catch(function (err) {
        state.error = String(err);
        window.GG = window.GG || {};
        window.GG.publicSoftcode = { ok: false, error: state.error };
      });
  }

  // Auto-init when DOM is ready
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    fetchConfig();
  });

  // Also expose as callable for entry wiring
  window.GG = window.GG || {};
  window.GG.publicSoftcodeInit = function (surfaceId) {
    if (surfaceId) {
      // set surface early
      window.GG = window.GG || {};
      window.GG.entries = window.GG.entries || {};
      window.GG.entries[surfaceId] = { id: surfaceId, loaded: true };
    }
    if (state.loaded) {
      apply(state.data);
    }
  };

})();