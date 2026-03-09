import fs from "fs";
import path from "path";
import vm from "vm";
import { spawnSync } from "child_process";

const root = process.cwd();
const CORE_MODULE_REL = "public/assets/latest/modules/ui.bucket.core.js";
const MAIN_CSS_REL = "public/assets/latest/main.css";
const TEMPLATE_REL = "index.prod.xml";

const results = [];

function pushResult(ok, key, detail) {
  const status = ok ? "PASS" : "FAIL";
  const msg = detail ? `${status} ${key} :: ${detail}` : `${status} ${key}`;
  results.push({ ok, key, detail: detail || "" });
  if (ok) console.log(msg);
  else console.error(msg);
}

function normalizeLines(text, limit = 6) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.slice(0, limit).join(" | ");
}

function runNodeScript(rel) {
  const abs = path.join(root, rel);
  const out = spawnSync(process.execPath, [abs], {
    cwd: root,
    encoding: "utf8",
  });
  const stdout = String(out.stdout || "");
  const stderr = String(out.stderr || "");
  return {
    code: out.status === null ? 1 : out.status,
    output: `${stdout}${stderr}`.trim(),
  };
}

function lineMatch(output, re) {
  const m = String(output || "").match(re);
  return m ? m[1] || m[0] : "";
}

function verifyPanelSurfaces() {
  const core = runNodeScript("tools/verify-runtime-core-features.mjs");
  if (core.code !== 0) {
    pushResult(false, "PANEL_RUNTIME_HARNESS_CORE", normalizeLines(core.output));
    return;
  }
  pushResult(true, "PANEL_RUNTIME_HARNESS_CORE", "verify-runtime-core-features.mjs PASS");

  const metaLine = lineMatch(
    core.output,
    /RUNTIME right\/sidebar metadata panel: PASS :: ([^\n]+)/m
  );
  if (!metaLine) {
    pushResult(false, "BLOG_RIGHT_METADATA_PANEL", "missing PASS marker in core runtime output");
  } else {
    pushResult(true, "BLOG_RIGHT_METADATA_PANEL", metaLine);
  }

  const toolbarLine = lineMatch(core.output, /RUNTIME toolbar: PASS :: ([^\n]+)/m);
  if (!toolbarLine) {
    pushResult(false, "POSTPAGE_TOOLBAR_PANEL_BRIDGE", "missing toolbar PASS marker");
  } else {
    const leftOk = /\bleft=open\b/.test(toolbarLine);
    const rightOk = /\bright=open\b/.test(toolbarLine);
    const commentsOk = /\bmode=comments\b/.test(toolbarLine);
    pushResult(
      leftOk,
      "POSTPAGE_LEFT_INFO_PANEL",
      leftOk ? toolbarLine : `toolbar evidence missing left=open :: ${toolbarLine}`
    );
    pushResult(
      rightOk && commentsOk,
      "POSTPAGE_RIGHT_COMMENTS_PANEL_FROM_TOOLBAR",
      rightOk && commentsOk
        ? toolbarLine
        : `toolbar evidence must include right=open + mode=comments :: ${toolbarLine}`
    );
  }

  const secondary = runNodeScript("tools/verify-runtime-secondary-features.mjs");
  if (secondary.code !== 0) {
    pushResult(false, "PANEL_RUNTIME_HARNESS_SECONDARY", normalizeLines(secondary.output));
    return;
  }
  pushResult(true, "PANEL_RUNTIME_HARNESS_SECONDARY", "verify-runtime-secondary-features.mjs PASS");
  const labelOk = /PASS \[VERIFIED BY HARNESS\] LABEL_TREE_INTERACTIONS/.test(secondary.output);
  pushResult(
    labelOk,
    "BLOG_LEFT_LABEL_TREE",
    labelOk ? "LABEL_TREE_INTERACTIONS marker detected" : "missing LABEL_TREE_INTERACTIONS PASS marker"
  );
}

class FakeClassList {
  constructor() {
    this._set = new Set();
  }

  add(...items) {
    items.forEach((item) => {
      if (item) this._set.add(String(item));
    });
  }

  contains(item) {
    return this._set.has(String(item));
  }
}

class FakeElement {
  constructor(tag = "div") {
    this.tagName = String(tag || "div").toUpperCase();
    this.attrs = Object.create(null);
    this.children = [];
    this.parentNode = null;
    this.hidden = false;
    this.style = { setProperty() {} };
    this.offsetParent = {};
    this.classList = new FakeClassList();
    this._listeners = Object.create(null);
    this._text = "";
    this._queryOne = new Map();
    this._queryAll = new Map();
  }

  set textContent(value) {
    this._text = String(value || "");
  }

  get textContent() {
    return this._text;
  }

  setAttribute(name, value) {
    this.attrs[String(name)] = String(value);
  }

  getAttribute(name) {
    const key = String(name);
    return Object.prototype.hasOwnProperty.call(this.attrs, key) ? this.attrs[key] : null;
  }

  removeAttribute(name) {
    delete this.attrs[String(name)];
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  removeChild(node) {
    const idx = this.children.indexOf(node);
    if (idx >= 0) this.children.splice(idx, 1);
    if (node) node.parentNode = null;
    return node;
  }

  addEventListener(type, fn) {
    const key = String(type);
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
  }

  contains(node) {
    if (!node) return false;
    if (node === this) return true;
    return this.children.some((child) => child && typeof child.contains === "function" && child.contains(node));
  }

  querySelector(selector) {
    const key = String(selector);
    if (this._queryOne.has(key)) return this._queryOne.get(key);
    return null;
  }

  querySelectorAll(selector) {
    const key = String(selector);
    if (this._queryAll.has(key)) return this._queryAll.get(key);
    if (key === '[data-gg-more-origin="footer"]') {
      return this.children.filter(
        (child) => child && child.getAttribute && child.getAttribute("data-gg-more-origin") === "footer"
      );
    }
    return [];
  }

  closest(selector) {
    const key = String(selector);
    if (key === '[data-gg-action="more-close"]' && this.getAttribute("data-gg-action") === "more-close") {
      return this;
    }
    if (
      key === '[data-gg-more-action="install"]' &&
      this.getAttribute("data-gg-more-action") === "install"
    ) {
      return this;
    }
    if (this.parentNode && typeof this.parentNode.closest === "function") {
      return this.parentNode.closest(key);
    }
    return null;
  }

  focus() {}

  scrollIntoView() {
    this._scrolled = true;
  }
}

function extractDockModuleSnippet(source) {
  const start = source.indexOf("GG.modules.Dock = (function () {");
  if (start < 0) return "";
  const end = source.indexOf("\n})();\n\n(function(){", start);
  if (end < 0) return "";
  return source.slice(start, end + "\n})();".length);
}

function buildStateService() {
  function states(el) {
    const raw = (el && el.getAttribute ? el.getAttribute("data-gg-state") || "" : "").trim();
    return raw ? raw.split(/\s+/).filter(Boolean) : [];
  }
  function write(el, list) {
    if (!el || !el.setAttribute) return;
    if (!list.length) {
      el.removeAttribute("data-gg-state");
      return;
    }
    el.setAttribute("data-gg-state", list.join(" "));
  }
  return {
    add(el, state) {
      const next = states(el);
      if (!next.includes(state)) next.push(state);
      write(el, next);
    },
    remove(el, state) {
      write(
        el,
        states(el).filter((item) => item !== state)
      );
    },
    has(el, state) {
      return states(el).includes(state);
    },
    toggle(el, state, force) {
      if (force === true) return this.add(el, state);
      if (force === false) return this.remove(el, state);
      if (this.has(el, state)) this.remove(el, state);
      else this.add(el, state);
    },
  };
}

function verifyLandingDockRuntime() {
  const coreSource = fs.readFileSync(path.join(root, CORE_MODULE_REL), "utf8");
  const dockSnippet = extractDockModuleSnippet(coreSource);
  if (!dockSnippet) {
    pushResult(false, "LANDING_DOCK_RUNTIME_SNIPPET", "failed to extract GG.modules.Dock snippet");
    return;
  }

  const contactTarget = new FakeElement("section");
  const morePanel = new FakeElement("section");
  morePanel.setAttribute("id", "gg-dock-more");
  morePanel.hidden = true;
  morePanel.setAttribute("aria-hidden", "true");
  const moreList = new FakeElement("ul");
  moreList.classList.add("gg-dock-more__list");
  morePanel._queryOne.set(".gg-dock-more__list", moreList);
  const moreClose = new FakeElement("a");
  moreClose.setAttribute("data-gg-action", "more-close");
  morePanel._queryOne.set('[data-gg-action="more-close"]', moreClose);
  morePanel.appendChild(moreList);

  const footerSocial = new FakeElement("div");
  footerSocial.classList.add("gg-footer__social");

  const aiTitle = new FakeElement("p");
  aiTitle.classList.add("gg-footer__social-title");
  aiTitle.textContent = "AI Summary";
  const aiCluster = new FakeElement("div");
  aiCluster.classList.add("gg-footer__cluster");
  const aiLink = new FakeElement("a");
  aiLink.classList.add("gg-footer__social-link");
  aiLink.setAttribute("href", "#");
  aiLink.setAttribute("aria-label", "Minta ringkasan via ChatGPT");
  aiCluster._queryAll.set(".gg-footer__social-links a.gg-footer__social-link", [aiLink]);
  aiTitle.nextElementSibling = aiCluster;

  const payTitle = new FakeElement("p");
  payTitle.classList.add("gg-footer__social-title");
  payTitle.textContent = "Payment";
  const payCluster = new FakeElement("div");
  payCluster.classList.add("gg-footer__cluster");
  const payLink = new FakeElement("a");
  payLink.classList.add("gg-footer__social-link");
  payLink.setAttribute("href", "/p/pay.html#paypal");
  payLink.setAttribute("aria-label", "Pembayaran PayPal");
  payCluster._queryAll.set(".gg-footer__social-links a.gg-footer__social-link", [payLink]);
  payTitle.nextElementSibling = payCluster;

  footerSocial._queryAll.set(".gg-footer__social-title", [aiTitle, payTitle]);

  const installButton = new FakeElement("button");
  installButton.setAttribute("id", "install");
  installButton.setAttribute("aria-label", "Add to your devices");
  let installClicks = 0;
  installButton.click = function clickInstall() {
    installClicks += 1;
  };

  const document = {
    body: new FakeElement("body"),
    documentElement: new FakeElement("html"),
    activeElement: null,
    createElement: (tag) => new FakeElement(tag),
    addEventListener() {},
    querySelector(selector) {
      if (selector === "#gg-landing-hero-5") return contactTarget;
      if (selector === ".gg-footer__social") return footerSocial;
      return null;
    },
    getElementById(id) {
      if (id === "gg-dock-more") return morePanel;
      if (id === "install") return installButton;
      return null;
    },
  };

  const windowObj = {
    GG_DEBUG: false,
    location: { hash: "", pathname: "/", search: "" },
    history: {
      state: null,
      pushState() {},
      replaceState() {},
    },
    pageYOffset: 0,
    addEventListener() {},
    dispatchEvent() {},
    requestAnimationFrame(cb) {
      if (typeof cb === "function") cb();
      return 1;
    },
    cancelAnimationFrame() {},
    MutationObserver: function MutationObserver() {
      this.observe = function observe() {};
    },
    CustomEvent: function CustomEvent(type, init) {
      this.type = type;
      this.detail = init ? init.detail : null;
    },
  };

  const GG = {
    modules: {
      homeState: {
        setState() {},
      },
    },
    util: {
      homeRouter: {
        isHomeRoute() {
          return true;
        },
        pushState() {},
      },
    },
    services: {
      a11y: {
        scrollBehavior() {
          return "auto";
        },
      },
    },
    core: {
      state: buildStateService(),
      router: {
        go() {},
      },
      blogHomePath() {
        return "/blog";
      },
    },
  };

  const dock = new FakeElement("nav");
  dock.setAttribute("data-home-url", "/");
  dock.setAttribute("data-search-url", "/search");
  const searchInput = new FakeElement("input");
  const searchForm = new FakeElement("form");
  searchForm.appendChild(searchInput);
  dock._queryOne.set(".gg-dock__search input", searchInput);
  dock._queryOne.set(".gg-dock__search form", searchForm);
  dock._queryOne.set('[data-gg-action="search-exit"]', null);
  dock._queryAll.set(".gg-dock__item[data-gg-action]", [new FakeElement("a"), new FakeElement("a"), new FakeElement("a")]);
  const main = new FakeElement("main");
  main.setAttribute("data-gg-home-state", "blog");

  const context = vm.createContext({
    window: windowObj,
    document,
    GG,
    history: windowObj.history,
    location: windowObj.location,
    MutationObserver: windowObj.MutationObserver,
    requestAnimationFrame: windowObj.requestAnimationFrame,
    cancelAnimationFrame: windowObj.cancelAnimationFrame,
    CustomEvent: windowObj.CustomEvent,
    getComputedStyle() {
      return { display: "block", visibility: "visible" };
    },
    setTimeout,
    clearTimeout,
    console,
  });
  windowObj.GG = GG;
  vm.runInContext(dockSnippet, context, { filename: "dock-runtime-surface.mjs" });
  if (!GG.modules.Dock || typeof GG.modules.Dock.init !== "function") {
    pushResult(false, "LANDING_DOCK_RUNTIME_INIT", "GG.modules.Dock.init unavailable");
    return;
  }
  GG.modules.Dock.init(dock, main);

  const contactOk = !!GG.modules.Dock.replayAction({
    action: "contact",
    anchor: "#gg-landing-hero-5",
    href: "/#gg-landing-hero-5",
  });
  pushResult(
    contactOk && !!contactTarget._scrolled,
    "LANDING_DOCK_CONTACT_INTENT",
    `handled=${contactOk} scrolled=${!!contactTarget._scrolled}`
  );

  const searchOk = !!GG.modules.Dock.replayAction({
    action: "search",
    anchor: "",
    href: "/search",
  });
  const searchActive = GG.core.state.has(dock, "search");
  pushResult(
    searchOk && searchActive,
    "LANDING_DOCK_SEARCH_INTENT",
    `handled=${searchOk} searchState=${searchActive}`
  );

  const moreOk = !!GG.modules.Dock.replayAction({
    action: "more",
    anchor: "",
    href: "#gg-dock-more",
  });
  const footerItems = moreList.querySelectorAll('[data-gg-more-origin="footer"]');
  const labels = footerItems
    .map((item) => (item.children[0] && item.children[0].textContent ? item.children[0].textContent : "").trim())
    .filter(Boolean);
  const hasAi = labels.some((item) => /^AI Summary\b/i.test(item));
  const hasPayment = labels.some((item) => /^Payment\b/i.test(item));
  const hasInstall = labels.some((item) => /add to your devices/i.test(item));
  pushResult(
    moreOk && morePanel.hidden === false && hasAi && hasPayment && hasInstall,
    "LANDING_DOCK_MORE_DRAWER_CONTENT",
    `open=${moreOk && morePanel.hidden === false} ai=${hasAi} payment=${hasPayment} install=${hasInstall}`
  );

  const installAnchor = footerItems
    .map((item) => item.children[0])
    .find((node) => node && node.getAttribute && node.getAttribute("data-gg-more-action") === "install");
  const clickHandlers = morePanel._listeners.click || [];
  if (installAnchor && clickHandlers.length) {
    clickHandlers[0]({
      target: installAnchor,
      preventDefault() {},
      stopPropagation() {},
      stopImmediatePropagation() {},
    });
  }
  pushResult(
    installClicks > 0,
    "LANDING_DOCK_MORE_INSTALL_ACTION",
    `installClicks=${installClicks}`
  );
}

function verifyLandingViewportFit() {
  const template = fs.readFileSync(path.join(root, TEMPLATE_REL), "utf8");
  const css = fs.readFileSync(path.join(root, MAIN_CSS_REL), "utf8");
  const requiredSections = [
    "gg-landing-hero",
    "gg-landing-pillars",
    "gg-landing-hero-3",
    "gg-landing-pillars-4",
    "gg-landing-hero-5",
  ];
  const missing = requiredSections.filter(
    (id) => !new RegExp(`<section\\b[^>]*id=['"]${id}['"]`, "i").test(template)
  );
  const viewportRule =
    /main\.gg-main:is\(\[data-gg-surface="landing"\],\[data-gg-surface="home"\],\[data-gg-view="home"\]\)\[data-gg-home-state="landing"\]\s+#gg-landing>\.gg-section\s*\{[\s\S]*?min-height:100dvh;/m.test(
      css
    );
  pushResult(
    missing.length === 0 && viewportRule,
    "LANDING_SECTION_VIEWPORT_FIT",
    `sections=${requiredSections.length - missing.length}/${requiredSections.length} viewportRule=${viewportRule}`
  );
}

function printE2ENotes() {
  const notes = [
    "True mobile browser viewport chrome behavior (URL bar collapse/expand).",
    "Cross-browser smooth scroll timing and anchoring differences.",
    "Delayed JS boot race on real network with real navigation stack/history.",
  ];
  notes.forEach((note) => console.log(`INFO E2E_REQUIRED :: ${note}`));
}

function main() {
  verifyPanelSurfaces();
  verifyLandingDockRuntime();
  verifyLandingViewportFit();
  printE2ENotes();

  const failures = results.filter((row) => !row.ok);
  if (failures.length) {
    console.error(`VERIFY_RUNTIME_SURFACE_LANDING_PANELS: FAIL (${failures.length} area(s))`);
    process.exit(1);
  }
  console.log(`VERIFY_RUNTIME_SURFACE_LANDING_PANELS: PASS (${results.length} checks)`);
}

main();
