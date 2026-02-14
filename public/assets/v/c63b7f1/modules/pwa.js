(function(GG, w, d){
  'use strict';
  if (!GG) return;
  GG.services = GG.services || {};
  GG.boot = GG.boot || {};
  var services = GG.services;

  services.manifest = services.manifest || {};
  services.manifest.init = services.manifest.init || function(opts){
    var options = opts || {};
    var href = options.href || (w.GG_ASSET ? w.GG_ASSET('/manifest.webmanifest') : '/manifest.webmanifest');
    var link = d.querySelector('link[rel="manifest"]');
    if(!link){
      if(!d.head) return null;
      link = d.createElement('link');
      link.setAttribute('rel', 'manifest');
      d.head.appendChild(link);
    }
    if(href && link.getAttribute('href') !== href){
      link.setAttribute('href', href);
    }
    return link;
  };

  services.sw = services.sw || {};
  services.sw.devCleanup = services.sw.devCleanup || function(){
    if (services.sw._devCleaned) return;
    services.sw._devCleaned = true;
    if (!w.navigator || !("serviceWorker" in w.navigator)) {
      try { if (w.console && console.info) console.info("GG DEV: SW & caches cleaned"); } catch (e) {}
      return;
    }

    var reloadKey = "gg_dev_sw_cleaned";
    var already = false;
    try { already = !!(w.sessionStorage && w.sessionStorage.getItem(reloadKey)); } catch (e) {}

    var tasks = [];
    try {
      tasks.push(
        w.navigator.serviceWorker.getRegistrations()
          .then(function(list){
            return Promise.all(list.map(function(reg){
              try { return reg.unregister(); } catch (e) { return null; }
            }));
          })
          .catch(function(){})
      );
    } catch (e) {}

    try {
      if (w.caches && w.caches.keys) {
        tasks.push(
          w.caches.keys()
            .then(function(keys){
              var target = keys.filter(function(k){
                return /^gg-/.test(k) || /^workbox-/.test(k);
              });
              return Promise.all(target.map(function(k){ return w.caches.delete(k); }));
            })
            .catch(function(){})
        );
      }
    } catch (e) {}

    Promise.all(tasks).then(function(){
      var controlled = !!(w.navigator && w.navigator.serviceWorker && w.navigator.serviceWorker.controller);
      if (controlled && !already) {
        try { w.sessionStorage && w.sessionStorage.setItem(reloadKey, "1"); } catch (e) {}
        w.location.reload();
        return;
      }
      try { if (w.console && console.info) console.info("GG DEV: SW & caches cleaned"); } catch (e) {}
    });
  };
  services.sw.init = services.sw.init || function () {
    if (services.sw._init) return;
    var env = (w.GG && GG.env) ? GG.env : {};
    if (env.worker !== true) return;
    services.sw._init = true;
  
    if (!w.navigator || !("serviceWorker" in w.navigator)) return;
    if (w.location && w.location.protocol !== "https:") return;

    var debug = false;
    try { debug = new URL(w.location.href).searchParams.get("ggdebug") === "1"; } catch (e) {}
    function log(){
      if(!debug || !w.console || !console.log) return;
      console.log.apply(console, ["[GG_SW]"].concat([].slice.call(arguments)));
    }

    if (w.GG_IS_DEV) {
      log("pwa disabled in dev mode");
      return;
    }

    var FLAGS_URL = "/gg-flags.json";
    var reloadKey = "gg_sw_disabled_reload";
    var disableInFlight = false;

    function fetchFlags(){
      // no-store so kill-switch flips immediately (avoid stale cache)
      return w.fetch(FLAGS_URL + "?t=" + Date.now(), { cache: "no-store" })
        .then(function(res){ return res && res.ok ? res.json() : null; })
        .then(function(data){
          var enabled = !(data && data.sw && data.sw.enabled === false);
          return { enabled: enabled };
        })
        .catch(function(){
          return { enabled: true };
        });
    }

    function disableSw(reason){
      if(disableInFlight) return;
      disableInFlight = true;
      log("sw disabled", reason || "");

      var tasks = [];
      try {
        tasks.push(
          w.navigator.serviceWorker.getRegistrations()
            .then(function(list){
              return Promise.all(list.map(function(reg){
                try { return reg.unregister(); } catch (e) { return null; }
              }));
            })
            .catch(function(){})
        );
      } catch (e) {}

      try {
        if (w.caches && w.caches.keys) {
          tasks.push(
            w.caches.keys()
              .then(function(keys){
                return Promise.all(keys.map(function(k){ return w.caches.delete(k); }));
              })
              .catch(function(){})
          );
        }
      } catch (e) {}

      Promise.all(tasks).then(function(){
        var controlled = !!(w.navigator && w.navigator.serviceWorker && w.navigator.serviceWorker.controller);
        var already = false;
        try { already = !!(w.sessionStorage && w.sessionStorage.getItem(reloadKey)); } catch (e) {}
        // Guard reload to avoid infinite loop while SW is disabled.
        if (controlled && !already) {
          try { w.sessionStorage && w.sessionStorage.setItem(reloadKey, "1"); } catch (e) {}
          w.location.reload();
        }
      });
    }

    var refreshing = false;
    function onControllerChange(){
      if(refreshing) return;
      refreshing = true;
      w.location.reload();
    }

    function requestUpdate(reg){
      if(!reg || !reg.waiting) return;
      var ok = true;
      try { ok = w.confirm ? w.confirm("Update tersedia. Muat ulang sekarang?") : true; } catch (e) { ok = true; }
      if(!ok) return;
      try { reg.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (e) {}
      try { w.navigator.serviceWorker.addEventListener("controllerchange", onControllerChange, { once: true }); } catch (e) {}
    }

    function trackUpdates(reg){
      if(!reg) return;
      if(reg.waiting) requestUpdate(reg);

      reg.addEventListener("updatefound", function(){
        var next = reg.installing;
        if(!next) return;
        next.addEventListener("statechange", function(){
          if(next.state === "installed" && w.navigator.serviceWorker.controller){
            log("update available");
            requestUpdate(reg);
          }
        });
      });
    }
  
    function register() {
      try {
        w.navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then(function (reg) {
            // optional: paksa cek update lebih cepat (aman)
            try { reg.update(); } catch (e) {}
            trackUpdates(reg);
          })
          .catch(function (err) {
            if (w.console && console.error) console.error(err);
          });
      } catch (e) {}
    }

    try {
      w.navigator.serviceWorker.addEventListener("message", function(evt){
        var data = evt && evt.data ? evt.data : {};
        if (data.type === "GG_SW_DISABLED") disableSw("message");
      });
    } catch (e) {}

    fetchFlags().then(function(flags){
      if (!flags || flags.enabled === false) {
        disableSw("flags");
        return;
      }
      try { w.sessionStorage && w.sessionStorage.removeItem(reloadKey); } catch (e) {}
      if (d.readyState === "complete") register();
      else w.addEventListener("load", register, { once: true });
    });
  };

  services.pwa = services.pwa || {};
  services.pwa.init = services.pwa.init || function(){
    if (services.pwa._init) return;
    services.pwa._init = true;
    if (w.GG_IS_DEV) {
      if (services.sw && services.sw.devCleanup) services.sw.devCleanup();
      return;
    }
    services.manifest.init();
    if (GG.core && GG.core.ensureWorker) {
      GG.core.ensureWorker().then(function(ok){
        if (!ok) return;
        services.sw.init();
      });
      return;
    }
    services.sw.init();
  };

  if (services.pwa && typeof services.pwa.init === 'function') {
    services.pwa.init();
  }

  GG.modules = GG.modules || {};
  GG.modules.pwa = GG.modules.pwa || {};
  GG.modules.pwa.init = GG.modules.pwa.init || function(){
    if (services.pwa && typeof services.pwa.init === 'function') services.pwa.init();
  };
})(window.GG = window.GG || {}, window, document);
