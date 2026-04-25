/* worker.js — simplified Cloudflare Worker aligned to current PakRPP template freeze */

const FLAGS_TTL_MS = 60 * 1000;
let flagsCache = { ts: 0, value: null };

const DEFAULT_FLAGS = {
  sw: { enabled: true },
  csp_report_enabled: true,
  mode: "public",
};

const PUBLIC_STATIC_ROUTES = new Set([
  "/manifest.webmanifest",
  "/sw.js",
  "/offline.html",
  "/robots.txt",
  "/ads.txt",
  "/llms.txt",
  "/flags.json",
]);

const LANDING_PUBLIC_PATH = "/landing";
const LANDING_INTERNAL_PATH = "/landing.html";

function normalizeFlags(data) {
  const out = structuredClone(DEFAULT_FLAGS);
  if (!data || typeof data !== "object") return out;

  if (data.sw && typeof data.sw === "object" && typeof data.sw.enabled === "boolean") {
    out.sw.enabled = data.sw.enabled;
  }
  if (typeof data.csp_report_enabled === "boolean") {
    out.csp_report_enabled = data.csp_report_enabled;
  }
  if (typeof data.mode === "string" && data.mode.trim()) {
    out.mode = data.mode.trim().toLowerCase() === "lab" ? "lab" : "public";
  }

  for (const [key, value] of Object.entries(data)) {
    if (key === "sw" || key === "csp_report_enabled" || key === "mode") continue;
    out[key] = value;
  }
  return out;
}

async function loadFlags(env) {
  const now = Date.now();
  if (flagsCache.value && now - flagsCache.ts < FLAGS_TTL_MS) {
    return structuredClone(flagsCache.value);
  }

  let data = null;
  if (env?.ASSETS) {
    try {
      const req = new Request("https://assets.local/__gg/flags.json");
      const res = await env.ASSETS.fetch(req);
      if (res.ok) data = await res.json();
    } catch (_) {
      data = null;
    }
  }

  const flags = normalizeFlags(data);
  flagsCache = { ts: now, value: flags };
  return structuredClone(flags);
}

function withSecurityHeaders(resp, requestUrl, contentType, flags = DEFAULT_FLAGS) {
  const headers = new Headers(resp.headers);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=()"
  );
  headers.set("X-Frame-Options", "SAMEORIGIN");

  const isHtml = String(contentType || "").toLowerCase().includes("text/html");
  if (isHtml) {
    headers.set("X-Robots-Tag", flags.mode === "lab" ? "noindex, nofollow" : "index, follow");
  }

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  });
}

function isHtmlResponse(resp) {
  return String(resp.headers.get("content-type") || "").toLowerCase().includes("text/html");
}

function responseFromHtml(resp, html) {
  const headers = new Headers(resp.headers);
  headers.delete("content-length");
  return new Response(html, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  });
}

function normalizeLandingContactHtml(html) {
  // legacy migration kept from old worker, but simplified
  if (!html) return html;
  return String(html)
    .replaceAll("#gg-landing-hero-5", "#contact")
    .replace(/\bid=(['"])gg-landing-hero-5\1/gi, `id="contact"`);
}

function hasCurrentTemplateContract(html) {
  const source = String(html || "");

  const checks = {
    shell: /\bid\s*=\s*['"]gg-shell['"]/i.test(source),
    main: /\b<main\b[^>]*\bid\s*=\s*['"]main['"]/i.test(source),
    dock: /\bid\s*=\s*['"]gg-dock['"]/i.test(source),
    commandPanel: /\bid\s*=\s*['"]gg-command-panel['"]/i.test(source),
    previewSheet: /\bid\s*=\s*['"]gg-preview-sheet['"]/i.test(source),
    morePanel: /\bid\s*=\s*['"]gg-more-panel['"]/i.test(source),
  };

  const reasons = [];
  if (!checks.shell) reasons.push("missing_gg_shell");
  if (!checks.main) reasons.push("missing_main_landmark");
  if (!checks.dock) reasons.push("missing_dock");
  if (!checks.commandPanel) reasons.push("missing_command_panel");
  if (!checks.previewSheet) reasons.push("missing_preview_sheet");
  if (!checks.morePanel) reasons.push("missing_more_panel");

  return {
    ok: reasons.length === 0,
    reasons,
    checks,
  };
}

function annotateTemplateContract(resp, html) {
  const contract = hasCurrentTemplateContract(html);
  const headers = new Headers(resp.headers);
  headers.set("x-gg-template-contract", contract.ok ? "ok" : "mismatch");
  if (!contract.ok) {
    headers.set("x-gg-template-contract-reasons", contract.reasons.join(","));
  }

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  });
}

function shouldBypassHtmlMutation(pathname) {
  const path = String(pathname || "");
  if (!path) return false;

  if (/\.txt$/i.test(path)) return true;
  if (path.startsWith("/.well-known/")) return true;

  return false;
}

function shouldServeStaticFromAssets(pathname) {
  const path = String(pathname || "");
  if (!path) return false;

  if (PUBLIC_STATIC_ROUTES.has(path)) return true;
  if (path.startsWith("/gg-pwa-icon/")) return true;
  if (path.startsWith("/__gg/")) return true;
  if (path.startsWith("/assets/")) return true;

  return false;
}

async function serveFromAssets(request, env, pathname) {
  if (!env?.ASSETS) {
    return new Response("ASSETS binding missing", { status: 500 });
  }

  let assetPath = pathname;

  if (pathname === LANDING_PUBLIC_PATH) assetPath = LANDING_INTERNAL_PATH;
  if (pathname === "/flags.json") assetPath = "/__gg/flags.json";

  const url = new URL(request.url);
  url.pathname = assetPath;

  return env.ASSETS.fetch(new Request(url.toString(), request));
}

async function handleStaticRoutes(request, env, pathname) {
  if (pathname === LANDING_INTERNAL_PATH) {
    return Response.redirect(new URL(LANDING_PUBLIC_PATH, request.url).toString(), 301);
  }

  if (pathname === LANDING_PUBLIC_PATH) {
    return serveFromAssets(request, env, pathname);
  }

  if (shouldServeStaticFromAssets(pathname)) {
    return serveFromAssets(request, env, pathname);
  }

  return null;
}

async function handleCspReport(request) {
  // keep it minimal and cheap
  try {
    await request.text();
  } catch (_) {}
  return new Response(null, { status: 204 });
}

async function fetchOrigin(request) {
  // On Cloudflare custom-domain worker routes, this goes to origin.
  return fetch(request);
}

async function handleHtml(request, env, response) {
  const url = new URL(request.url);

  if (!isHtmlResponse(response)) return response;
  if (shouldBypassHtmlMutation(url.pathname)) return response;

  let html = "";
  try {
    html = await response.clone().text();
  } catch (_) {
    return response;
  }

  if (!html) return response;

  let out = html;

  // keep landing migration compatibility
  out = normalizeLandingContactHtml(out);

  let wrapped = responseFromHtml(response, out);
  wrapped = annotateTemplateContract(wrapped, out);

  const flags = await loadFlags(env);
  wrapped = withSecurityHeaders(
    wrapped,
    request.url,
    wrapped.headers.get("content-type") || "text/html; charset=UTF-8",
    flags
  );

  return wrapped;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/api/csp-report" && request.method === "POST") {
      return handleCspReport(request);
    }

    const staticResponse = await handleStaticRoutes(request, env, pathname);
    if (staticResponse) {
      const flags = await loadFlags(env);
      return withSecurityHeaders(
        staticResponse,
        request.url,
        staticResponse.headers.get("content-type") || "",
        flags
      );
    }

    const originResponse = await fetchOrigin(request);
    return handleHtml(request, env, originResponse);
  },
};