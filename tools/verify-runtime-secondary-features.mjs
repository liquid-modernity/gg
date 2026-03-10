import fs from "fs";
import path from "path";
import vm from "vm";

const root = process.cwd();
const CORE_REL = "public/assets/latest/modules/ui.bucket.core.js";
const LISTING_REL = "public/assets/latest/modules/ui.bucket.listing.js";

function readText(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    throw new Error(`missing file: ${rel}`);
  }
  return fs.readFileSync(abs, "utf8");
}

function splitOutside(input, delimiterChar) {
  const out = [];
  let buf = "";
  let quote = "";
  let bracket = 0;
  let paren = 0;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const prev = input[i - 1];
    if (quote) {
      buf += ch;
      if (ch === quote && prev !== "\\") quote = "";
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === "[") bracket += 1;
    if (ch === "]" && bracket > 0) bracket -= 1;
    if (ch === "(") paren += 1;
    if (ch === ")" && paren > 0) paren -= 1;
    if (ch === delimiterChar && bracket === 0 && paren === 0) {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function splitBySpace(selector) {
  const out = [];
  let buf = "";
  let quote = "";
  let bracket = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const ch = selector[i];
    const prev = selector[i - 1];
    if (quote) {
      buf += ch;
      if (ch === quote && prev !== "\\") quote = "";
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === "[") bracket += 1;
    if (ch === "]" && bracket > 0) bracket -= 1;
    if (/\s/.test(ch) && bracket === 0) {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function normalizeSelector(selector) {
  return String(selector || "")
    .replace(/:not\([^)]*\)/g, "")
    .replace(/:[a-z-]+(?:\([^)]*\))?/gi, "")
    .trim();
}

class MockStyle {
  constructor() {
    this._props = Object.create(null);
    this.display = "";
    this.visibility = "";
  }

  setProperty(name, value) {
    this._props[String(name)] = String(value);
  }

  getPropertyValue(name) {
    const key = String(name);
    if (Object.prototype.hasOwnProperty.call(this._props, key)) return this._props[key];
    if (key === "display") return this.display || "";
    if (key === "visibility") return this.visibility || "";
    return "";
  }
}

class MockClassList {
  constructor(el) {
    this.el = el;
  }

  _set() {
    const raw = String(this.el.className || "").trim();
    return new Set(raw ? raw.split(/\s+/).filter(Boolean) : []);
  }

  _write(set) {
    this.el.className = Array.from(set).join(" ");
    this.el.setAttribute("class", this.el.className);
  }

  add(...names) {
    const set = this._set();
    names.forEach((n) => {
      if (n) set.add(String(n));
    });
    this._write(set);
  }

  remove(...names) {
    const set = this._set();
    names.forEach((n) => set.delete(String(n)));
    this._write(set);
  }

  contains(name) {
    return this._set().has(String(name));
  }

  toggle(name, force) {
    const set = this._set();
    const key = String(name);
    const on = force === undefined ? !set.has(key) : !!force;
    if (on) set.add(key);
    else set.delete(key);
    this._write(set);
    return on;
  }
}

let __idCounter = 0;

class MockElement {
  constructor(tagName, attrs = {}, ownerDocument = null) {
    __idCounter += 1;
    this.__mockId = __idCounter;
    this.nodeType = 1;
    this.tagName = String(tagName || "div").toUpperCase();
    this.ownerDocument = ownerDocument || null;
    this.parentElement = null;
    this.children = [];
    this.hidden = false;
    this.style = new MockStyle();
    this._attrs = Object.create(null);
    this._listeners = Object.create(null);
    this._text = "";
    this.className = "";
    this.classList = new MockClassList(this);
    const dataKey = (prop) => `data-${String(prop).replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
    this.dataset = new Proxy(
      {},
      {
        get: (_, prop) => this.getAttribute(dataKey(prop)) || undefined,
        set: (_, prop, value) => {
          this.setAttribute(dataKey(prop), value);
          return true;
        },
      }
    );
    Object.entries(attrs || {}).forEach(([k, v]) => this.setAttribute(k, v));
  }

  get parentNode() {
    return this.parentElement;
  }

  get id() {
    return this.getAttribute("id") || "";
  }

  set id(value) {
    this.setAttribute("id", value);
  }

  get href() {
    return this.getAttribute("href") || "";
  }

  set href(value) {
    this.setAttribute("href", value);
  }

  get textContent() {
    const childText = this.children.map((c) => c.textContent || "").join("");
    return `${this._text || ""}${childText}`;
  }

  set textContent(value) {
    this._text = String(value || "");
    this.children = [];
  }

  get offsetParent() {
    const style = this.ownerDocument ? this.ownerDocument.defaultView.getComputedStyle(this) : null;
    const display = style ? style.display : this.style.display || "block";
    const vis = style ? style.visibility : this.style.visibility || "visible";
    if (this.hidden || display === "none" || vis === "hidden") return null;
    return {};
  }

  appendChild(child) {
    if (!child) return child;
    if (child.parentElement) {
      child.parentElement.removeChild(child);
    }
    child.parentElement = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      child.parentElement = null;
    }
    return child;
  }

  insertBefore(next, ref) {
    if (!ref) return this.appendChild(next);
    const idx = this.children.indexOf(ref);
    if (idx < 0) return this.appendChild(next);
    if (next.parentElement) next.parentElement.removeChild(next);
    next.parentElement = this;
    next.ownerDocument = this.ownerDocument;
    this.children.splice(idx, 0, next);
    return next;
  }

  setAttribute(name, value) {
    const key = String(name).toLowerCase();
    const val = String(value);
    this._attrs[key] = val;
    if (key === "class") this.className = val;
    if (key === "hidden") this.hidden = true;
  }

  getAttribute(name) {
    const key = String(name).toLowerCase();
    if (Object.prototype.hasOwnProperty.call(this._attrs, key)) return this._attrs[key];
    return null;
  }

  hasAttribute(name) {
    return this.getAttribute(name) !== null;
  }

  removeAttribute(name) {
    const key = String(name).toLowerCase();
    delete this._attrs[key];
    if (key === "class") this.className = "";
    if (key === "hidden") this.hidden = false;
  }

  addEventListener(type, handler) {
    const key = String(type);
    this._listeners[key] = this._listeners[key] || [];
    this._listeners[key].push(handler);
  }

  dispatchEvent(event) {
    const evt = event || {};
    evt.type = String(evt.type || "");
    if (!evt.type) return true;
    if (!evt.target) evt.target = this;
    if (typeof evt.preventDefault !== "function") {
      evt.defaultPrevented = false;
      evt.preventDefault = function () {
        this.defaultPrevented = true;
      };
    }
    if (typeof evt.stopPropagation !== "function") evt.stopPropagation = function () {};
    if (typeof evt.stopImmediatePropagation !== "function") evt.stopImmediatePropagation = function () {};
    const list = (this._listeners[evt.type] || []).slice();
    for (let i = 0; i < list.length; i += 1) {
      evt.currentTarget = this;
      list[i].call(this, evt);
    }
    return !evt.defaultPrevented;
  }

  focus() {
    if (this.ownerDocument) this.ownerDocument.activeElement = this;
  }

  contains(node) {
    if (!node) return false;
    if (node === this) return true;
    for (let i = 0; i < this.children.length; i += 1) {
      if (this.children[i].contains(node)) return true;
    }
    return false;
  }

  matches(selector) {
    const raw = normalizeSelector(selector);
    if (!raw) return false;
    const list = splitOutside(raw, ",");
    for (let i = 0; i < list.length; i += 1) {
      if (matchComplexSelector(this, list[i])) return true;
    }
    return false;
  }

  closest(selector) {
    let node = this;
    while (node) {
      if (node.matches && node.matches(selector)) return node;
      node = node.parentElement;
    }
    return null;
  }

  querySelector(selector) {
    const found = this.querySelectorAll(selector);
    return found.length ? found[0] : null;
  }

  querySelectorAll(selector) {
    const out = [];
    const all = [];
    walkDescendants(this, all);
    const selectors = splitOutside(normalizeSelector(selector), ",");
    all.forEach((node) => {
      for (let i = 0; i < selectors.length; i += 1) {
        if (matchComplexSelector(node, selectors[i])) {
          out.push(node);
          break;
        }
      }
    });
    return out;
  }
}

class MockDocument extends MockElement {
  constructor() {
    super("#document", {}, null);
    this.nodeType = 9;
    this.ownerDocument = this;
    this.defaultView = null;
    this.readyState = "complete";
    this.documentElement = new MockElement("html", {}, this);
    this.body = new MockElement("body", {}, this);
    this.documentElement.appendChild(this.body);
    this.children = [this.documentElement];
    this.activeElement = this.body;
  }

  createElement(tagName) {
    return new MockElement(tagName, {}, this);
  }

  getElementById(id) {
    if (!id) return null;
    const all = [];
    walkDescendants(this, all, true);
    for (let i = 0; i < all.length; i += 1) {
      const node = all[i];
      if (node.getAttribute && node.getAttribute("id") === String(id)) return node;
    }
    return null;
  }
}

function walkDescendants(rootNode, out, includeSelf = false) {
  if (!rootNode) return;
  if (includeSelf) out.push(rootNode);
  const kids = rootNode.children || [];
  for (let i = 0; i < kids.length; i += 1) {
    out.push(kids[i]);
    walkDescendants(kids[i], out, false);
  }
}

function parseAttrToken(token) {
  const t = String(token || "").trim();
  const m = t.match(/^([^\s~|^$*!=]+)\s*=\s*(.+)$/);
  if (!m) return { name: t.toLowerCase(), op: "exists", value: "" };
  const rawValue = String(m[2] || "").trim().replace(/^['"]|['"]$/g, "");
  return { name: String(m[1] || "").toLowerCase(), op: "=", value: rawValue };
}

function matchesSimpleSelector(node, simpleSelector) {
  const sel = normalizeSelector(simpleSelector);
  if (!sel || !node || !node.getAttribute) return false;
  let work = sel;
  const attrs = [];
  work = work.replace(/\[([^\]]+)\]/g, (_, inner) => {
    attrs.push(parseAttrToken(inner));
    return "";
  });
  let id = "";
  work = work.replace(/#([a-z0-9_-]+)/gi, (_, v) => {
    id = v;
    return "";
  });
  const classes = [];
  work = work.replace(/\.([a-z0-9_-]+)/gi, (_, v) => {
    classes.push(v);
    return "";
  });
  const tag = work.trim();
  if (tag && tag !== "*" && node.tagName.toLowerCase() !== tag.toLowerCase()) return false;
  if (id && (node.getAttribute("id") || "") !== id) return false;
  for (let i = 0; i < classes.length; i += 1) {
    if (!node.classList.contains(classes[i])) return false;
  }
  for (let i = 0; i < attrs.length; i += 1) {
    const { name, op, value } = attrs[i];
    const got = node.getAttribute(name);
    if (op === "exists") {
      if (got === null) return false;
    } else if (op === "=") {
      if (String(got || "") !== value) return false;
    }
  }
  return true;
}

function matchComplexSelector(node, selector) {
  const parts = splitBySpace(selector);
  if (!parts.length) return false;
  function walkMatch(currentNode, partIndex) {
    if (!currentNode) return false;
    if (!matchesSimpleSelector(currentNode, parts[partIndex])) return false;
    if (partIndex === 0) return true;
    let parent = currentNode.parentElement;
    while (parent) {
      if (walkMatch(parent, partIndex - 1)) return true;
      parent = parent.parentElement;
    }
    return false;
  }
  return walkMatch(node, parts.length - 1);
}

class MockMutationObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  disconnect() {}
}

class MockEvent {
  constructor(type, init = {}) {
    this.type = String(type || "");
    this.bubbles = init.bubbles !== false;
    this.cancelable = init.cancelable !== false;
    this.detail = init.detail;
    this.key = init.key || "";
    this.defaultPrevented = false;
    this.target = init.target || null;
    this.currentTarget = null;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {}
  stopImmediatePropagation() {}
}

function createRuntimeContext(startUrl = "https://www.pakrpp.com/blog") {
  const document = new MockDocument();
  let internalUrl = new URL(startUrl);
  const listeners = Object.create(null);
  const timer = {
    setTimeout: (...args) => setTimeout(...args),
    clearTimeout: (...args) => clearTimeout(...args),
  };

  const location = {
    get href() {
      return internalUrl.toString();
    },
    set href(value) {
      internalUrl = new URL(String(value || ""), internalUrl.toString());
    },
    get hash() {
      return internalUrl.hash;
    },
    set hash(value) {
      const next = String(value || "");
      internalUrl.hash = next ? (next.startsWith("#") ? next : `#${next}`) : "";
    },
    get pathname() {
      return internalUrl.pathname;
    },
    get search() {
      return internalUrl.search;
    },
    get origin() {
      return internalUrl.origin;
    },
    toString() {
      return internalUrl.toString();
    },
  };

  const history = {
    state: null,
    replaceState(state, _title, url) {
      this.state = state || null;
      if (url !== undefined && url !== null && String(url)) {
        location.href = new URL(String(url), location.href).toString();
      }
    },
    pushState(state, _title, url) {
      this.state = state || null;
      if (url !== undefined && url !== null && String(url)) {
        location.href = new URL(String(url), location.href).toString();
      }
    },
  };

  const window = {
    document,
    location,
    history,
    console,
    pageYOffset: 0,
    innerHeight: 800,
    setTimeout: timer.setTimeout,
    clearTimeout: timer.clearTimeout,
    requestAnimationFrame(cb) {
      return timer.setTimeout(() => cb(Date.now()), 0);
    },
    cancelAnimationFrame(id) {
      timer.clearTimeout(id);
    },
    addEventListener(type, handler) {
      const key = String(type);
      listeners[key] = listeners[key] || [];
      listeners[key].push(handler);
    },
    removeEventListener(type, handler) {
      const key = String(type);
      const list = listeners[key] || [];
      listeners[key] = list.filter((fn) => fn !== handler);
    },
    dispatchEvent(evt) {
      const event = evt || {};
      event.type = String(event.type || "");
      if (!event.type) return true;
      if (!event.target) event.target = window;
      const list = (listeners[event.type] || []).slice();
      list.forEach((fn) => {
        event.currentTarget = window;
        fn.call(window, event);
      });
      return true;
    },
    getComputedStyle(el) {
      const display = el.hidden ? "none" : el.style.display || "block";
      const visibility = el.hidden ? "hidden" : el.style.visibility || "visible";
      return {
        display,
        visibility,
        getPropertyValue(name) {
          return el.style.getPropertyValue(name);
        },
      };
    },
    MutationObserver: MockMutationObserver,
    Event: MockEvent,
    CustomEvent: MockEvent,
    localStorage: {
      _store: Object.create(null),
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(this._store, key) ? this._store[key] : null;
      },
      setItem(key, value) {
        this._store[key] = String(value);
      },
      removeItem(key) {
        delete this._store[key];
      },
    },
    navigator: { clipboard: { writeText: async () => {} } },
    GG_DEBUG: false,
  };

  document.defaultView = window;

  const GG = {
    modules: {},
    store: { config: {} },
    core: {
      blogHomePath() {
        return "/blog";
      },
      router: {
        _calls: [],
        go(url) {
          this._calls.push(String(url || ""));
        },
      },
      state: {
        add(el, token) {
          if (!el) return;
          el.__stateSet = el.__stateSet || new Set();
          el.__stateSet.add(String(token));
          el.setAttribute("data-gg-state", Array.from(el.__stateSet).join(" "));
        },
        remove(el, token) {
          if (!el) return;
          el.__stateSet = el.__stateSet || new Set();
          el.__stateSet.delete(String(token));
          const joined = Array.from(el.__stateSet).join(" ");
          if (joined) el.setAttribute("data-gg-state", joined);
          else el.removeAttribute("data-gg-state");
        },
        toggle(el, token, on) {
          if (on) this.add(el, token);
          else this.remove(el, token);
        },
        has(el, token) {
          return !!(el && el.__stateSet && el.__stateSet.has(String(token)));
        },
      },
    },
    util: {
      homeRouter: {
        isHomeRoute() {
          return false;
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
      api: {
        getFeed: async () => ({ feed: { entry: [], "openSearch$totalResults": { $t: "0" } } }),
      },
    },
  };

  const qsa = (selector, scope) => {
    const host = scope || document;
    const sel = String(selector || "").trim();
    const childWidgetHas = sel.match(/^:scope\s*>\s*\.widget\s*:has\(([\s\S]+)\)$/);
    if (childWidgetHas) {
      const needle = String(childWidgetHas[1] || "").trim();
      return (host.children || []).filter((child) => child.matches(".widget") && !!child.querySelector(needle));
    }
    if (/^:scope\s*>\s*\.widget$/.test(sel)) {
      return (host.children || []).filter((child) => child.matches(".widget"));
    }
    return Array.from(host.querySelectorAll(sel));
  };
  const qs = (selector, scope) => {
    const found = qsa(selector, scope);
    return found.length ? found[0] : null;
  };

  window.GG = GG;
  window.GG_BOOT = {};

  const context = {
    console,
    window,
    document,
    GG,
    location,
    history,
    localStorage: window.localStorage,
    MutationObserver: window.MutationObserver,
    Event: window.Event,
    CustomEvent: window.CustomEvent,
    URL,
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    setTimeout: window.setTimeout,
    clearTimeout: window.clearTimeout,
    getComputedStyle: window.getComputedStyle,
    navigator: window.navigator,
    qs,
    qsa,
    w: window,
    d: document,
  };
  context.globalThis = context;
  context.window.window = context.window;
  context.window.location = location;
  context.window.history = history;
  context.window.getComputedStyle = window.getComputedStyle;
  context.window.requestAnimationFrame = window.requestAnimationFrame;
  context.window.cancelAnimationFrame = window.cancelAnimationFrame;
  context.window.CustomEvent = window.CustomEvent;
  context.window.Event = window.Event;
  context.window.MutationObserver = window.MutationObserver;
  context.window.localStorage = window.localStorage;
  return { context, window, document, GG };
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  let quote = "";
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    const prev = source[i - 1];
    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (prev === "*" && ch === "/") inBlockComment = false;
      continue;
    }
    if (quote) {
      if (ch === quote && prev !== "\\") quote = "";
      continue;
    }
    if (ch === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractIifeAssignment(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`marker not found: ${marker}`);
  const fnStart = source.indexOf("(function", start);
  if (fnStart < 0) throw new Error(`function start not found for marker: ${marker}`);
  const braceOpen = source.indexOf("{", fnStart);
  if (braceOpen < 0) throw new Error(`brace open not found for marker: ${marker}`);
  const braceClose = findMatchingBrace(source, braceOpen);
  if (braceClose < 0) throw new Error(`brace close not found for marker: ${marker}`);
  const tail = source.slice(braceClose);
  const m = tail.match(/^\}\s*\)\s*\(\s*\)\s*;/);
  if (!m) throw new Error(`IIFE tail not found for marker: ${marker}`);
  const end = braceClose + m[0].length;
  return source.slice(start, end);
}

function extractLabelTreeIife(source) {
  const marker = "GG.modules.labelTree = GG.modules.labelTree || (function(){";
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error("labelTree marker not found");
  const iifeStart = source.lastIndexOf("(function(GG, w, d){", markerIndex);
  if (iifeStart < 0) throw new Error("labelTree wrapper start not found");
  const endMarker = "})(window.GG = window.GG || {}, window, document);";
  const iifeEnd = source.indexOf(endMarker, markerIndex);
  if (iifeEnd < 0) throw new Error("labelTree wrapper end not found");
  return source.slice(iifeStart, iifeEnd + endMarker.length);
}

function runSnippet(context, snippet, label) {
  vm.runInNewContext(snippet, context, { timeout: 5000, filename: label });
}

function makeEl(document, tag, attrs = {}, text = "") {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (text) el.textContent = text;
  return el;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function flushAsync() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function testLabelTreeInteractions(labelTreeSnippet) {
  const { context, document, GG } = createRuntimeContext(
    "https://www.pakrpp.com/2026/02/automatically-identify-key-words-and.html"
  );
  runSnippet(context, labelTreeSnippet, "labelTree.runtime");
  assert(GG.modules.labelTree && typeof GG.modules.labelTree.init === "function", "labelTree init missing");

  const main = makeEl(document, "main", { class: "gg-main", "data-gg-surface": "post" });
  const post = makeEl(document, "article", { class: "gg-post" });
  const labelsWrap = makeEl(document, "div", { class: "post-labels" });
  const activeLabel = makeEl(document, "a", { rel: "tag", href: "/search/label/News" }, "News");
  labelsWrap.appendChild(activeLabel);
  post.appendChild(labelsWrap);
  main.appendChild(post);
  document.body.appendChild(main);

  const root = makeEl(document, "div", {
    class: "gg-lt gg-labeltree",
    "data-gg-module": "labeltree",
    "data-gg-labeltree": "post",
    "data-max-posts": "10",
  });
  const head = makeEl(document, "div", { class: "gg-lt__head" });
  head.appendChild(makeEl(document, "button", { class: "gg-lt__headbtn", type: "button", "aria-expanded": "true" }));
  const panelBtn = makeEl(document, "button", { class: "gg-lt__panelbtn", type: "button", "aria-label": "Collapse panel" });
  panelBtn.appendChild(makeEl(document, "span", { class: "material-symbols-rounded", "aria-hidden": "true" }, "expand_more"));
  head.appendChild(panelBtn);
  root.appendChild(head);
  root.appendChild(makeEl(document, "ul", { class: "gg-lt__tree", role: "tree" }));
  document.body.appendChild(root);

  let feedCalls = 0;
  GG.services.api.getFeed = async () => {
    feedCalls += 1;
    return {
      feed: {
        entry: [
          {
            title: { $t: "News Entry" },
            link: [{ rel: "alternate", href: "https://www.pakrpp.com/2026/02/automatically-identify-key-words-and.html" }],
            category: [{ term: "News" }],
          },
          {
            title: { $t: "Sidebar Entry" },
            link: [{ rel: "alternate", href: "https://www.pakrpp.com/2026/02/another.html" }],
            category: [{ term: "Library" }],
          },
        ],
        "openSearch$totalResults": { $t: "2" },
      },
    };
  };

  GG.modules.labelTree.init(root);
  await flushAsync();
  await flushAsync();

  assert(feedCalls > 0, "labelTree did not request feed");
  const nodes = root.querySelectorAll(".gg-lt__node");
  assert(nodes.length >= 2, "labelTree did not render label nodes");

  const newsNode = Array.from(nodes).find((node) => String(node.getAttribute("data-label") || "").toLowerCase() === "news");
  assert(newsNode, "active label node not found");
  assert(GG.core.state.has(newsNode, "current"), "active label node missing current state");
  assert(GG.core.state.has(newsNode, "open"), "post mode should auto-open current label");

  const newsLinks = newsNode.querySelectorAll(".gg-lt__children a[href]");
  assert(newsLinks.length >= 1, "news posts were not rendered");
  const activePostLink = Array.from(newsLinks).find((link) => GG.core.state.has(link, "active"));
  assert(activePostLink, "current post link not marked active");

  const row = newsNode.querySelector(".gg-lt__row");
  assert(row, "label row button missing");
  const closeEvt = new MockEvent("click", { target: row });
  root.dispatchEvent(closeEvt);
  assert(!GG.core.state.has(newsNode, "open"), "click did not close opened label node");

  const enterEvt = new MockEvent("keydown", { target: row, key: "Enter" });
  root.dispatchEvent(enterEvt);
  assert(enterEvt.defaultPrevented, "Enter key should be prevented on label row");
  assert(GG.core.state.has(newsNode, "open"), "Enter key did not re-open label node");

  const spaceEvt = new MockEvent("keydown", { target: row, key: " " });
  root.dispatchEvent(spaceEvt);
  assert(spaceEvt.defaultPrevented, "Space key should be prevented on label row");
  assert(!GG.core.state.has(newsNode, "open"), "Space key did not toggle label node closed");

  const panelToggle = root.querySelector(".gg-lt__panelbtn");
  assert(panelToggle, "panel toggle button missing");
  root.dispatchEvent(new MockEvent("click", { target: panelToggle }));
  assert(GG.core.state.has(root, "collapsed"), "panel toggle did not collapse label tree");
}

async function testSidebarSectionInteractions(leftNavSnippet) {
  const { context, document, GG } = createRuntimeContext("https://www.pakrpp.com/blog");
  runSnippet(context, leftNavSnippet, "leftnav.runtime");
  assert(GG.modules.LeftNav && typeof GG.modules.LeftNav.init === "function", "LeftNav init missing");

  const main = makeEl(document, "main", { class: "gg-main", "data-gg-surface": "listing" });
  const left = makeEl(document, "aside", { class: "gg-blog-sidebar gg-blog-sidebar--left" });
  const sb = makeEl(document, "div", { class: "gg-sb gg-sb--left", "data-gg-sb-ready": "0" });
  const top = makeEl(document, "div", { class: "gg-sb__top" });
  const body = makeEl(document, "div", { class: "gg-sb__body" });
  const bot = makeEl(document, "div", { class: "gg-sb__bot" });
  sb.appendChild(top);
  sb.appendChild(body);
  sb.appendChild(bot);
  left.appendChild(sb);

  const profileWidget = makeEl(document, "section", { class: "widget", id: "HTML27" });
  profileWidget.appendChild(makeEl(document, "div", { class: "gg-leftnav__profile" }, "Profile"));
  left.appendChild(profileWidget);

  const interestWidget = makeEl(document, "section", { class: "widget", id: "HTML1" });
  interestWidget.appendChild(makeEl(document, "div", { class: "gg-labeltree", "data-gg-module": "labeltree" }, "Interest"));
  left.appendChild(interestWidget);

  const navWidget = makeEl(document, "section", { class: "widget", id: "HTML17", title: "Governance & Trust" });
  const navContent = makeEl(document, "div", { class: "widget-content" });
  const navList = makeEl(document, "ul");
  const navItem = makeEl(document, "li");
  navItem.appendChild(makeEl(document, "a", { href: "https://www.pakrpp.com/p/about.html" }, "about"));
  navList.appendChild(navItem);
  navContent.appendChild(navList);
  navWidget.appendChild(navContent);
  left.appendChild(navWidget);

  const followWidget = makeEl(document, "section", { class: "widget", id: "HTML28" });
  followWidget.appendChild(makeEl(document, "div", { class: "gg-leftnav__socialbar" }, "social"));
  left.appendChild(followWidget);

  main.appendChild(left);
  document.body.appendChild(main);

  GG.modules.LeftNav.init(main);

  const details = navWidget.querySelector("details.gg-navtree");
  assert(details, "LeftNav did not convert widget into navtree details");
  assert(!details.hasAttribute("open"), "navtree should default to closed");
  const summary = details.querySelector(".gg-navtree__summary");
  assert(summary, "navtree summary missing");
  const link = details.querySelector("a[href]");
  assert(link && link.classList.contains("gg-navtree__link"), "nav link was not normalized");
  assert(link.getAttribute("data-gg-icon"), "nav link missing derived icon");

  assert(top.children[0] === interestWidget, "interest widget not placed at top segment first");
  assert(top.children.length === 1, "list top segment must only keep interest widget");
  assert(body.children.length === 0, "list body segment must not keep legacy nav widgets");
  assert(bot.children[0] === followWidget, "follow widget not placed in bottom segment");
  assert(profileWidget.hidden === true, "profile widget should be hidden by IA cleanup");
  assert(profileWidget.hasAttribute("inert"), "profile widget should be inert after IA cleanup");
  assert(navWidget.hidden === true, "legacy nav widget should be hidden by IA cleanup");
  assert(navWidget.hasAttribute("inert"), "legacy nav widget should be inert after IA cleanup");
}

async function testKeyboardFocusBasics(dockSnippet) {
  const { context, document, GG } = createRuntimeContext("https://www.pakrpp.com/blog");
  runSnippet(context, dockSnippet, "dock.runtime.secondary");
  assert(GG.modules.Dock && typeof GG.modules.Dock.init === "function", "Dock init missing");

  const main = makeEl(document, "main", { class: "gg-main", "data-gg-surface": "listing", "data-gg-home-state": "blog" });
  const dock = makeEl(document, "nav", { class: "gg-dock", "data-gg-module": "dock", "data-home-url": "/", "data-search-url": "/search" });
  main.appendChild(dock);
  document.body.appendChild(main);

  const btnSearch = makeEl(document, "a", { class: "gg-dock__item", "data-gg-action": "search", href: "/search" }, "Search");
  const btnMore = makeEl(document, "a", { class: "gg-dock__item", "data-gg-action": "more", href: "#gg-dock-more" }, "More");
  dock.appendChild(btnSearch);
  dock.appendChild(btnMore);

  const searchWrap = makeEl(document, "div", { class: "gg-dock__search" });
  const form = makeEl(document, "form");
  form.appendChild(makeEl(document, "input", { type: "search", "data-gg-dock-search-input": "1" }));
  form.appendChild(makeEl(document, "button", { type: "button", "data-gg-action": "search-exit" }, "x"));
  searchWrap.appendChild(form);
  dock.appendChild(searchWrap);

  const morePanel = makeEl(document, "section", { id: "gg-dock-more", "aria-hidden": "true" });
  morePanel.hidden = true;
  const closeLink = makeEl(document, "a", { href: "#", "data-gg-action": "more-close" }, "Close");
  morePanel.appendChild(closeLink);
  document.body.appendChild(morePanel);

  GG.modules.Dock.init(dock, main);

  btnMore.dispatchEvent(new MockEvent("click", { target: btnMore }));
  assert(GG.core.state.has(morePanel, "open"), "more panel did not open");
  assert(document.activeElement === closeLink, "more panel did not move focus to close control");

  btnSearch.dispatchEvent(new MockEvent("click", { target: btnSearch }));
  assert(GG.core.state.has(dock, "search"), "search mode did not activate");

  document.dispatchEvent(new MockEvent("keydown", { key: "Escape", target: document }));
  assert(!GG.core.state.has(dock, "search"), "Escape did not close dock search mode");
  assert(!GG.core.state.has(morePanel, "open"), "Escape did not close more panel");
  assert(morePanel.getAttribute("aria-hidden") === "true", "more panel aria-hidden not restored after Escape");
}

async function main() {
  const listingSource = readText(LISTING_REL);
  const coreSource = readText(CORE_REL);

  const labelTreeSnippet = extractLabelTreeIife(listingSource);
  const leftNavSnippet = extractIifeAssignment(coreSource, "GG.modules.LeftNav=(function(){");
  const dockSnippet = extractIifeAssignment(coreSource, "GG.modules.Dock = (function () {");

  const checks = [
    {
      id: "LABEL_TREE_INTERACTIONS",
      fn: () => testLabelTreeInteractions(labelTreeSnippet),
      verifiedByHarness: true,
    },
    {
      id: "SIDEBAR_SECTION_INTERACTIONS",
      fn: () => testSidebarSectionInteractions(leftNavSnippet),
      verifiedByHarness: true,
    },
    {
      id: "KEYBOARD_FOCUS_BASICS",
      fn: () => testKeyboardFocusBasics(dockSnippet),
      verifiedByHarness: true,
    },
  ];

  const notVerifiable = [
    "BROWSER_HISTORY_BACK_FORWARD_SEMANTICS",
    "NATIVE_BROWSER_FOCUS_TRAP_EDGE_BEHAVIOR",
    "FULL_NAVIGATION_ENGINE_SEMANTICS",
  ];

  const failures = [];
  for (let i = 0; i < checks.length; i += 1) {
    const check = checks[i];
    try {
      await check.fn();
      console.log(`PASS [VERIFIED BY HARNESS] ${check.id}`);
    } catch (error) {
      const msg = error && error.message ? error.message : String(error);
      failures.push(`${check.id}: ${msg}`);
      console.error(`FAIL [VERIFIED BY HARNESS] ${check.id} -> ${msg}`);
    }
  }

  for (let i = 0; i < notVerifiable.length; i += 1) {
    console.log(`SKIP [NOT VERIFIABLE IN THIS ENVIRONMENT] ${notVerifiable[i]}`);
  }

  if (failures.length) {
    console.error("VERIFY_RUNTIME_SECONDARY_FEATURES: FAIL");
    failures.forEach((line) => console.error(`- ${line}`));
    process.exit(1);
  }

  console.log("VERIFY_RUNTIME_SECONDARY_FEATURES: PASS");
}

main().catch((error) => {
  const msg = error && error.stack ? error.stack : String(error);
  console.error("VERIFY_RUNTIME_SECONDARY_FEATURES: FAIL");
  console.error(msg);
  process.exit(1);
});
