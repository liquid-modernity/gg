(function () {
        var GG = window.GG = window.GG || {};
        var startup = GG.__startup = GG.__startup || {};
        var body = document.body;
        var standalone = false;
      
        try { performance.mark('gg:boot:start'); } catch (error) {}
      
        startup.startedAt = window.performance && typeof window.performance.now === 'function'
          ? window.performance.now()
          : 0;
        startup.launchPath = window.location.pathname || '/';
      
        try {
          standalone = !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
        } catch (error) {
          standalone = false;
        }
      
        if (!standalone && window.navigator && window.navigator.standalone === true) {
          standalone = true;
        }
      
        startup.displayMode = standalone ? 'standalone' : 'browser';
        startup.longTasks = Array.isArray(startup.longTasks) ? startup.longTasks : [];
      
        if (!body) return;
      
        body.setAttribute('data-gg-boot', 'starting');
        body.setAttribute('data-gg-hydration', 'critical');
        body.setAttribute('data-gg-network', window.navigator && window.navigator.onLine === false ? 'offline' : 'online');
        body.setAttribute('data-gg-display-mode', startup.displayMode);
        body.setAttribute('data-gg-launch-path', startup.launchPath);
      }());
