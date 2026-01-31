export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    const shouldTryAssets =
      pathname.startsWith("/assets/") ||
      pathname.startsWith("/gg-pwa-icon/") ||
      pathname === "/sw.js" ||
      pathname === "/manifest.webmanifest" ||
      pathname === "/offline.html";

    if (!shouldTryAssets || !env.ASSETS) {
      return new Response("Not handled by this Worker", { status: 404 });
    }

    const assetRes = await env.ASSETS.fetch(request);

    // Jangan cache error
    if (!assetRes.ok) {
      const r = new Response(assetRes.body, assetRes);
      r.headers.set("Cache-Control", "no-store");
      return r;
    }

    const res = new Response(assetRes.body, assetRes);
    const setCache = (v) => res.headers.set("Cache-Control", v);

    if (pathname.startsWith("/assets/dev/")) {
      setCache("no-cache, max-age=0, must-revalidate");
    } else if (pathname.startsWith("/assets/v/")) {
      setCache("public, max-age=31536000, immutable");
    } else if (pathname === "/sw.js") {
      setCache("no-cache, max-age=0, must-revalidate");
    } else if (pathname === "/manifest.webmanifest" || pathname === "/offline.html") {
      setCache("public, max-age=86400");
    } else if (pathname.startsWith("/gg-pwa-icon/")) {
      setCache("public, max-age=31536000, immutable");
    } else {
      setCache("public, max-age=86400");
    }

    return res;
  },
};
