"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const budgetsPath = path.join(root, "docs/perf/BUDGETS.json");
const urlsPath = path.join(root, "docs/perf/URLS.json");
const baselinePath = path.join(root, "docs/perf/BASELINE.md");

function readJson(absPath) {
  const raw = fs.readFileSync(absPath, "utf8");
  return JSON.parse(raw);
}

function parseUrlsFromBaseline(absPath) {
  const raw = fs.readFileSync(absPath, "utf8");
  const found = {};
  const rowRe = /^\|\s*(HOME|LISTING|POST)\s*\|\s*(https?:\/\/[^\s|]+)\s*\|/gim;
  let m;
  while ((m = rowRe.exec(raw))) {
    const key = String(m[1] || "").toLowerCase();
    found[key] = String(m[2] || "").trim();
  }
  return [found.home, found.listing, found.post].filter(Boolean);
}

function getUrls() {
  if (fs.existsSync(urlsPath)) {
    const payload = readJson(urlsPath);
    const surfaces = payload && payload.surfaces ? payload.surfaces : {};
    return [surfaces.home, surfaces.listing, surfaces.post].filter(Boolean);
  }
  return parseUrlsFromBaseline(baselinePath);
}

const budgets = readJson(budgetsPath);
const ratchet = (budgets && budgets.ratchet) || {};
const urls = getUrls();

if (!urls.length) {
  throw new Error("No Lighthouse URLs found (docs/perf/URLS.json or BASELINE.md)");
}

module.exports = {
  ci: {
    collect: {
      url: urls,
      numberOfRuns: 3,
      settings: {
        preset: "mobile",
        throttlingMethod: "simulate",
      },
    },
    assert: {
      assertions: {
        "largest-contentful-paint": ["error", { maxNumericValue: ratchet.max_lcp_ms }],
        "cumulative-layout-shift": ["error", { maxNumericValue: ratchet.max_cls }],
        "interaction-to-next-paint": ["error", { maxNumericValue: ratchet.max_inp_ms }],
        "total-blocking-time": ["error", { maxNumericValue: ratchet.max_tbt_ms }],
        "total-byte-weight": ["error", { maxNumericValue: ratchet.max_transfer_kb * 1024 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
