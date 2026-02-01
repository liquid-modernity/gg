/* src/worker.js — Cloudflare Worker (edge) */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Path yang memang kamu host di Workers Static Assets
    const shouldTryAssets =
      pathname.startsWith("/assets/") ||
      pathname.startsWith("/gg-pwa-icon/") ||
      pathname === "/sw.js" ||
      pathname === "/manifest.webmanifest" ||
      pathname === "/offline.html";

    // Worker ini bukan reverse proxy Blogger
    if (!shouldTryAssets) {
      return new Response("Not found", { status: 404 });
    }

    if (!env.ASSETS) {
      return new Response("ASSETS binding missing", { status: 502 });
    }

    let assetRes;
    try {
      assetRes = await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("ASSETS fetch failed", { status: 502 });
    }

    // Jangan cache response error
    if (!assetRes.ok) {
      const r = new Response(assetRes.body, assetRes);
      r.headers.set("Cache-Control", "no-store");
      return r;
    }

    const res = new Response(assetRes.body, assetRes);
    const setCache = (v) => res.headers.set("Cache-Control", v);

    if (pathname.startsWith("/assets/dev/")) {
      setCache("no-store, max-age=0");
    } else if (pathname.startsWith("/assets/v/")) {
      setCache("public, max-age=31536000, immutable");
    } else if (pathname === "/sw.js") {
      // SW harus gampang update
      setCache("no-store");
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
