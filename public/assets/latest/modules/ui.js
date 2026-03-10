(function(w, d){
'use strict';
var GG = w.GG = w.GG || {};
var M = GG.modules = GG.modules || {};
var U = M.ui = M.ui || {};

function lb(name){
if (GG.boot && GG.boot.loadModule) return GG.boot.loadModule('ui.bucket.' + name + '.js');
return Promise.reject(new Error('loadModule-missing'));
}

function pageKind(){
var b = d.body;
if (!b) return '';
return ((b.getAttribute('data-gg-page') || (b.dataset && b.dataset.ggPage) || '') + '').toLowerCase();
}

function listingSurface(){
var p = pageKind();
if (p === 'listing') return true;
return !!d.querySelector('[data-gg-module="loadmore"],#postcards,.gg-labeltree,.gg-tags-page,.gg-tags-directory,#gg-sitemap,#gg-feed');
}

function postSurface(){
var p = pageKind();
if (p === 'post' || p === 'page') return true;
return !!d.querySelector('main.gg-main[data-gg-surface="post"],main.gg-main[data-gg-surface="page"],.gg-post__content.post-body.entry-content,.post-body.entry-content,#gg-postinfo');
}

function rehydrate(){
if (GG.app && GG.app.rehydrate) GG.app.rehydrate();
}

function focusDockSearch(){
var dock = d.querySelector('nav.gg-dock[data-gg-module="dock"]');
if (!dock) return false;
if (GG.core && GG.core.state) GG.core.state.add(dock, 'search');
var input = dock.querySelector('.gg-dock__search input[type="search"],.gg-dock__search [data-gg-dock-search-input]');
if (!input) return false;
try { input.focus({ preventScroll: true }); }
catch (_) { try { input.focus(); } catch (__ ) {} }
return true;
}

U.init = U.init || function(){
if (U._init) return;
U._init = true;

var loaded = U._bucketLoaded = U._bucketLoaded || {};
var coreP = lb('core').then(function(){
if (GG.boot && GG.boot.init) GG.boot.init();
if (GG.app && GG.app.init) GG.app.init();
});

function loadBucket(name){
if (!name) return Promise.resolve(false);
if (loaded[name]) return Promise.resolve(true);
loaded[name] = true;
return coreP.then(function(){
return lb(name).then(function(){
if (name === 'listing') w.__GG_LISTING_LOADED = true;
rehydrate();
return true;
}).catch(function(err){
loaded[name] = false;
throw err;
});
});
}

function ensureSurfaceBuckets(){
var tasks = [];
if (listingSurface()) tasks.push(loadBucket('listing'));
if (postSurface()) tasks.push(loadBucket('post'));
if (!tasks.length) return Promise.resolve(false);
return Promise.all(tasks).then(function(){ return true; }).catch(function(){ return false; });
}

ensureSurfaceBuckets();
if (d.readyState === 'loading') {
d.addEventListener('DOMContentLoaded', function(){
ensureSurfaceBuckets();
}, { once: true });
} else {
w.setTimeout(ensureSurfaceBuckets, 0);
}
coreP.then(function(){
w.setTimeout(ensureSurfaceBuckets, 120);
});

var searchSel = '[data-gg-search],.gg-search-trigger';
function openSearch(){
return coreP.then(function(){
return lb('search').then(function(){
return lb('search.rank').catch(function(){}).then(function(){
var S = M.search;
if (S && S.init) S.init();
if (S && S.openFromHotkey) {
S.openFromHotkey();
return true;
}
if (S && S.open) {
S.open(1);
return true;
}
return focusDockSearch();
});
});
});
}

function searchFallback(target){
if ((target && target.closest && target.closest('nav.gg-dock')) || focusDockSearch()) return;
try { w.location.href = '/search'; } catch (_) {}
}

if (!U._searchBound) {
U._searchBound = true;
d.addEventListener('click', function(e){
var t = e && e.target && e.target.closest ? e.target.closest(searchSel) : null;
if (!t) return;
if (t.closest && t.closest('nav.gg-dock')) return;
e.preventDefault();
e.stopPropagation();
openSearch().catch(function(err){
if (w.GG_DEBUG && w.console && typeof w.console.warn === 'function') w.console.warn('[ui] search open failed', err);
searchFallback(t);
});
}, true);
w.addEventListener('gg:search-open', function(){
openSearch().catch(function(){ focusDockSearch(); });
});
}

if (w.__GG_PENDING_SEARCH || w.__ggHotkeySearchPending) {
w.__GG_PENDING_SEARCH = false;
w.__ggHotkeySearchPending = 0;
openSearch().catch(function(){ focusDockSearch(); });
}
};
})(window, document);
