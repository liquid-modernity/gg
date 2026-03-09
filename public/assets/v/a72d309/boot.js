(function(w, d){
'use strict';

var B = w.GG_BOOT = w.GG_BOOT || {};

function S(n){
try {
  var e = d.documentElement;
  var c = (e && e.dataset && typeof e.dataset.ggBoot !== 'undefined')
    ? e.dataset.ggBoot
    : (e && e.getAttribute('data-gg-boot')) || '';
  if (e && n > (parseInt(c, 10) || 0)) {
    if (e.dataset) e.dataset.ggBoot = String(n);
    else e.setAttribute('data-gg-boot', String(n));
  }
} catch (_) {}
}

S(1);
B.setStage = B.setStage || S;
if (B._booted) return;
B._booted = 1;

function K(){
var n = d.querySelectorAll ? d.querySelectorAll('dialog#gg-search,[data-gg-search-modal]') : [];
for (var i = 0; i < n.length; i++) {
  var e = n[i];
  if (e && e.parentNode) e.parentNode.removeChild(e);
}
}

K();
if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', K, { once: true });

var src = (d.currentScript && d.currentScript.src) || '';
if (!src) {
for (var l = d.getElementsByTagName('script'), i = l.length - 1; i >= 0; i--) {
  src = l[i].src || '';
  if (src.indexOf('/boot.js') !== -1) break;
}
}

var base = '/assets/latest';
var search = '';
try {
if (src) {
  var u = new URL(src, w.location.href);
  search = u.search || '';
  if (u.pathname.indexOf('/assets/latest/boot.js') === -1) {
    var m = u.pathname.match(/\/assets\/v\/([^/]+)\/boot\.js/);
    if (m && m[1]) base = '/assets/v/' + m[1];
  }
}
} catch (_) {}

var mainUrl = base + '/main.js' + search;
var loaded = 0;
var loading = 0;
var fired = 0;

function I(){
if (B._instant) return;
B._instant = 1;
var s = d.createElement('script');
s.src = 'https://instant.page/5.2.0';
s.type = 'module';
s.integrity = 'sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUorga2aqZJ0z';
s.crossOrigin = 'anonymous';
(d.head || d.documentElement).appendChild(s);
}

function M(){
if (loaded || loading || B._mainRequested) return;
B._mainRequested = 1;
loading = 1;
var s = d.createElement('script');
s.src = mainUrl;
s.async = 1;
s.onload = function(){
  loading = 0;
  loaded = 1;
  I();
};
s.onerror = function(){
  loading = 0;
};
(d.head || d.documentElement).appendChild(s);
}

function F(){
try {
  var i = d.querySelector('nav.gg-dock input[type="search"],nav.gg-dock [data-gg-dock-search-input]');
  if (i) {
    w.requestAnimationFrame(function(){
      try { i.focus({ preventScroll: true }); }
      catch (_) { try { i.focus(); } catch (__ ) {} }
    });
    return 1;
  }
} catch (_) {}
return 0;
}

function H(){
w.__ggHotkeySearchPending = 1;
w.__GG_PENDING_SEARCH = true;
if (F()) w.__ggHotkeySearchPending = 0;
try { w.dispatchEvent(new CustomEvent('gg:search-open', { detail: { source: 'cmdk' } })); } catch (_) {}
}

function C(){
if (fired) return;
fired = 1;
U();
M();
}

function O(e){
if (!e || e.defaultPrevented) return;
var k = e.key || '';
if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || (k !== 'k' && k !== 'K')) return;
if (Date.now() < (w.__gg_recovering_until || 0)) return;
e.preventDefault();
e.stopPropagation();
if (e.stopImmediatePropagation) e.stopImmediatePropagation();
C();
H();
}

function E(){ C(); }

function U(){
try { d.removeEventListener('pointerdown', E, true); } catch (_) {}
try { d.removeEventListener('keydown', E, true); } catch (_) {}
}

function J(t){
var r = function(){ if (!fired) C(); };
if (w.requestIdleCallback) w.requestIdleCallback(r, { timeout: t });
else w.setTimeout(r, t);
}

function L(){
var r = function(){ J(5000); };
if (d.readyState === 'complete') {
  r();
  return;
}
w.addEventListener('load', r, { once: true });
}

function readAnchor(link, href){
var anchor = (link && link.getAttribute && link.getAttribute('data-gg-anchor')) || '';
if (anchor) return anchor;
if (href && href.charAt(0) === '#') return href;
var idx = href ? href.indexOf('#') : -1;
if (idx >= 0) return href.slice(idx);
return '';
}

function shouldInterceptAction(action){
return action === 'search' || action === 'more';
}

function clearPendingDockAction(){
B._pendingDockAction = null;
w.__GG_PENDING_DOCK_ACTION = null;
}

function hardNavigate(href){
if (!href) return;
try {
  if (href.charAt(0) === '#') {
    w.location.hash = href.slice(1);
    return;
  }
} catch (_) {}
try { w.location.assign(href); }
catch (_) {
  try { w.location.href = href; } catch (__ ) {}
}
}

function tryReplayPendingDockAction(){
var pending = B._pendingDockAction || w.__GG_PENDING_DOCK_ACTION;
if (!pending) return false;
var dock = w.GG && w.GG.modules && w.GG.modules.Dock;
if (!dock || typeof dock.replayAction !== 'function') return false;
var ok = false;
try { ok = !!dock.replayAction(pending); } catch (_) { ok = false; }
if (!ok) return false;
clearPendingDockAction();
return true;
}

function waitForDockReplay(timeoutMs){
var start = Date.now();
var timer = w.setInterval(function(){
  var pending = B._pendingDockAction || w.__GG_PENDING_DOCK_ACTION;
  if (!pending) {
    w.clearInterval(timer);
    return;
  }
  if (tryReplayPendingDockAction()) {
    w.clearInterval(timer);
    return;
  }
  if (Date.now() - start > timeoutMs) {
    w.clearInterval(timer);
  }
}, 60);
}

function requestUiNow(reason){
C();
var tries = 0;
var maxTries = 40;
(function tick(){
  var boot = w.GG && w.GG.boot;
  if (boot && typeof boot.requestUi === 'function') {
    try {
      var p = boot.requestUi(reason || 'dock-action');
      if (p && typeof p.then === 'function') {
        p.then(function(){ tryReplayPendingDockAction(); }).catch(function(){});
      }
    } catch (_) {}
    tryReplayPendingDockAction();
    return;
  }
  tries += 1;
  if (tries < maxTries) w.setTimeout(tick, 50);
})();
waitForDockReplay(1800);
}

function queueDockAction(link, evt){
if (!link) return;
var action = String((link.getAttribute('data-gg-action') || '')).toLowerCase();
if (!action) return;
var href = link.getAttribute('href') || '';
var anchor = readAnchor(link, href);
var payload = {
  action: action,
  href: href,
  anchor: anchor,
  ts: Date.now()
};
B._pendingDockAction = payload;
w.__GG_PENDING_DOCK_ACTION = payload;
requestUiNow('dock-action:' + action);
if (!shouldInterceptAction(action)) return;
if (evt && evt.preventDefault) evt.preventDefault();
if (evt && evt.stopPropagation) evt.stopPropagation();
if (evt && evt.stopImmediatePropagation) evt.stopImmediatePropagation();

w.setTimeout(function(){
  var pending = B._pendingDockAction || w.__GG_PENDING_DOCK_ACTION;
  if (!pending) return;
  if ((pending.action || '') !== action) return;
  clearPendingDockAction();
  hardNavigate(href || anchor || '/');
}, 1400);
}

function onDockActionClick(evt){
if (!evt || evt.defaultPrevented) return;
if (Date.now() < (w.__gg_recovering_until || 0)) return;
var t = evt.target;
if (!t || !t.closest) return;
var link = t.closest('a[data-gg-action]');
if (!link) return;
var scope = link.closest ? link.closest('nav.gg-dock,#gg-dock-more') : null;
if (!scope) return;
var dockReady = !!(w.GG && w.GG.modules && w.GG.modules.Dock && typeof w.GG.modules.Dock.replayAction === 'function');
if (dockReady) return;
queueDockAction(link, evt);
}

w.addEventListener('keydown', O, true);
d.addEventListener('click', onDockActionClick, true);
d.addEventListener('pointerdown', E, { passive: true, capture: true, once: true });
d.addEventListener('keydown', E, { capture: true, once: true });

var sf = ((d.body && d.body.getAttribute('data-gg-surface')) || '').toLowerCase();
if (sf && sf !== 'landing') M();
else L();

})(window, document);
