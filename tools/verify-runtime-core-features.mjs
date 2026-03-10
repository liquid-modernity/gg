import fs from "fs";
import path from "path";
import vm from "vm";

const root = process.cwd();
const CORE_REL = "public/assets/latest/modules/ui.bucket.core.js";
const POST_REL = "public/assets/latest/modules/ui.bucket.post.js";
const LISTING_REL = "public/assets/latest/modules/ui.bucket.listing.js";
const AUTHORS_REL = "public/assets/latest/modules/ui.bucket.authors.js";

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
    const dataKey = (prop) =>
      `data-${String(prop).replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
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

  get src() {
    return this.getAttribute("src") || "";
  }

  set src(value) {
    this.setAttribute("src", value);
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

  replaceChild(next, prev) {
    const idx = this.children.indexOf(prev);
    if (idx < 0) return null;
    if (next.parentElement) next.parentElement.removeChild(next);
    next.parentElement = this;
    next.ownerDocument = this.ownerDocument;
    this.children[idx] = next;
    prev.parentElement = null;
    return prev;
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

  remove() {
    if (this.parentElement) this.parentElement.removeChild(this);
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

  removeEventListener(type, handler) {
    const key = String(type);
    const list = this._listeners[key] || [];
    this._listeners[key] = list.filter((fn) => fn !== handler);
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

  getClientRects() {
    if (this.hidden) return [];
    return [{ x: 0, y: 0, width: 100, height: 20 }];
  }

  getBoundingClientRect() {
    const top = Number(this._top || 0);
    const height = Number(this._height || 24);
    return { top, height, bottom: top + height, left: 0, right: 0, width: 320 };
  }

  scrollIntoView() {}

  cloneNode(deep = false) {
    const cloned = new MockElement(this.tagName.toLowerCase(), {}, this.ownerDocument);
    Object.keys(this._attrs).forEach((k) => cloned.setAttribute(k, this._attrs[k]));
    cloned.hidden = this.hidden;
    cloned._text = this._text;
    cloned.style.display = this.style.display;
    cloned.style.visibility = this.style.visibility;
    Object.keys(this.style._props || {}).forEach((k) => cloned.style.setProperty(k, this.style._props[k]));
    if (deep) {
      this.children.forEach((c) => cloned.appendChild(c.cloneNode(true)));
    }
    return cloned;
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

  createDocumentFragment() {
    return new MockElement("fragment", {}, this);
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

function walkDescendants(root, out, includeSelf = false) {
  if (!root) return;
  if (includeSelf) out.push(root);
  const kids = root.children || [];
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
  const scrollCalls = [];
  const timer = {
    setTimeout: (...args) => setTimeout(...args),
    clearTimeout: (...args) => clearTimeout(...args),
    setInterval: (...args) => setInterval(...args),
    clearInterval: (...args) => clearInterval(...args),
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
    pageXOffset: 0,
    innerHeight: 800,
    setTimeout: timer.setTimeout,
    clearTimeout: timer.clearTimeout,
    setInterval: timer.setInterval,
    clearInterval: timer.clearInterval,
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
      if (typeof event.preventDefault !== "function") event.preventDefault = function () {};
      if (typeof event.stopPropagation !== "function") event.stopPropagation = function () {};
      if (typeof event.stopImmediatePropagation !== "function") event.stopImmediatePropagation = function () {};
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
    scrollTo(arg1, arg2) {
      if (typeof arg1 === "object") {
        scrollCalls.push({ top: Number(arg1.top || 0), behavior: arg1.behavior || "auto" });
      } else {
        scrollCalls.push({ top: Number(arg2 || 0), behavior: "auto" });
      }
    },
    matchMedia() {
      return { matches: false, addEventListener() {}, removeEventListener() {} };
    },
    MutationObserver: MockMutationObserver,
    Event: MockEvent,
    CustomEvent: MockEvent,
    navigator: {
      share: null,
      clipboard: {
        writeText: async () => {},
      },
    },
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
    fetch: async () => {
      throw new Error("fetch-not-mocked");
    },
    __scrollCalls: scrollCalls,
    GG_DEBUG: false,
  };

  document.defaultView = window;

  const GG = {
    modules: {},
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
          const shouldOn = !!on;
          if (shouldOn) this.add(el, token);
          else this.remove(el, token);
        },
        has(el, token) {
          return !!(el && el.__stateSet && el.__stateSet.has(String(token)));
        },
      },
      parseHtmlDoc() {
        return null;
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
      comments: {
        _mountCalls: 0,
        mountWithRetry() {
          this._mountCalls += 1;
        },
      },
    },
    modules: {
      Panels: {
        setLeft(state) {
          const main = document.querySelector("main.gg-main[data-gg-surface]");
          if (main) main.setAttribute("data-gg-left-panel", state);
        },
        setRight(state) {
          const main = document.querySelector("main.gg-main[data-gg-surface]");
          if (main) {
            main.setAttribute("data-gg-right-panel", state);
            main.setAttribute("data-gg-info-panel", state);
          }
        },
      },
      Comments: {
        _calls: 0,
        _lastOpts: null,
        ensureLoaded(opts) {
          this._calls += 1;
          this._lastOpts = opts || null;
          const host = document.querySelector(".gg-post__comments");
          if (host) {
            host.setAttribute("data-gg-comments-loaded", "1");
            const gate = host.querySelector("[data-gg-comments-gate='ui']");
            if (gate && gate.parentElement) gate.parentElement.removeChild(gate);
            if (!host.querySelector("#comments")) {
              const native = document.createElement("section");
              native.setAttribute("id", "comments");
              native.classList.add("gg-comments");
              native.textContent = "Native comments runtime";
              host.appendChild(native);
            }
          }
          return true;
        },
      },
    },
  };

  window.GG = GG;
  window.GG_BOOT = {};

  const context = {
    console,
    window,
    document,
    GG,
    history,
    location,
    navigator: window.navigator,
    localStorage: window.localStorage,
    MutationObserver: window.MutationObserver,
    Event: window.Event,
    CustomEvent: window.CustomEvent,
    URL,
    getComputedStyle: window.getComputedStyle,
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    setTimeout: window.setTimeout,
    clearTimeout: window.clearTimeout,
    setInterval: window.setInterval,
    clearInterval: window.clearInterval,
    fetch: (...args) => window.fetch(...args),
    w: window,
    d: document,
    qs: (sel, scope) => (scope || document).querySelector(sel),
    qsa: (sel, scope) => Array.from((scope || document).querySelectorAll(sel)),
    text: (el) => String((el && el.textContent) || "").replace(/\s+/g, " ").trim(),
    showToast: () => {},
    normalizeUrl: (u) => String(u || "").split("#")[0].replace(/\/+$/, ""),
  };
  context.globalThis = context;
  context.window.window = context.window;
  context.window.history = history;
  context.window.location = location;
  context.window.getComputedStyle = window.getComputedStyle;
  context.window.requestAnimationFrame = window.requestAnimationFrame;
  context.window.cancelAnimationFrame = window.cancelAnimationFrame;
  context.window.fetch = (...args) => window.fetch(...args);
  context.window.CustomEvent = window.CustomEvent;
  context.window.URL = URL;
  context.window.Event = window.Event;
  context.window.MutationObserver = window.MutationObserver;
  context.window.navigator = window.navigator;
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

function extractByRegex(source, regex, label) {
  const m = String(source || "").match(regex);
  if (!m || !m[0]) throw new Error(`regex extractor miss: ${label}`);
  return m[0];
}

function runSnippet(context, snippet, label) {
  try {
    vm.runInNewContext(snippet, context, { timeout: 5000, filename: label });
  } catch (error) {
    throw new Error(`${label} eval failed: ${error && error.message ? error.message : error}`);
  }
}

function makeButton(doc, action, href = "#", anchor = "") {
  const a = doc.createElement("a");
  a.classList.add("gg-dock__item");
  a.setAttribute("data-gg-action", action);
  a.setAttribute("href", href);
  if (anchor) a.setAttribute("data-gg-anchor", anchor);
  a.setAttribute("data-gg-primary", "1");
  return a;
}

function makeToolbarButton(doc, action) {
  const btn = doc.createElement("button");
  btn.setAttribute("type", "button");
  btn.setAttribute("data-gg-postbar", action);
  btn.classList.add("gg-post__tool");
  return btn;
}

async function testDockRuntime(dockSnippet) {
  const { context, document, GG } = createRuntimeContext("https://www.pakrpp.com/blog");
  const main = document.createElement("main");
  main.classList.add("gg-main");
  main.setAttribute("data-gg-surface", "listing");
  main.setAttribute("data-gg-home-state", "blog");
  document.body.appendChild(main);

  const dock = document.createElement("nav");
  dock.classList.add("gg-dock");
  dock.setAttribute("data-gg-module", "dock");
  dock.setAttribute("data-home-url", "/");
  dock.setAttribute("data-search-url", "/search");
  main.appendChild(dock);

  const btnHome = makeButton(document, "home", "/", "#gg-landing-hero");
  const btnContact = makeButton(document, "contact", "/#gg-landing-hero-5", "#gg-landing-hero-5");
  const btnBlog = makeButton(document, "blog", "/blog");
  const btnSearch = makeButton(document, "search", "/search");
  const btnMore = makeButton(document, "more", "#gg-dock-more");
  [btnHome, btnContact, btnBlog, btnSearch, btnMore].forEach((x) => dock.appendChild(x));

  const searchWrap = document.createElement("div");
  searchWrap.classList.add("gg-dock__search");
  const form = document.createElement("form");
  let submitCount = 0;
  form.submit = () => {
    submitCount += 1;
  };
  const input = document.createElement("input");
  input.setAttribute("type", "search");
  input.setAttribute("data-gg-dock-search-input", "1");
  const closeBtn = document.createElement("button");
  closeBtn.setAttribute("data-gg-action", "search-exit");
  form.appendChild(input);
  form.appendChild(closeBtn);
  searchWrap.appendChild(form);
  dock.appendChild(searchWrap);

  const morePanel = document.createElement("section");
  morePanel.setAttribute("id", "gg-dock-more");
  morePanel.hidden = true;
  morePanel.setAttribute("aria-hidden", "true");
  const moreClose = document.createElement("a");
  moreClose.setAttribute("data-gg-action", "more-close");
  morePanel.appendChild(moreClose);
  document.body.appendChild(morePanel);

  runSnippet(context, dockSnippet, "dock.runtime");
  if (!GG.modules.Dock || typeof GG.modules.Dock.init !== "function") {
    throw new Error("Dock module not registered");
  }
  GG.modules.Dock.init(dock, main);

  btnMore.dispatchEvent(new MockEvent("click", { target: btnMore }));
  const moreOpened = morePanel.hidden === false && GG.core.state.has(morePanel, "open");
  if (!moreOpened) throw new Error("more action did not open panel");

  btnSearch.dispatchEvent(new MockEvent("click", { target: btnSearch }));
  if (!GG.core.state.has(dock, "search")) throw new Error("search action did not enter search mode");

  btnSearch.dispatchEvent(new MockEvent("click", { target: btnSearch }));
  if (submitCount !== 1) throw new Error("search second click did not submit search form");

  btnBlog.dispatchEvent(new MockEvent("click", { target: btnBlog }));
  const routed = (GG.core.router._calls || []).some((url) => /\/blog/.test(String(url)));
  if (!routed) throw new Error("blog action did not route to /blog");

  return `more=open search=active blogRoute=${GG.core.router._calls[0] || "-"}`;
}

async function testToolbarRuntime(postDetailSnippet) {
  const { context, document, GG } = createRuntimeContext("https://www.pakrpp.com/2026/02/demo.html");
  const main = document.createElement("main");
  main.classList.add("gg-main");
  main.setAttribute("data-gg-surface", "post");
  main.setAttribute("data-gg-left-panel", "closed");
  main.setAttribute("data-gg-right-panel", "closed");
  main.setAttribute("data-gg-info-panel", "closed");
  document.body.appendChild(main);

  const left = document.createElement("aside");
  left.classList.add("gg-blog-sidebar--left");
  const right = document.createElement("aside");
  right.classList.add("gg-blog-sidebar--right");
  main.appendChild(left);
  main.appendChild(right);

  const infoPanel = document.createElement("div");
  infoPanel.setAttribute("data-gg-panel", "info");
  infoPanel.hidden = true;
  right.appendChild(infoPanel);

  const commentsPanel = document.createElement("div");
  commentsPanel.setAttribute("data-gg-panel", "comments");
  commentsPanel.hidden = true;
  const commentsSlot = document.createElement("div");
  commentsSlot.setAttribute("data-gg-slot", "comments");
  commentsPanel.appendChild(commentsSlot);
  right.appendChild(commentsPanel);

  const article = document.createElement("article");
  article.classList.add("gg-post");
  article.setAttribute("data-gg-module", "post-detail");
  article.setAttribute("data-id", "post-1");
  main.appendChild(article);

  const title = document.createElement("h1");
  title.classList.add("gg-post__title");
  title.textContent = "Runtime Toolbar Test";
  article.appendChild(title);

  const toolbar = document.createElement("div");
  toolbar.setAttribute("data-gg-module", "post-toolbar");
  article.appendChild(toolbar);
  const btnInfo = makeToolbarButton(document, "info");
  const btnFocus = makeToolbarButton(document, "focus");
  btnFocus.setAttribute("aria-pressed", "false");
  const btnSave = makeToolbarButton(document, "save");
  const btnComments = makeToolbarButton(document, "comments");
  btnComments.setAttribute("aria-expanded", "false");
  const btnShare = makeToolbarButton(document, "share");
  [btnInfo, btnFocus, btnSave, btnComments, btnShare].forEach((x) => toolbar.appendChild(x));

  const commentsBlock = document.createElement("div");
  commentsBlock.classList.add("gg-post__comments");
  commentsBlock.setAttribute("data-gg-comments-gate", "1");
  const commentsGate = document.createElement("div");
  commentsGate.setAttribute("data-gg-comments-gate", "ui");
  const commentsLoad = document.createElement("button");
  commentsLoad.setAttribute("data-gg-comments-load", "1");
  commentsLoad.type = "button";
  commentsLoad.textContent = "Load comments";
  commentsGate.appendChild(commentsLoad);
  commentsBlock.appendChild(commentsGate);
  article.appendChild(commentsBlock);

  runSnippet(context, postDetailSnippet, "postdetail.runtime");
  if (!GG.modules.PostDetail || typeof GG.modules.PostDetail.init !== "function") {
    throw new Error("PostDetail module not registered");
  }
  GG.modules.PostDetail.init();

  if (commentsBlock.parentElement !== commentsSlot) {
    throw new Error("comments block was not moved into right panel slot");
  }

  toolbar.dispatchEvent(new MockEvent("click", { target: btnComments }));
  if (main.getAttribute("data-gg-right-panel") !== "open") {
    throw new Error("comments action did not open right panel");
  }
  if (main.getAttribute("data-gg-right-mode") !== "comments") {
    throw new Error("comments action did not set right mode=comments");
  }
  if (commentsPanel.hidden) {
    throw new Error("comments panel remained hidden after comments action");
  }
  if ((GG.modules.Comments._calls || 0) < 1) {
    throw new Error("comments action did not trigger ensureLoaded");
  }
  if (
    !GG.modules.Comments._lastOpts ||
    (GG.modules.Comments._lastOpts.forceLoad !== true &&
      GG.modules.Comments._lastOpts.fromPrimaryAction !== true)
  ) {
    throw new Error("comments action did not request immediate comments load");
  }
  if ((GG.services.comments._mountCalls || 0) < 1) {
    throw new Error("comments action did not trigger comments mount");
  }
  if (commentsBlock.getAttribute("data-gg-comments-loaded") !== "1") {
    throw new Error("comments action did not mark native comments loaded");
  }
  if (!commentsSlot.querySelector("#comments")) {
    throw new Error("native comments container was not present in comments slot");
  }

  toolbar.dispatchEvent(new MockEvent("click", { target: btnInfo }));
  if (main.getAttribute("data-gg-left-panel") !== "open") {
    throw new Error("info action did not open left panel");
  }

  return `right=${main.getAttribute("data-gg-right-panel")} mode=${main.getAttribute("data-gg-right-mode")} left=${main.getAttribute("data-gg-left-panel")} loaded=${commentsBlock.getAttribute("data-gg-comments-loaded") || "0"} native=${commentsSlot.querySelector("#comments") ? "present" : "missing"}`;
}

async function testPostLeftInfoRuntime(authorsSource) {
  const { context, document, window, GG } = createRuntimeContext("https://www.pakrpp.com/2026/02/demo.html");
  const storeFactory = () => ({
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
  });
  window.sessionStorage = storeFactory();
  context.window.sessionStorage = window.sessionStorage;
  context.sessionStorage = window.sessionStorage;

  GG.services.postmeta = {
    getFromContext() {
      return {
        author: "pakrpp",
        contributors: ["editor-team"],
        tags: [{ key: "ai-workflow", text: "AI Workflow", href: "/p/tags.html?tag=ai-workflow" }],
        updated: "2026-02-20",
        published: "2026-02-19",
        readMin: "7",
      };
    },
  };
  GG.services.authorsDir = {
    slugify(raw) {
      return String(raw || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    },
    fallback(raw) {
      const slug = this.slugify(raw);
      const name = slug === "pakrpp" ? "Pak RPP" : slug === "editor-team" ? "Editor Team" : slug || "Author";
      return { slug, name, href: `/p/${slug || "author"}.html`, src: "fallback" };
    },
    async resolveMany(list) {
      return (Array.isArray(list) ? list : []).map((item) => {
        const slug = this.slugify(item);
        const name = slug === "pakrpp" ? "Pak RPP" : slug === "editor-team" ? "Editor Team" : slug || "Author";
        return { slug, name, href: `/p/${slug || "author"}.html`, src: "dir" };
      });
    },
  };
  GG.services.tagsDir = {
    async resolveMany(list) {
      return (Array.isArray(list) ? list : []).map((item) => {
        const row = item && typeof item === "object" ? item : { text: String(item || "") };
        const text = String(row.text || row.name || "").trim();
        return { key: text.toLowerCase().replace(/\s+/g, "-"), text, href: row.href || "#" };
      });
    },
  };

  const main = document.createElement("main");
  main.classList.add("gg-main");
  main.setAttribute("data-gg-surface", "post");
  document.body.appendChild(main);

  const article = document.createElement("article");
  article.classList.add("gg-post");
  article.setAttribute("data-gg-module", "post-detail");
  article.setAttribute("data-author", "pakrpp");
  article.setAttribute("data-date", "2026-02-19");
  const publishedDate = document.createElement("time");
  publishedDate.classList.add("gg-post__date");
  publishedDate.textContent = "2026-02-19";
  article.appendChild(publishedDate);
  const labelsWrap = document.createElement("div");
  labelsWrap.classList.add("post-labels");
  const labelA = document.createElement("a");
  labelA.setAttribute("rel", "tag");
  labelA.setAttribute("href", "/search/label/AI");
  labelA.textContent = "AI";
  labelsWrap.appendChild(labelA);
  article.appendChild(labelsWrap);
  const body = document.createElement("section");
  body.classList.add("gg-post__content");
  body.classList.add("post-body");
  body.classList.add("entry-content");
  body.textContent = "Runtime coverage ensures metadata hydration is populated with non-placeholder values.";
  article.appendChild(body);
  const pm = document.createElement("div");
  pm.classList.add("gg-postmeta");
  pm.setAttribute("data-contributors", "editor-team");
  pm.setAttribute("data-tags", "AI Workflow");
  pm.setAttribute("data-updated", "2026-02-20");
  pm.setAttribute("data-read-min", "7");
  article.appendChild(pm);
  main.appendChild(article);

  const info = document.createElement("div");
  info.setAttribute("id", "gg-postinfo");
  const bodyWrap = document.createElement("div");
  bodyWrap.classList.add("gg-pi__body");
  const authorSlot = document.createElement("div");
  authorSlot.setAttribute("data-slot", "author");
  bodyWrap.appendChild(authorSlot);
  const contribSec = document.createElement("div");
  contribSec.classList.add("gg-pi__sec--contributors");
  contribSec.hidden = true;
  const contribSlot = document.createElement("div");
  contribSlot.setAttribute("data-slot", "contributors");
  contribSec.appendChild(contribSlot);
  bodyWrap.appendChild(contribSec);
  const labelsSec = document.createElement("div");
  labelsSec.classList.add("gg-pi__sec--labels");
  labelsSec.hidden = true;
  const labelsSlot = document.createElement("div");
  labelsSlot.setAttribute("data-slot", "labels");
  labelsSec.appendChild(labelsSlot);
  bodyWrap.appendChild(labelsSec);
  const tagsSec = document.createElement("div");
  tagsSec.classList.add("gg-pi__sec--tags");
  tagsSec.hidden = true;
  const tagsSlot = document.createElement("div");
  tagsSlot.setAttribute("data-slot", "tags");
  tagsSec.appendChild(tagsSlot);
  bodyWrap.appendChild(tagsSec);
  const meta = document.createElement("div");
  meta.classList.add("gg-pi__meta");
  ["date", "updated", "readtime"].forEach((key) => {
    const row = document.createElement("div");
    row.classList.add(`gg-pi__metaitem--${key}`);
    const slot = document.createElement("span");
    slot.setAttribute("data-slot", key);
    slot.textContent = "—";
    row.appendChild(slot);
    meta.appendChild(row);
  });
  bodyWrap.appendChild(meta);
  info.appendChild(bodyWrap);
  main.appendChild(info);

  runSnippet(context, authorsSource, "authors.runtime");
  if (!GG.modules.postInfoAuthors || typeof GG.modules.postInfoAuthors.init !== "function") {
    throw new Error("postInfoAuthors module not registered");
  }
  GG.modules.postInfoAuthors.init(document);
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));

  const authorText = (info.querySelector('[data-slot="author"] .gg-pi__pname')?.textContent || "").trim();
  const dateText = (info.querySelector('[data-slot="date"]')?.textContent || "").trim();
  const updatedText = (info.querySelector('[data-slot="updated"]')?.textContent || "").trim();
  const readText = (info.querySelector('[data-slot="readtime"]')?.textContent || "").trim();
  const labelCount = info.querySelectorAll('[data-slot="labels"] .gg-pi__chip').length;
  const tagCount = info.querySelectorAll('[data-slot="tags"] .gg-pi__chip').length;

  if (!authorText || /^[-—]+$/.test(authorText)) throw new Error("author slot remained placeholder");
  if (!dateText || /^[-—]+$/.test(dateText)) throw new Error("date slot remained placeholder");
  if (!updatedText || /^[-—]+$/.test(updatedText)) throw new Error("updated slot remained placeholder");
  if (!readText || /^[-—]+$/.test(readText)) throw new Error("readtime slot remained placeholder");
  if (labelCount < 1) throw new Error("labels slot did not render chips");
  if (tagCount < 1) throw new Error("tags slot did not render chips");

  return `author="${authorText}" date="${dateText}" updated="${updatedText}" readtime="${readText}" labels=${labelCount} tags=${tagCount}`;
}

async function testTocRuntime(tocSnippet) {
  const { context, document, window, GG } = createRuntimeContext("https://www.pakrpp.com/2026/02/demo.html");
  const tocRoot = document.createElement("nav");
  tocRoot.setAttribute("id", "gg-toc");
  const headBtn = document.createElement("button");
  headBtn.classList.add("gg-toc__headbtn");
  const toggleBtn = document.createElement("button");
  toggleBtn.classList.add("gg-toc__toggle");
  const toggleIcon = document.createElement("span");
  toggleIcon.classList.add("material-symbols-rounded");
  toggleBtn.appendChild(toggleIcon);
  const list = document.createElement("ol");
  list.classList.add("gg-toc__list");
  const empty = document.createElement("div");
  empty.classList.add("gg-toc__empty");
  tocRoot.appendChild(headBtn);
  tocRoot.appendChild(toggleBtn);
  tocRoot.appendChild(list);
  tocRoot.appendChild(empty);
  document.body.appendChild(tocRoot);

  const toolbar = document.createElement("div");
  toolbar.classList.add("gg-post__toolbar");
  toolbar._height = 0;
  document.body.appendChild(toolbar);

  const postBody = document.createElement("section");
  postBody.classList.add("gg-post__content");
  postBody.classList.add("post-body");
  postBody.classList.add("entry-content");
  const h1 = document.createElement("h1");
  h1.textContent = "Major Heading";
  h1._top = 360;
  const h2 = document.createElement("h2");
  h2.textContent = "Heading";
  h2._top = 480;
  const h3 = document.createElement("h3");
  h3.textContent = "Sub Heading";
  h3._top = 620;
  const h4 = document.createElement("h4");
  h4.textContent = "Minor Heading";
  h4._top = 760;
  postBody.appendChild(h1);
  postBody.appendChild(h2);
  postBody.appendChild(h3);
  postBody.appendChild(h4);
  document.body.appendChild(postBody);

  runSnippet(context, tocSnippet, "toc.runtime");
  if (!GG.modules.TOC || typeof GG.modules.TOC.init !== "function") {
    throw new Error("TOC module not registered");
  }
  GG.modules.TOC.init(document, { headings: "h1,h2,h3,h4" });

  const links = list.querySelectorAll("a.gg-toc__link");
  if (links.length !== 4) {
    throw new Error(`TOC item count mismatch (expected 4, got ${links.length})`);
  }
  if (tocRoot.hidden) {
    throw new Error("TOC root still hidden despite headings");
  }
  const firstLink = links[0];
  const hrefId = String(firstLink.getAttribute("href") || "").replace(/^#/, "");
  const headingTarget = document.getElementById(hrefId);
  if (!headingTarget) {
    throw new Error(`TOC heading target not found for href="${firstLink.getAttribute("href") || ""}"`);
  }
  tocRoot.dispatchEvent(new MockEvent("click", { target: firstLink }));
  const scrollCalls = window.__scrollCalls || [];
  const lastScroll = scrollCalls.slice(-1)[0];
  if (!lastScroll || scrollCalls.length < 1) {
    throw new Error("TOC link click did not issue scrollTo");
  }
  const expectedHash = firstLink.getAttribute("href") || "";
  if (String(window.location.hash || "") !== String(expectedHash || "")) {
    throw new Error("TOC link click did not update URL hash to heading target");
  }
  if (!String(firstLink.getAttribute("href") || "").startsWith("#")) {
    throw new Error("TOC link does not point to heading hash");
  }

  const levels = Array.from(list.querySelectorAll(".gg-toc__item")).map((el) =>
    String(el.className || "").match(/gg-toc__lvl-(\d)/)?.[1] || "?"
  );
  const levelCount = {
    h1: levels.filter((x) => x === "1").length,
    h2: levels.filter((x) => x === "2").length,
    h3: levels.filter((x) => x === "3").length,
    h4: levels.filter((x) => x === "4").length,
  };
  return `items=${links.length} h1=${levelCount.h1} h2=${levelCount.h2} h3=${levelCount.h3} h4=${levelCount.h4} firstHref=${firstLink.getAttribute("href")} scrollTop=${Math.round(lastScroll.top)}`;
}

async function testInfoPanelRuntime(infoPanelSnippet) {
  const { context, document, window, GG } = createRuntimeContext("https://www.pakrpp.com/blog");
  const parsedDoc = new MockDocument();
  const parsedBody = parsedDoc.createElement("section");
  parsedBody.classList.add("post-body");
  parsedBody.classList.add("entry-content");
  ["major-heading", "heading", "sub-heading", "minor-heading"].forEach((id, index) => {
    const level = index + 1;
    const h = parsedDoc.createElement(`h${level}`);
    h.textContent =
      level === 1
        ? "Major Heading"
        : level === 2
          ? "Heading"
          : level === 3
            ? "Sub Heading"
            : "Minor Heading";
    h.setAttribute("id", id);
    parsedBody.appendChild(h);
  });
  const parsedPara = parsedDoc.createElement("p");
  parsedPara.textContent = "Runtime listing snippet body.";
  parsedBody.appendChild(parsedPara);
  parsedDoc.body.appendChild(parsedBody);

  context.parseHtmlDoc = () => parsedDoc;
  window.parseHtmlDoc = context.parseHtmlDoc;
  window.fetch = async (url) => ({
    ok: true,
    status: 200,
    url: String(url || ""),
    text: async () =>
      "<article class='gg-post'><div class='post-body entry-content'><h1 id='major-heading'>Major Heading</h1><h2 id='heading'>Heading</h2><h3 id='sub-heading'>Sub Heading</h3><h4 id='minor-heading'>Minor Heading</h4></div></article>",
  });
  context.fetch = (...args) => window.fetch(...args);

  const main = document.createElement("main");
  main.classList.add("gg-main");
  main.setAttribute("data-gg-surface", "listing");
  main.setAttribute("data-gg-info-panel", "closed");
  document.body.appendChild(main);

  const panel = document.createElement("div");
  panel.classList.add("gg-info-panel");
  panel.hidden = true;
  main.appendChild(panel);

  const preview = document.createElement("div");
  preview.classList.add("gg-editorial-preview");
  panel.appendChild(preview);

  const mediaWrap = document.createElement("div");
  mediaWrap.classList.add("gg-epanel__media");
  mediaWrap.setAttribute("data-row", "thumbnail");
  const thumb = document.createElement("img");
  thumb.classList.add("gg-info-panel__thumb-img");
  mediaWrap.appendChild(thumb);
  preview.appendChild(mediaWrap);

  const titleRow = document.createElement("div");
  titleRow.setAttribute("data-row", "title");
  preview.appendChild(titleRow);
  const titleLink = document.createElement("a");
  titleLink.setAttribute("data-s", "title");
  titleRow.appendChild(titleLink);

  const rows = [
    "author",
    "contributors",
    "labels",
    "tags",
    "date",
    "updated",
    "comments",
    "readtime",
    "snippet",
    "toc",
  ];
  rows.forEach((name) => {
    const row = document.createElement("div");
    row.setAttribute("data-row", name);
    if (name === "author") {
      const authorLink = document.createElement("a");
      authorLink.setAttribute("data-s", "author-link");
      const authorText = document.createElement("span");
      authorText.setAttribute("data-s", "author");
      authorLink.appendChild(authorText);
      row.appendChild(authorLink);
    }
    if (["date", "updated", "comments", "readtime", "snippet"].includes(name)) {
      const span = document.createElement("span");
      span.setAttribute("data-s", name);
      row.appendChild(span);
    }
    if (["contributors", "labels", "tags", "toc", "toc-hint"].includes(name)) {
      if (name === "toc") {
        const listEl = document.createElement("ol");
        listEl.setAttribute("data-gg-slot", "toc");
        row.appendChild(listEl);
        const hintEl = document.createElement("p");
        hintEl.setAttribute("data-gg-slot", "toc-hint");
        row.appendChild(hintEl);
      } else {
        const slot = document.createElement("div");
        slot.setAttribute("data-gg-slot", name);
        row.appendChild(slot);
      }
    }
    preview.appendChild(row);
  });

  const cta = document.createElement("a");
  cta.classList.add("gg-epanel__cta");
  panel.appendChild(cta);

  const card = document.createElement("article");
  card.classList.add("gg-post-card");
  card.setAttribute("data-id", "card-1");
  card.setAttribute("data-author-name", "Pak RPP");
  card.setAttribute("data-author-url", "/p/author.html");
  card.setAttribute("data-date", "March 01, 2026");
  card.setAttribute("data-readtime", "4 min read");
  card.setAttribute("data-snippet", "Snippet fallback");
  card.setAttribute("data-updated", "2026-03-02T00:00:00Z");
  main.appendChild(card);

  const infoBtn = document.createElement("button");
  infoBtn.setAttribute("data-gg-action", "info");
  card.appendChild(infoBtn);

  const cardTitle = document.createElement("a");
  cardTitle.classList.add("gg-post-card__title-link");
  cardTitle.setAttribute("href", "/2026/02/runtime-proof.html");
  cardTitle.textContent = "Runtime Metadata Title";
  card.appendChild(cardTitle);

  const dateNode = document.createElement("time");
  dateNode.classList.add("gg-post-card__date");
  dateNode.textContent = "March 01, 2026";
  card.appendChild(dateNode);

  const commentsNode = document.createElement("span");
  commentsNode.classList.add("gg-post-card__meta-item--comments");
  commentsNode.textContent = "12 Comments";
  card.appendChild(commentsNode);

  const excerpt = document.createElement("p");
  excerpt.classList.add("gg-post-card__excerpt");
  excerpt.textContent = "Metadata panel snippet from card excerpt";
  card.appendChild(excerpt);

  const postMeta = document.createElement("div");
  postMeta.classList.add("gg-postmeta");
  postMeta.setAttribute("data-author", "Pak RPP");
  postMeta.setAttribute("data-updated", "2026-03-02T00:00:00Z");
  postMeta.setAttribute("data-read-min", "7");
  postMeta.setAttribute("data-contributors", "Editor One;Editor Two");
  postMeta.setAttribute("data-tags", "alpha,beta");
  postMeta.setAttribute("data-snippet", "Metadata panel snippet from postmeta");
  card.appendChild(postMeta);

  const labelWrap = document.createElement("span");
  labelWrap.classList.add("gg-post-card__label");
  const labelA = document.createElement("a");
  labelA.setAttribute("rel", "tag");
  labelA.setAttribute("href", "/search/label/Feature");
  labelA.textContent = "Feature";
  labelWrap.appendChild(labelA);
  card.appendChild(labelWrap);

  const thumbImg = document.createElement("img");
  thumbImg.classList.add("gg-post-card__thumb-img");
  thumbImg.setAttribute("src", "https://img.example.com/thumb.jpg");
  card.appendChild(thumbImg);

  runSnippet(context, infoPanelSnippet, "infopanel.runtime");
  if (!GG.modules.InfoPanel || typeof GG.modules.InfoPanel.init !== "function") {
    throw new Error("InfoPanel module not registered");
  }
  GG.modules.InfoPanel.init(main);

  main.dispatchEvent(new MockEvent("click", { target: infoBtn }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));

  if (main.getAttribute("data-gg-info-panel") !== "open") {
    throw new Error("info click did not set data-gg-info-panel=open");
  }
  if (panel.hidden) {
    throw new Error("info click did not unhide right metadata panel");
  }
  const authorText = panel.querySelector('[data-s="author"]');
  if ((titleLink.textContent || "").trim() !== "Runtime Metadata Title") {
    throw new Error("metadata panel title was not hydrated");
  }
  if (!authorText || (authorText.textContent || "").trim() !== "Pak RPP") {
    throw new Error("metadata panel author was not hydrated");
  }
  const commentsText = (panel.querySelector('[data-s="comments"]')?.textContent || "").trim();
  if (!/12/.test(commentsText)) {
    throw new Error("metadata panel comments field missing");
  }
  const dateText = (panel.querySelector('[data-s="date"]')?.textContent || "").trim();
  const updatedText = (panel.querySelector('[data-s="updated"]')?.textContent || "").trim();
  const readText = (panel.querySelector('[data-s="readtime"]')?.textContent || "").trim();
  const snippetText = (panel.querySelector('[data-s="snippet"]')?.textContent || "").trim();
  if (!dateText || /^[-—]+$/.test(dateText)) throw new Error("metadata panel date field missing");
  if (!updatedText || /^[-—]+$/.test(updatedText)) throw new Error("metadata panel updated field missing");
  if (!readText || /^[-—]+$/.test(readText)) throw new Error("metadata panel readtime field missing");
  if (!snippetText || /^[-—]+$/.test(snippetText)) throw new Error("metadata panel snippet field missing");

  const labelsCount = panel.querySelectorAll('[data-gg-slot="labels"] .gg-chip').length;
  const tagsCount = panel.querySelectorAll('[data-gg-slot="tags"] .gg-chip').length;
  const contributorsCount = panel.querySelectorAll('[data-gg-slot="contributors"] .gg-chip').length;
  if (labelsCount < 1) throw new Error("metadata panel labels chips missing");
  if (tagsCount < 1) throw new Error("metadata panel tags chips missing");
  if (contributorsCount < 1) throw new Error("metadata panel contributors chips missing");

  const tocLinks = panel.querySelectorAll('[data-gg-slot="toc"] a.gg-info-panel__toclink').length;
  if (tocLinks !== 4) throw new Error(`metadata panel toc links mismatch (expected 4, got ${tocLinks})`);
  const badHref = Array.from(panel.querySelectorAll('[data-gg-slot="toc"] a.gg-info-panel__toclink')).find(
    (a) => !String(a.getAttribute("href") || "").includes("#")
  );
  if (badHref) throw new Error("metadata panel toc link missing hash target");

  const titleIndex = preview.children.indexOf(titleRow);
  const mediaIndex = preview.children.indexOf(mediaWrap);
  const thumbBeforeTitle = mediaIndex >= 0 && titleIndex > mediaIndex;
  if (!thumbBeforeTitle) throw new Error("metadata panel thumbnail must appear before title row");

  return `panel=open title="${titleLink.textContent.trim()}" author="${authorText.textContent.trim()}" comments="${commentsText}" updated="${updatedText}" readtime="${readText}" tocLinks=${tocLinks} thumbBeforeTitle=${thumbBeforeTitle}`;
}

async function testLoadMoreRuntime(loadMoreSnippet) {
  const { context, document, window, GG } = createRuntimeContext("https://www.pakrpp.com/blog");
  context.G = GG;

  const list = document.createElement("div");
  list.setAttribute("id", "postcards");
  for (let i = 1; i <= 9; i += 1) {
    const card = document.createElement("article");
    card.classList.add("gg-post-card");
    card.setAttribute("data-url", `https://www.pakrpp.com/post-${i}.html`);
    list.appendChild(card);
  }
  document.body.appendChild(list);

  const wrap = document.createElement("div");
  wrap.setAttribute("data-gg-module", "loadmore");
  const btn = document.createElement("button");
  btn.setAttribute("id", "loadmore");
  btn.setAttribute("data-next", "/blog?page=2");
  const label = document.createElement("span");
  label.classList.add("gg-loadmore__label");
  label.textContent = "Load More Articles";
  btn.appendChild(label);
  wrap.appendChild(btn);
  document.body.appendChild(wrap);

  const pagerLink = document.createElement("a");
  pagerLink.classList.add("blog-pager-older-link");
  pagerLink.setAttribute("href", "/blog?page=2");
  document.body.appendChild(pagerLink);

  const nextDocRoot = new MockDocument();
  const nextList = nextDocRoot.createElement("div");
  nextList.setAttribute("id", "postcards");
  const newCard = nextDocRoot.createElement("article");
  newCard.classList.add("gg-post-card");
  newCard.setAttribute("data-url", "https://www.pakrpp.com/post-10.html");
  nextList.appendChild(newCard);
  nextDocRoot.body.appendChild(nextList);
  const nextPager = nextDocRoot.createElement("a");
  nextPager.classList.add("blog-pager-older-link");
  nextPager.setAttribute("href", "/blog?page=3");
  nextDocRoot.body.appendChild(nextPager);

  let parseCalls = 0;
  GG.core.parseHtmlDoc = () => {
    parseCalls += 1;
    return nextDocRoot;
  };
  let fetchCalls = 0;
  window.fetch = async () => ({
    ok: (fetchCalls += 1) && true,
    url: "https://www.pakrpp.com/blog?page=2",
    text: async () => "<html></html>",
  });
  context.fetch = (...args) => window.fetch(...args);

  runSnippet(context, loadMoreSnippet, "loadmore.runtime");
  if (!GG.modules.listingLoadMore || typeof GG.modules.listingLoadMore.init !== "function") {
    throw new Error("listingLoadMore module not registered");
  }
  GG.modules.listingLoadMore.init(document);

  const state = wrap.__ggLoadMoreState || null;
  if (!state || !state.btn) {
    throw new Error("loadmore state not initialized");
  }
  if (!state.nextUrl) {
    throw new Error("loadmore nextUrl missing before click");
  }

  const liveBtn = wrap.querySelector("#loadmore");
  const before = list.querySelectorAll(".gg-post-card").length;
  liveBtn.dispatchEvent(new MockEvent("click", { target: liveBtn }));
  await new Promise((resolve) => setTimeout(resolve, 30));
  const after = list.querySelectorAll(".gg-post-card").length;

  if (!(after > before)) {
    const errText = (wrap.querySelector("[data-gg-loadmore-error]")?.textContent || "").trim();
    throw new Error(
      `load more click did not append cards (before=${before}, after=${after}) error="${errText || "-"}" fetchCalls=${fetchCalls} parseCalls=${parseCalls}`
    );
  }
  const nextVal = liveBtn.getAttribute("data-next") || "";
  return `cards ${before}->${after} next=${nextVal} fetchCalls=${fetchCalls} parseCalls=${parseCalls}`;
}

async function main() {
  const coreSource = readText(CORE_REL);
  const postSource = readText(POST_REL);
  const listingSource = readText(LISTING_REL);
  const authorsSource = readText(AUTHORS_REL);

  const dockSnippet = extractByRegex(
    coreSource,
    /GG\.modules\.Dock\s*=\s*\(function\s*\(\)\s*\{[\s\S]*?return \{[\s\S]*?\};\s*\}\)\(\);/,
    "dock"
  );
  const postDetailSnippet = extractByRegex(
    coreSource,
    /GG\.modules\.PostDetail\s*=\s*\(function\(\)\{[\s\S]*?return \{ init: init \};[\s\S]*?\}\)\(\);/,
    "postdetail"
  );
  const infoPanelSnippet = extractByRegex(
    coreSource,
    /GG\.modules\.InfoPanel\s*=\s*\(function\s*\(\)\s*\{[\s\S]*?return \{ init: init \};\s*\}\)\(\);/,
    "infopanel"
  );
  const tocSnippet = extractByRegex(
    postSource,
    /GG\.modules\.TOC\s*=\s*GG\.modules\.TOC\s*\|\|\s*\(function\(\)\{[\s\S]*?return \{ init: init, reset: reset, build: build \};\s*\}\)\(\);/,
    "toc"
  );
  const loadMoreSnippet = extractByRegex(
    listingSource,
    /G\.modules\.listingLoadMore\s*=\s*G\.modules\.listingLoadMore\s*\|\|\s*\(function\(\)\{[\s\S]*?return \{ init: init, rehydrate: rehydrate \};\s*\}\)\(\);/,
    "loadmore"
  );

  const rows = [];
  const failures = [];
  async function runOne(name, fn) {
    try {
      const detail = await fn();
      rows.push({ feature: name, status: "PASS", detail });
    } catch (error) {
      rows.push({
        feature: name,
        status: "FAIL",
        detail: error && error.message ? error.message : String(error),
      });
      failures.push(name);
    }
  }

  await runOne("dock", () => testDockRuntime(dockSnippet));
  await runOne("toolbar", () => testToolbarRuntime(postDetailSnippet));
  await runOne("post left info metadata panel", () => testPostLeftInfoRuntime(authorsSource));
  await runOne("TOC", () => testTocRuntime(tocSnippet));
  await runOne("right/sidebar metadata panel", () => testInfoPanelRuntime(infoPanelSnippet));
  await runOne("Load More Article", () => testLoadMoreRuntime(loadMoreSnippet));

  rows.forEach((row) => {
    console.log(`RUNTIME ${row.feature}: ${row.status} :: ${row.detail}`);
  });

  if (failures.length) {
    console.error(`VERIFY_RUNTIME_CORE_FEATURES: FAIL (${failures.join(", ")})`);
    process.exit(1);
  }
  console.log("VERIFY_RUNTIME_CORE_FEATURES: PASS");
}

main().catch((error) => {
  console.error("VERIFY_RUNTIME_CORE_FEATURES: FAIL");
  console.error(`- ${error && error.message ? error.message : String(error)}`);
  process.exit(1);
});
