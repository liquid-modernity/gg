(function () {
  'use strict';

  if (window.StoreSurface) return;

  function appendScript(src, marker) {
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    if (marker) script.setAttribute(marker, 'true');
    (document.head || document.documentElement).appendChild(script);
  }

  appendScript('/assets/store/store-core.js', 'data-store-core-compat');
}());
