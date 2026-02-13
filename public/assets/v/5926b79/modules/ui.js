(function(w, d){
  'use strict';
  var GG = w.GG = w.GG || {};
  GG.modules = GG.modules || {};
  GG.modules.ui = GG.modules.ui || {};

  function loadBucket(name){
    if (!GG.boot || typeof GG.boot.loadModule !== 'function') {
      return Promise.reject(new Error('loadModule-missing'));
    }
    return GG.boot.loadModule('ui.bucket.' + name + '.js');
  }

  function surfaceHint(){
    var body = d && d.body ? d.body : null;
    if (!body) return '';
    return (body.getAttribute('data-gg-surface') || (body.dataset && body.dataset.ggSurface) || '').toLowerCase();
  }

  function shouldLoadListing(){
    var surface = surfaceHint();
    if (surface === 'listing' || surface === 'feed') return true;
    if (surface === 'landing') return false;
    return !!d.querySelector('[data-gg-module="loadmore"], #postcards, .gg-labeltree, .gg-tags-page, .gg-tags-directory, #gg-sitemap, #gg-feed');
  }

  function shouldLoadPost(){
    return !!d.querySelector('main.gg-main[data-gg-surface="post"], main.gg-main[data-gg-surface="page"], .gg-post__content.post-body.entry-content, .post-body.entry-content');
  }

  function runPlan(){
    if (GG.app && typeof GG.app.runPlan === 'function') GG.app.runPlan();
  }

  GG.modules.ui.init = GG.modules.ui.init || function(){
    if (GG.modules.ui._init) return;
    GG.modules.ui._init = true;

    var corePromise = loadBucket('core').then(function(){
      if (GG.boot && typeof GG.boot.init === 'function') GG.boot.init();
      if (GG.app && typeof GG.app.init === 'function') GG.app.init();
    });

    function loadIf(name, cond){
      if (!cond) return Promise.resolve(false);
      return corePromise.then(function(){
        return loadBucket(name).then(function(){
          runPlan();
          return true;
        });
      });
    }

    loadIf('listing', shouldLoadListing());
    loadIf('post', shouldLoadPost());

    var searchSelector = '[data-gg-search],[data-gg-action="search"],.gg-dock__item--search,.gg-search-trigger,button[aria-label="Search"],a[aria-label="Search"]';

    function openSearch(){
      return corePromise.then(function(){
        return loadBucket('search').then(function(){
          if (GG.modules && GG.modules.search) {
            if (GG.modules.search.init) GG.modules.search.init();
            if (GG.modules.search.open) GG.modules.search.open();
          }
        });
      });
    }

    if (!GG.modules.ui._searchBound) {
      GG.modules.ui._searchBound = true;
      d.addEventListener('click', function(e){
        var target = e && e.target && e.target.closest ? e.target.closest(searchSelector) : null;
        if (!target) return;
        e.preventDefault();
        e.stopPropagation();
        openSearch();
      }, true);
      d.addEventListener('keydown', function(e){
        if (!e) return;
        var key = (e.key || '').toLowerCase();
        if ((e.ctrlKey || e.metaKey) && key === 'k') {
          e.preventDefault();
          openSearch();
        }
      });
    }

    if (w.__GG_PENDING_SEARCH) {
      w.__GG_PENDING_SEARCH = false;
      openSearch();
    }
  };
})(window, document);
