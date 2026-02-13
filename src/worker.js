/* src/worker.js — Cloudflare Worker (edge) */
const cleanUrlForSchema = (inputUrl, { forceBlog = false } = {}) => {
  const u = new URL(inputUrl);
  u.searchParams.delete("x");
  u.searchParams.delete("view");
  u.searchParams.delete("fbclid");
  u.searchParams.delete("gclid");
  u.searchParams.delete("msclkid");
  for (const key of Array.from(u.searchParams.keys())) {
    if (key.startsWith("utm_")) {
      u.searchParams.delete(key);
    }
  }
  u.hash = "";
  if (forceBlog) {
    u.pathname = "/blog";
  }
  u.search = "";
  return `${u.origin}${u.pathname}`;
};

const FLAGS_TTL_MS = 60 * 1000;
let flagsCache = { ts: 0, value: null };

const normalizeFlags = (data) => {
  const out = {
    sw: { enabled: true },
    csp_report_enabled: true,
  };
  if (data && typeof data === "object") {
    if (data.sw && typeof data.sw === "object") {
      if (typeof data.sw.enabled === "boolean") {
        out.sw.enabled = data.sw.enabled;
      }
    }
    if (typeof data.csp_report_enabled === "boolean") {
      out.csp_report_enabled = data.csp_report_enabled;
    }
    for (const [key, value] of Object.entries(data)) {
      if (key === "sw" || key === "csp_report_enabled") continue;
      out[key] = value;
    }
  }
  return out;
};

const loadFlags = async (env) => {
  const now = Date.now();
  if (flagsCache.value && now - flagsCache.ts < FLAGS_TTL_MS) {
    return { ...flagsCache.value };
  }

  let data = null;
  if (env && env.ASSETS) {
    try {
      const req = new Request("https://flags.local/__gg/flags.json");
      const res = await env.ASSETS.fetch(req);
      if (res && res.ok) {
        data = await res.json();
      }
    } catch (e) {
      data = null;
    }
  }

  const flags = normalizeFlags(data);
  flagsCache = { ts: now, value: flags };
  return { ...flags };
};

const CSP_REPORT_BUCKET = new Map();
const CSP_REPORT_MAX = 500;
const CSP_REPORT_TRIM = 100;

const redactUrlValue = (value) => {
  if (!value || typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return `${u.origin}${u.pathname}`;
    }
    return u.protocol;
  } catch (e) {
    const noHash = raw.split("#")[0];
    const noQuery = noHash.split("?")[0];
    return noQuery;
  }
};

const extractCspReport = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  if (payload["csp-report"] && typeof payload["csp-report"] === "object") {
    return payload["csp-report"];
  }
  if (payload.body && typeof payload.body === "object") {
    return payload.body;
  }
  return payload;
};

const shouldLogCspCount = (count) => {
  if (count === 1 || count === 10 || count === 50) return true;
  if (count >= 100 && count % 100 === 0) return true;
  return false;
};

const CSP_REPORT_ONLY = [
  "default-src 'self' https:",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' https:",
  "connect-src 'self' https:",
  "font-src 'self' data: https:",
  "frame-src https:",
  "form-action 'self' https:",
  "upgrade-insecure-requests",
  "report-uri /api/csp-report",
].join("; ");

const addSecurityHeaders = (resp, requestUrl, contentType, opts = {}) => {
  const headers = resp.headers;
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=()"
  );
  headers.set("X-Frame-Options", "SAMEORIGIN");
  const isHtml = (contentType || "").toLowerCase().includes("text/html");
  const cspReportEnabled = opts.cspReportEnabled !== false;
  if (isHtml && cspReportEnabled) {
    const origin = new URL(requestUrl).origin;
    const reportTo = JSON.stringify({
      group: "csp",
      max_age: 10886400,
      endpoints: [{ url: `${origin}/api/csp-report` }],
    });
    headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
    headers.set("Report-To", reportTo);
    headers.set("Reporting-Endpoints", `csp="${origin}/api/csp-report"`);
  }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const WORKER_VERSION = "7a87a4e";
    const stamp = (res, opts = {}) => {
      const h = new Headers(res.headers);
      h.set("X-GG-Worker", "proxy");
      h.set("X-GG-Worker-Version", WORKER_VERSION);
      const out = new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: h,
      });
      const contentType = out.headers.get("content-type") || "";
      addSecurityHeaders(out, request.url, contentType, opts);
      return out;
    };

    if (
      pathname === "/_headers" ||
      pathname === "/_redirects" ||
      pathname === "/wrangler.toml" ||
      pathname === "/wrangler.jsonc"
    ) {
      const r = new Response("Not Found", { status: 404 });
      r.headers.set("Cache-Control", "no-store");
      return stamp(r);
    }

    if (pathname === "/__gg_worker_ping") {
      const r = new Response("pong", { status: 200 });
      r.headers.set("Cache-Control", "no-store");
      return stamp(r);
    }

    if (pathname === "/gg-flags.json") {
      const flags = await loadFlags(env);
      const body = JSON.stringify({
        ...flags,
        release: WORKER_VERSION,
        ts: Date.now(),
      });
      const r = new Response(body, { status: 200 });
      r.headers.set("Content-Type", "application/json; charset=utf-8");
      r.headers.set("Cache-Control", "no-store, max-age=0");
      const out = stamp(r);
      out.headers.set("Cache-Control", "no-store, max-age=0");
      out.headers.set("Pragma", "no-cache");
      out.headers.set("Expires", "0");
      return out;
    }

    if (pathname === "/__gg_route_test") {
      const body = [
        "ROUTE_OK",
        `pathname: ${pathname}`,
        `host: ${url.host}`,
      ].join("\n");
      const r = new Response(body, { status: 200 });
      r.headers.set("Content-Type", "text/plain; charset=utf-8");
      r.headers.set("Cache-Control", "no-store");
      return stamp(r);
    }

    if (pathname === "/api/telemetry") {
      let payload = null;
      try {
        payload = await request.json();
      } catch (e) {
        try {
          payload = await request.text();
        } catch (err) {
          payload = null;
        }
      }
      console.log("GG_TELEMETRY", payload);
      const r = new Response("", { status: 204 });
      r.headers.set("Cache-Control", "no-store");
      return stamp(r);
    }

    if (pathname === "/api/csp-report") {
      if (request.method !== "POST") {
        const r = new Response("Method Not Allowed", { status: 405 });
        r.headers.set("Allow", "POST");
        r.headers.set("Cache-Control", "no-store");
        r.headers.set("Content-Type", "text/plain; charset=utf-8");
        return stamp(r);
      }

      const flags = await loadFlags(env);
      const cspReportEnabled = flags.csp_report_enabled !== false;
      if (!cspReportEnabled) {
        const r = new Response("", { status: 204 });
        r.headers.set("Cache-Control", "no-store");
        r.headers.set("Content-Type", "text/plain; charset=utf-8");
        return stamp(r);
      }

      const MAX_BODY = 65536;
      let body = "";
      try {
        body = await request.text();
      } catch (e) {
        body = "";
      }
      if (body.length > MAX_BODY) {
        body = body.slice(0, MAX_BODY);
      }

      const ts = new Date().toISOString();
      const cfRay = request.headers.get("cf-ray") || "-";
      const uaRaw = request.headers.get("user-agent") || "";
      const ua = uaRaw.slice(0, 120).replace(/"/g, "'");
      let payload = null;
      try {
        payload = JSON.parse(body || "{}");
      } catch (e) {
        payload = null;
      }

      const report = extractCspReport(payload);
      let dir = "parse_error";
      let blocked = "-";
      let source = "-";
      let doc = "-";

      if (report && typeof report === "object") {
        const dirRaw =
          report.effectiveDirective ||
          report.violatedDirective ||
          report["effective-directive"] ||
          report["violated-directive"] ||
          "";
        const blockedRaw = report.blockedURI || report["blocked-uri"] || "";
        const sourceRaw = report.sourceFile || report["source-file"] || "";
        const docRaw = report.documentURI || report["document-uri"] || "";

        dir = String(dirRaw || "-");
        blocked = redactUrlValue(blockedRaw) || String(blockedRaw || "-");
        source = redactUrlValue(sourceRaw) || String(sourceRaw || "-");
        doc = redactUrlValue(docRaw) || String(docRaw || "-");
      }

      const key = `${dir}|${blocked}|${source}`;
      const entry = CSP_REPORT_BUCKET.get(key) || {
        count: 0,
        firstTs: ts,
        lastTs: ts,
      };
      entry.count += 1;
      entry.lastTs = ts;
      CSP_REPORT_BUCKET.set(key, entry);

      if (CSP_REPORT_BUCKET.size > CSP_REPORT_MAX) {
        let trimmed = 0;
        for (const k of CSP_REPORT_BUCKET.keys()) {
          CSP_REPORT_BUCKET.delete(k);
          trimmed += 1;
          if (trimmed >= CSP_REPORT_TRIM) break;
        }
      }

      if (shouldLogCspCount(entry.count)) {
        console.log(
          `CSP_REPORT count=${entry.count} dir=${dir} blocked=${blocked} source=${source} doc=${doc} ray=${cfRay} ua="${ua}"`
        );
      }

      const r = new Response("", { status: 204 });
      r.headers.set("Cache-Control", "no-store");
      r.headers.set("Content-Type", "text/plain; charset=utf-8");
      return stamp(r);
    }

    if (pathname === "/api/proxy") {
      const target = url.searchParams.get("url");
      if (!target) {
        const r = new Response("Missing url", { status: 400 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      let upstream;
      try {
        upstream = new URL(target);
      } catch (e) {
        const r = new Response("Invalid url", { status: 400 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      if (upstream.protocol !== "https:" && upstream.protocol !== "http:") {
        const r = new Response("Invalid protocol", { status: 400 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      const host = upstream.hostname || "";
      const allowlisted =
        host.endsWith(".bp.blogspot.com") ||
        host.endsWith(".googleusercontent.com");
      if (!allowlisted) {
        const r = new Response("Host not allowed", { status: 403 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      let upstreamRes;
      try {
        upstreamRes = await fetch(upstream.toString(), {
          method: "GET",
          headers: {
            "Accept": "image/*",
          },
        });
      } catch (e) {
        const r = new Response("Upstream fetch failed", { status: 502 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      if (!upstreamRes || !upstreamRes.ok) {
        const r = new Response("Upstream error", { status: 502 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      const contentType = upstreamRes.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        const r = new Response("Unsupported content", { status: 415 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      const headers = new Headers(upstreamRes.headers);
      headers.delete("access-control-allow-origin");
      headers.delete("access-control-allow-credentials");
      headers.delete("access-control-expose-headers");
      headers.delete("access-control-allow-methods");
      headers.delete("access-control-allow-headers");
      headers.delete("cross-origin-resource-policy");
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Cache-Control", "public, max-age=86400");

      const r = new Response(upstreamRes.body, { status: 200, headers });
      return stamp(r);
    }

    // Path yang memang kamu host di Workers Static Assets
    const shouldTryAssets =
      pathname.startsWith("/assets/") ||
      pathname.startsWith("/gg-pwa-icon/") ||
      pathname === "/sw.js" ||
      pathname === "/manifest.webmanifest" ||
      pathname === "/offline.html";

    // Reverse proxy Blogger untuk semua non-asset path.
    if (!shouldTryAssets) {
      const viewParam = url.searchParams.get("view");
      const redirectToBlog = () => {
        const dest = new URL(request.url);
        dest.pathname = "/blog";
        dest.searchParams.delete("view");
        dest.hash = "";
        const r = new Response(null, {
          status: 301,
          headers: {
            "Location": dest.toString(),
            "Cache-Control": "no-store",
          },
        });
        return stamp(r);
      };

      if ((pathname === "/" || pathname === "") && viewParam === "blog") {
        return redirectToBlog();
      }
      if (pathname === "/blog/" || (pathname === "/blog" && viewParam === "blog")) {
        return redirectToBlog();
      }

      let originRequest = request;
      let originUrl = new URL(request.url);
      let forceListing = false;

      if (pathname === "/blog" || pathname === "/blog/") {
        originUrl.pathname = "/";
        originUrl.searchParams.set("view", "blog");
        originRequest = new Request(originUrl.toString(), request);
        forceListing = true;
      }

      try {
        if (originUrl.searchParams.get("view") === "blog") forceListing = true;
      } catch (e) {}

      let originRes;
      try {
        originRes = await fetch(originRequest);
      } catch (e) {
        return stamp(new Response("Upstream fetch failed", { status: 502 }));
      }

      const contentType = originRes.headers.get("content-type") || "";
      if (contentType.indexOf("text/html") !== -1) {
        const flags = await loadFlags(env);
        const cspReportEnabled = flags.csp_report_enabled !== false;
        const publicUrl = new URL(request.url);
        publicUrl.pathname = "/blog";
        publicUrl.searchParams.delete("view");
        publicUrl.searchParams.delete("x");
        publicUrl.searchParams.delete("fbclid");
        publicUrl.searchParams.delete("gclid");
        publicUrl.searchParams.delete("msclkid");
        for (const key of Array.from(publicUrl.searchParams.keys())) {
          if (key.startsWith("utm_")) {
            publicUrl.searchParams.delete(key);
          }
        }
        publicUrl.hash = "";
        const canonicalPublic = `${publicUrl.origin}${publicUrl.pathname}`;
        const listingInject = [
          `<link rel="canonical" href="${canonicalPublic}">`,
          `<meta property="og:url" content="${canonicalPublic}">`,
          `<meta name="twitter:url" content="${canonicalPublic}">`,
        ].join("");
        const listingH1 = `<h1 class="gg-listing__title">Blog</h1>`;
        const meta = {
          ogType: "",
          ogTitle: "",
          ogDesc: "",
          ogImage: "",
          ogSiteName: "",
          desc: "",
          author: "",
          pub: "",
          mod: "",
          titleText: "",
          hasArticle: false,
          surface: "",
        };
        const assignMeta = (key, value) => {
          if (value) {
            meta[key] = value;
          }
        };
        const buildSchema = () => {
          const origin = new URL(request.url).origin;
          const pageUrl = cleanUrlForSchema(request.url, { forceBlog: forceListing });
          const siteName = (meta.ogSiteName || "").trim() || "pakrpp.com";
          const pageName =
            (meta.ogTitle || "").trim() ||
            (meta.titleText || "").trim() ||
            siteName;
          const pageDesc = (meta.ogDesc || "").trim() || (meta.desc || "").trim();
          const publisherName = (meta.author || "").trim() || "pakrpp";
          const ogImage = (meta.ogImage || "").trim();
          let imageUrl = "";
          if (ogImage) {
            try {
              imageUrl = new URL(ogImage, origin).toString();
            } catch (e) {
              imageUrl = "";
            }
          }
          const graph = [
            {
              "@type": "WebSite",
              "@id": `${origin}/#website`,
              url: `${origin}/`,
              name: siteName,
              inLanguage: "id-ID",
              potentialAction: {
                "@type": "SearchAction",
                target: `${origin}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "Person",
              "@id": `${origin}/#publisher`,
              name: publisherName,
              url: `${origin}/`,
            },
            {
              "@type": forceListing ? "CollectionPage" : "WebPage",
              "@id": `${pageUrl}#webpage`,
              url: pageUrl,
              name: pageName,
              description: pageDesc,
              isPartOf: { "@id": `${origin}/#website` },
              publisher: { "@id": `${origin}/#publisher` },
              inLanguage: "id-ID",
            },
          ];
          const ogType = (meta.ogType || "").trim().toLowerCase();
          const isPostSurface = meta.surface === "post";
          const isArticle =
            isPostSurface ||
            ogType === "article" ||
            !!meta.pub ||
            (!forceListing && meta.hasArticle);
          if (isArticle) {
            const blogPosting = {
              "@type": "BlogPosting",
              "@id": `${pageUrl}#blogposting`,
              mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
              url: pageUrl,
              headline: pageName,
              description: pageDesc,
              author: { "@id": `${origin}/#publisher` },
              publisher: { "@id": `${origin}/#publisher` },
              isPartOf: { "@id": `${origin}/#website` },
            };
            if (imageUrl) {
              blogPosting.image = [imageUrl];
            }
            if (meta.pub) {
              blogPosting.datePublished = meta.pub;
              if (meta.mod) {
                blogPosting.dateModified = meta.mod;
              } else {
                blogPosting.dateModified = meta.pub;
              }
            }
            graph.push(blogPosting);
          }
          return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
        };
        const rewritten = new HTMLRewriter()
          .on("meta[property=\"og:type\"]", {
            element(el) {
              assignMeta("ogType", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"og:title\"]", {
            element(el) {
              assignMeta("ogTitle", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"og:description\"]", {
            element(el) {
              assignMeta("ogDesc", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"og:image\"]", {
            element(el) {
              assignMeta("ogImage", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"og:site_name\"]", {
            element(el) {
              assignMeta("ogSiteName", el.getAttribute("content"));
            },
          })
          .on("meta[name=\"description\"]", {
            element(el) {
              assignMeta("desc", el.getAttribute("content"));
            },
          })
          .on("meta[name=\"author\"]", {
            element(el) {
              assignMeta("author", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"article:published_time\"]", {
            element(el) {
              assignMeta("pub", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"article:modified_time\"]", {
            element(el) {
              assignMeta("mod", el.getAttribute("content"));
            },
          })
          .on("title", {
            text(text) {
              meta.titleText += text.text;
            },
          })
          .on("article", {
            element() {
              meta.hasArticle = true;
            },
          })
          .on("script#gg-schema", {
            element(el) {
              el.remove();
            },
          })
          .on("body", {
            element(el) {
              meta.surface = (el.getAttribute("data-gg-surface") || "").trim();
              if (forceListing) {
                el.setAttribute("data-gg-surface", "listing");
              }
              const schemaJson = buildSchema();
              el.prepend(
                `<script id="gg-schema" type="application/ld+json">${schemaJson}</script>`,
                { html: true }
              );
            },
          });

        if (forceListing) {
          rewritten
            .on("section.gg-home-landing", {
              element(el) {
                el.remove();
              },
            })
            .on("main#gg-main h1", {
              element(el) {
                const className = el.getAttribute("class") || "";
                const isDisplay = className.split(/\s+/).includes("gg-display");
                if (isDisplay) {
                  el.replace('<p class="gg-display">Edited by pakrpp.</p>', {
                    html: true,
                  });
                  return;
                }
                el.remove();
              },
            })
            .on("main#gg-main", {
              element(el) {
                el.prepend(listingH1, { html: true });
              },
            })
          .on("link[rel=\"canonical\"]", {
            element(el) {
              el.remove();
            },
          })
          .on("meta[property=\"og:url\"]", {
            element(el) {
              el.remove();
            },
          })
          .on("meta[name=\"twitter:url\"]", {
            element(el) {
              el.remove();
            },
          })
            .on("head", {
              element(el) {
                el.append(listingInject, { html: true });
              },
            });
        }
        const transformed = rewritten.transform(originRes);
        return stamp(transformed, { cspReportEnabled });
      }

      return stamp(originRes);
    }

    if (!env.ASSETS) {
      return stamp(new Response("ASSETS binding missing", { status: 502 }));
    }

    let assetRes;
    try {
      assetRes = await env.ASSETS.fetch(request);
    } catch (e) {
      return stamp(new Response("ASSETS fetch failed", { status: 502 }));
    }

    // Jangan cache response error
    if (!assetRes.ok) {
      if (pathname === "/sw.js") {
        const r = new Response("sw.js missing in ASSETS", { status: 404 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      const r = new Response(assetRes.body, assetRes);
      r.headers.set("Cache-Control", "no-store");
      const errContentType = r.headers.get("content-type") || "";
      if (errContentType.toLowerCase().includes("text/html")) {
        const flags = await loadFlags(env);
        const cspReportEnabled = flags.csp_report_enabled !== false;
        return stamp(r, { cspReportEnabled });
      }
      return stamp(r);
    }

    const res = new Response(assetRes.body, assetRes);
    const setCache = (v) => res.headers.set("Cache-Control", v);

    if (pathname.startsWith("/assets/latest/")) {
      setCache("no-store, max-age=0");
      res.headers.set("Pragma", "no-cache");
    } else if (pathname.startsWith("/assets/v/")) {
      setCache("public, max-age=31536000, immutable");
    } else if (pathname === "/sw.js") {
      // SW harus gampang update
      setCache("no-store");
    } else if (pathname === "/manifest.webmanifest" || pathname === "/offline.html") {
      setCache("no-store");
    } else if (pathname.startsWith("/gg-pwa-icon/")) {
      setCache("public, max-age=31536000, immutable");
    } else {
      setCache("public, max-age=86400");
    }

    const assetContentType = res.headers.get("content-type") || "";
    if (assetContentType.toLowerCase().includes("text/html")) {
      const flags = await loadFlags(env);
      const cspReportEnabled = flags.csp_report_enabled !== false;
      return stamp(res, { cspReportEnabled });
    }
    return stamp(res);
  },
};
