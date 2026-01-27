export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Fetch the asset from the bound static assets bucket
    const assetResponse = await env.ASSETS.fetch(request);

    // Clone so we can safely adjust headers
    const response = new Response(assetResponse.body, assetResponse);
    const { pathname } = url;

    const setCache = (value) => {
      response.headers.set('Cache-Control', value);
    };

    if (pathname.startsWith('/assets/dev/')) {
      setCache('no-cache, max-age=0, must-revalidate');
    } else if (pathname.startsWith('/assets/v/')) {
      setCache('public, max-age=31536000, immutable');
    } else if (pathname === '/sw.js') {
      setCache('no-cache, max-age=0, must-revalidate');
    } else if (pathname === '/manifest.webmanifest' || pathname === '/offline.html') {
      setCache('public, max-age=86400');
    } else if (pathname.startsWith('/gg-pwa-icon/')) {
      setCache('public, max-age=31536000, immutable');
    }

    return response;
  },
};
