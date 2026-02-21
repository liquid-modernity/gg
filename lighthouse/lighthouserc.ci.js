"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const budgetsPath = path.join(root, "docs/perf/BUDGETS.json");
const urlsPath = path.join(root, "docs/perf/URLS.json");

function readJson(absPath) {
  const raw = fs.readFileSync(absPath, "utf8");
  return JSON.parse(raw);
}

function getUrls() {
  if (!fs.existsSync(urlsPath)) {
    throw new Error("Missing docs/perf/URLS.json");
  }
  const payload = readJson(urlsPath);
  const urls = payload && payload.urls ? payload.urls : {};
  return [urls.home, urls.listing, urls.post].filter(Boolean);
}

const budgets = readJson(budgetsPath);
const ratchet = (budgets && budgets.ratchet) || {};
const urls = getUrls();

if (!urls.length) {
  throw new Error("No Lighthouse URLs found in docs/perf/URLS.json");
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
