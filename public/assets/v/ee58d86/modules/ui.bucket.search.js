(function(w){
'use strict';

var GG = w.GG = w.GG || {};
GG.modules = GG.modules || {};
GG.__uiBuckets = GG.__uiBuckets || {};
if (GG.__uiBuckets.search) return;
GG.__uiBuckets.search = true;

(function(GG, w, d){
'use strict';
if (!GG) return;
GG.modules = GG.modules || {};
GG.modules.search = GG.modules.search || (function(){
  var S = { i: [], r: 0, p: null, u: null, o: 0, a: -1, res: [], t: 0, f: null, b: 0, initd: 0, q: '' };
  var RK = 'gg_recents';
  var PID = 'gg-palette-list';
  var F = w.location && w.location.search && w.location.search.indexOf('gg_fail=palette') > -1;

  function L(){
    return Date.now() < (w.__gg_recovering_until || 0);
  }

  function TX(v){
    return String(v || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function AL(en){
    var links = en && en.link ? en.link : [];
    for (var i = 0; i < links.length; i++) {
      if (links[i].rel === 'alternate' && links[i].href) return links[i].href;
    }
    return '';
  }

  function FM(json){
    var en = json && json.feed && json.feed.entry ? json.feed.entry : [];
    var out = [];
    for (var i = 0; i < en.length; i++) {
      var e = en[i] || {};
      var t = e.title && e.title.$t ? e.title.$t : '';
      var u = AL(e);
      var s = '';
      if (e.summary && e.summary.$t) s = e.summary.$t;
      else if (e.content && e.content.$t) s = e.content.$t;
      s = TX(s);
      if (s.length > 160) s = s.slice(0, 160);
      var labs = '';
      if (e.category && e.category.length) {
        var arr = [];
        for (var c = 0; c < e.category.length; c++) {
          var term = e.category[c] && e.category[c].term;
          if (term) arr.push(term);
        }
        if (arr.length) labs = arr.join(',').toLowerCase();
      }
      if (t && u) out.push({ title: t, url: u, labels: labs, t: t.toLowerCase(), s: s.toLowerCase() });
    }
    return out;
  }

  function IX(){
    if (S.r) return Promise.resolve(S.i);
    if (S.p) return S.p;
    S.p = LI().finally(function(){ S.p = null; });
    return S.p;
  }

  async function LI(){
    if (!GG.services || !GG.services.api || !GG.services.api.getFeed) throw 0;
    var feed = await GG.services.api.getFeed({ summary: 1, 'max-results': 500 });
    S.i = FM(feed);
    S.r = 1;
    return S.i;
  }

  function UI(){
    var ui = S.u;
    if (ui && ui.input) return ui;

    var dock = d.querySelector('#gg-dock .gg-dock__search');
    if (!dock) return null;
    var input = dock.querySelector('input[type="search"]');
    if (!input) return null;
    var close = dock.querySelector('[data-gg-dock-close]');
    var form = dock.querySelector('form');
    var panel = d.getElementById(PID);
    if (!panel) {
      panel = d.createElement('div');
      panel.id = PID;
      panel.className = 'gg-search-panel';
      panel.setAttribute('role', 'listbox');
      panel.hidden = true;
      (d.body || d.documentElement).appendChild(panel);
    }

    S.u = { dock: dock, input: input, close: close, form: form, panel: panel };

    if (!S.b) {
      S.b = 1;
      input.addEventListener('input', function(){
        if (L()) return;
        if (S.t) clearTimeout(S.t);
        if (!S.o) O(0);
        S.t = w.setTimeout(R, 100);
      });
      input.addEventListener('keydown', IK);
      input.addEventListener('focus', function(){
        if (L()) return;
        O(1);
      });
      input.addEventListener('blur', function(){ setTimeout(Y, 120); });
      panel.addEventListener('click', function(e){
        try {
          var item = e.target && e.target.closest ? e.target.closest('.gg-search-item') : null;
          if (!item) return;
          e.preventDefault();
          NI(PI(item));
        } catch (err) {
          E(err, 'c');
        }
      });
      d.addEventListener('pointerdown', OD, true);
      if (close) close.addEventListener('click', function(){ X(); });
      if (form) form.addEventListener('submit', function(e){
        if (S.a > -1 && S.res && S.res[S.a]) {
          e.preventDefault();
          NI(S.res[S.a]);
          return;
        }
        e.preventDefault();
        FS();
      });
      w.addEventListener('resize', PP);
      if (w.visualViewport && w.visualViewport.addEventListener) w.visualViewport.addEventListener('resize', PP);
      w.addEventListener('gg:search-open', function(){
        w.__ggHotkeySearchPending = 0;
        w.__GG_PENDING_SEARCH = false;
        O(1);
      });
    }

    return S.u;
  }

  function FD(ui){
    if (!ui || !ui.input) return;
    var input = ui.input;
    try { input.focus({ preventScroll: true }); }
    catch (_) { try { input.focus(); } catch(__) {} }
  }

  function DS(on){
    var dock = d.querySelector('nav.gg-dock');
    var state = dock && dock.getAttribute('data-gg-state') || '';
    if (!dock) return;
    if (on) {
      if ((' ' + state + ' ').indexOf(' search ') < 0) dock.setAttribute('data-gg-state', (state + ' search').trim());
      return;
    }
    if (state.indexOf('search') > -1) {
      state = (' ' + state + ' ').replace(' search ', ' ').trim();
      if (state) dock.setAttribute('data-gg-state', state);
      else dock.removeAttribute('data-gg-state');
    }
  }

  function E(err, action, query){
    var sr = GG.modules && GG.modules.searchRank;
    if (sr && sr.e) sr.e(w, d, S, action, query, err);
  }

  function Y(){
    if (L()) {
      DS(0);
      return;
    }
    var ui = UI();
    if (!ui) return;
    var ae = d.activeElement;
    var focusedInside = !!(ae && (ui.dock.contains(ae) || ui.panel.contains(ae)));
    var keep = S.o || focusedInside || !!(ui.input && ui.input.value && ui.input.value.trim());
    DS(keep);
  }

  function VIS(el){
    if (!el || el.hasAttribute('hidden')) return 0;
    var r = el.getBoundingClientRect();
    return !!(r && r.width > 0 && r.height > 0);
  }

  function AP(panel, ui){
    if (!panel || !ui) return;
    var anchor = ui.input || ui.dock;
    if (!VIS(anchor)) {
      panel.setAttribute('data-mode', 'center');
      return;
    }
    var r = anchor.getBoundingClientRect();
    var vw = Math.max(320, (w.innerWidth || d.documentElement.clientWidth || 0));
    var pw = Math.min(720, Math.max(220, Math.min(r.width, vw - 24)));
    panel.style.setProperty('--gg-anchor-x', r.left + 'px');
    panel.style.setProperty('--gg-anchor-y', r.top + 'px');
    panel.style.setProperty('--gg-anchor-w', r.width + 'px');
    panel.style.setProperty('--gg-anchor-h', r.height + 'px');
    panel.style.setProperty('--gg-panel-w', pw + 'px');
    panel.setAttribute('data-mode', 'dock');
  }

  function PP(){
    if (!S.o) return;
    var ui = UI();
    if (!ui) return;
    AP(ui.panel, ui);
  }

  function GR(){
    try {
      var v = localStorage.getItem(RK);
      if (v) {
        var arr = JSON.parse(v);
        if (Array.isArray(arr)) return arr;
      }
    } catch (_) {}
    return [];
  }

  function SR(url, title){
    if (!url || !title) return;
    var arr = GR();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].url === url) {
        arr.splice(i, 1);
        break;
      }
    }
    arr.unshift({ url: url, title: title, ts: Date.now() });
    if (arr.length > 20) arr.length = 20;
    try { localStorage.setItem(RK, JSON.stringify(arr)); } catch (_) {}
  }

  function MT(it){
    if (!it) return '';
    var meta = '';
    if (it.labels) meta = String(it.labels).split(',')[0] || '';
    else if (it.ts) meta = 'Recent';
    if (meta.length > 18) meta = meta.slice(0, 18);
    return meta;
  }

  function sectionNode(text, klass){
    var div = d.createElement('div');
    div.className = klass;
    div.setAttribute('role', 'presentation');
    div.setAttribute('aria-hidden', 'true');
    div.textContent = text;
    return div;
  }

  function RI(it, i){
    /* contract: role="option" aria-selected="false" */
    var a = d.createElement('a');
    a.className = 'gg-search__result gg-search-item';
    a.id = 'gg-opt-' + i;
    a.setAttribute('role', 'option');
    a.setAttribute('aria-selected', 'false');
    a.dataset.i = String(i);
    a.href = it && it.url ? String(it.url) : '#';

    var title = d.createElement('span');
    title.className = 'gg-search__title';
    title.textContent = it && it.title ? String(it.title) : '';
    a.appendChild(title);

    var meta = MT(it);
    if (meta) {
      var metaNode = d.createElement('span');
      metaNode.className = 'gg-search__meta';
      metaNode.textContent = meta;
      a.appendChild(metaNode);
    }
    return a;
  }

  function resetSelection(ui){
    S.a = -1;
    if (ui && ui.input) ui.input.removeAttribute('aria-activedescendant');
  }

  function clearPanel(ui){
    if (!ui || !ui.panel) return null;
    ui.panel.textContent = '';
    return d.createDocumentFragment();
  }

  function RR(){
    var ui = UI();
    if (!ui) return;
    var recents = GR();
    var list = [];
    var frag = clearPanel(ui);
    S.q = '';

    if (recents && recents.length) {
      frag.appendChild(sectionNode('Recent', 'gg-search__section'));
      for (var j = 0; j < recents.length && j < 5; j++) {
        var it = recents[j] || {};
        list.push(it);
        frag.appendChild(RI(it, j));
      }
    }

    if (!list.length) {
      frag.appendChild(sectionNode('Type', 'gg-search__hint'));
      ui.panel.appendChild(frag);
      S.res = [];
      resetSelection(ui);
      return;
    }

    ui.panel.appendChild(frag);
    S.res = list;
    resetSelection(ui);
  }

  function SC(q){
    var rk = GG.modules && GG.modules.searchRank && GG.modules.searchRank.run;
    return typeof rk === 'function' ? rk(S.i, q, 10) : [];
  }

  function R(){
    try {
      if (F) throw new Error('gg_fail palette');
      var ui = UI();
      if (!ui) return;
      var q = (ui.input && ui.input.value ? ui.input.value : '').trim();
      var sr = GG.modules && GG.modules.searchRank;
      var p = sr && sr.parse ? sr.parse(q) : 0;
      var m;
      var frag;

      if (!q) {
        RR();
        return;
      }

      if (p && p.s && !p.f) {
        frag = clearPanel(ui);
        frag.appendChild(sectionNode('/label', 'gg-search__hint'));
        ui.panel.appendChild(frag);
        S.res = [];
        resetSelection(ui);
        return;
      }

      if (!S.r) {
        IX().then(R).catch(function(err){ E(err, 'r'); });
        return;
      }

      S.q = q.toLowerCase();
      S.res = SC(q) || [];
      resetSelection(ui);
      m = sr && sr.last ? sr.last : 0;

      if (!S.res.length) {
        frag = clearPanel(ui);
        frag.appendChild(sectionNode('No ' + q, 'gg-search__hint'));
        frag.appendChild(sectionNode('↵/⌘↵', 'gg-search__hint'));
        if (m && m.h) frag.appendChild(sectionNode(String(m.h), 'gg-search__hint'));
        ui.panel.appendChild(frag);
        return;
      }

      frag = clearPanel(ui);
      if (m && m.f) frag.appendChild(sectionNode('Filter·/' + m.f, 'gg-search__section'));
      for (var i = 0; i < S.res.length; i++) {
        frag.appendChild(RI(S.res[i] || {}, i));
      }
      frag.appendChild(sectionNode('↵/⌘↵', 'gg-search__hint'));
      ui.panel.appendChild(frag);
    } catch (err) {
      E(err, 'r');
    }
  }

  function SA(i){
    var ui = UI();
    if (!ui) return;
    var nodes = ui.panel.querySelectorAll('.gg-search-item');
    if (!nodes || !nodes.length) {
      resetSelection(ui);
      return;
    }
    if (i < 0) i = 0;
    if (i >= nodes.length) i = nodes.length - 1;

    var prev = S.a;
    var el;
    var titleNode;
    var titleText;
    var sr = GG.modules && GG.modules.searchRank;

    if (prev > -1 && nodes[prev]) {
      nodes[prev].setAttribute('aria-selected', 'false');
      titleNode = nodes[prev].querySelector('.gg-search__title');
      if (titleNode) titleNode.textContent = (S.res[prev] && S.res[prev].title) || '';
    }

    el = nodes[i];
    if (el) {
      el.setAttribute('aria-selected', 'true');
      if (ui.input) ui.input.setAttribute('aria-activedescendant', el.id || '');
      titleNode = el.querySelector('.gg-search__title');
      if (titleNode) {
        titleText = (S.res[i] && S.res[i].title) || '';
        if (sr && sr.h) sr.h(titleNode, titleText, S.q || '', d);
        else titleNode.textContent = titleText;
      }
    }
    S.a = i;
  }

  function MA(dir){
    if (!S.res || !S.res.length) return;
    var i = S.a;
    if (i < 0) i = dir > 0 ? 0 : S.res.length - 1;
    else {
      i = i + dir;
      if (i < 0) i = S.res.length - 1;
      else if (i >= S.res.length) i = 0;
    }
    SA(i);
  }

  function PI(el){
    var i = parseInt(el.getAttribute('data-i'), 10);
    if (!isNaN(i) && S.res && S.res[i]) return S.res[i];
    return { url: el.getAttribute('href') || '' };
  }

  function NAV(url, title){
    if (!url) return;
    var href = url;
    var same = 0;
    try {
      var u = new URL(url, w.location.href);
      if (u.origin === w.location.origin) {
        same = 1;
        href = u.pathname + u.search + u.hash;
      } else href = u.toString();
    } catch (_) {}
    if (title) SR(href, title);
    X(1);
    if (same && href.indexOf('/search') !== 0 && GG.core && GG.core.router && GG.core.router.navigate) GG.core.router.navigate(href);
    else w.location.assign(href);
  }

  function NI(it){
    if (!it) return;
    NAV(it.url || '', it.title || '');
  }

  function FS(){
    try {
      var ui = UI();
      var q = ui && ui.input ? ui.input.value.trim() : '';
      var sr = GG.modules && GG.modules.searchRank;
      var p = sr && sr.parse ? sr.parse(q) : 0;
      var t = q;
      if (!q) {
        X();
        return;
      }
      if (p && p.s) t = p.r || p.f || '';
      if (!t) {
        X();
        return;
      }
      X(1);
      w.location.assign('/search?q=' + encodeURIComponent(t));
    } catch (err) {
      var ui2 = UI();
      var q2 = ui2 && ui2.input ? ui2.input.value.trim() : '';
      E(err, 'f', q2);
    }
  }

  function IK(e){
    try {
      if (!e) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        X(1);
        FD(UI());
        return;
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        FS();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (S.a > -1 && S.res && S.res[S.a]) NI(S.res[S.a]);
        else FS();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        MA(e.key === 'ArrowDown' ? 1 : -1);
      }
    } catch (err) {
      E(err, 'k');
    }
  }

  function OD(e){
    if (!S.o) return;
    var ui = UI();
    var target = e && e.target;
    if (!ui || !target) return;
    if (ui.dock.contains(target) || ui.panel.contains(target)) return;
    X(1);
  }

  function O(focusInput){
    try {
      if (L()) {
        DS(0);
        return;
      }
      var ui = UI();
      if (!ui) return;
      if (!S.o) {
        S.o = 1;
        S.f = d.activeElement;
      }
      ui.panel.hidden = false;
      if (ui.input) ui.input.setAttribute('aria-expanded', 'true');
      AP(ui.panel, ui);
      DS(1);
      R();
      if (focusInput) FD(ui);
    } catch (err) {
      E(err, 'o');
    }
  }

  function X(skipRestore){
    var ui = UI();
    if (!ui) return;
    S.o = 0;
    S.a = -1;
    ui.panel.hidden = true;
    if (ui.input) {
      ui.input.removeAttribute('aria-activedescendant');
      ui.input.setAttribute('aria-expanded', 'false');
    }
    Y();
    if (skipRestore) return;
    var last = S.f;
    S.f = null;
    if (last && last.focus) {
      try { last.focus(); } catch (_) {}
    }
  }

  function init(){
    if (S.initd) return;
    S.initd = 1;
    if (!UI()) return;
    Y();
    if (w.__ggHotkeySearchPending || w.__GG_PENDING_SEARCH) {
      w.__ggHotkeySearchPending = 0;
      w.__GG_PENDING_SEARCH = false;
      O(1);
    }
  }

  return {
    init: init,
    open: O,
    close: X,
    openFromHotkey: function(){ O(1); }
  };
})();

if (GG.boot && GG.boot.onReady) {
  GG.boot.onReady(function(){
    if (GG.modules && GG.modules.search && GG.modules.search.init) GG.modules.search.init();
  });
}
})(w.GG = w.GG || {}, w, document);
})(window);
