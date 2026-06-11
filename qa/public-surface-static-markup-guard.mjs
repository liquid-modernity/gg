#!/usr/bin/env node

/**
 * GG Public Surface Static Markup Guard — 004C-R Reset
 *
 * Minimal focused tripwire. Checks only the exact regressions found.
 *
 * Verifies:
 * 1. createListingRow does not build Gaga row UI with document.createElement.
 * 2. createPopularControls does not build public controls with document.createElement.
 * 3. createRelatedPostNode does not build related cards with document.createElement.
 * 4. renderRelatedPosts does not build dots with document.createElement.
 * 5. Preview CTA row physically lives inside gg-preview__footer.
 * 6. Body-level duplicate gg-preview__cta-row does not exist.
 * 7. Hard-coded #fbfaf4 and #f4f3ed are not used in component CSS outside token declarations.
 *
 * Ignores:
 * - apps/console/**
 * - test files
 * - build scripts
 * - sanitized article body/content handling
 * - token declaration files
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const B = 'BLOCKER';
const W = 'ADVISORY';

function issue(severity, id, message) {
  return { severity, id, message };
}

function readFile(relativePath) {
  const fullPath = resolve(ROOT, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, 'utf-8');
}

/**
 * Extract a function body from JS source.
 * Searches for "function NAME(" and returns text until next top-level "function ".
 */
function extractFunctionBody(source, name) {
  var startRe = new RegExp('function ' + name + '\\(');
  var startMatch = source.match(startRe);
  if (!startMatch) return '';
  var startIdx = startMatch.index;
  var rest = source.substring(startIdx);
  var nextFn = rest.match(/\nfunction /);
  var endIdx = nextFn ? startIdx + nextFn.index : source.length;
  return source.substring(startIdx, endIdx);
}

function run() {
  var issues = [];
  var indexXml = readFile('index.xml');
  var jsSource = readFile('src/js/gg-app.source.js');

  // --- 1. createListingRow must not build Gaga row UI with document.createElement ---
  if (jsSource) {
    var createListingRowBody = extractFunctionBody(jsSource, 'createListingRow');
    if (createListingRowBody) {
      var createElCount1 = (createListingRowBody.match(/document\.createElement\(/g) || []).length;
      if (createElCount1 > 1) {
        issues.push(issue(B, 'LISTING_ROW_CREATE_ELEMENT',
          'createListingRow uses document.createElement ' + createElCount1 + ' times to build Gaga row UI. Must clone template gg-template-listing-row instead.'));
      }
    }
  }

  // --- 2. createPopularControls must not build public controls with document.createElement ---
  if (jsSource) {
    var createPopularControlsBody = extractFunctionBody(jsSource, 'createPopularControls');
    if (createPopularControlsBody) {
      var createElCount2 = (createPopularControlsBody.match(/document\.createElement\(/g) || []).length;
      if (createElCount2 > 1) {
        issues.push(issue(B, 'POPULAR_CONTROLS_CREATE_ELEMENT',
          'createPopularControls uses document.createElement ' + createElCount2 + ' times to build public controls. Must clone template gg-template-popular-range-selector.'));
      }
    }
  }

  // --- 3. createRelatedPostNode must not build related cards with document.createElement ---
  if (jsSource) {
    var createRelatedPostNodeBody = extractFunctionBody(jsSource, 'createRelatedPostNode');
    if (createRelatedPostNodeBody) {
      var createElCount3 = (createRelatedPostNodeBody.match(/document\.createElement\(/g) || []).length;
      if (createElCount3 > 1) {
        issues.push(issue(B, 'RELATED_POST_CREATE_ELEMENT',
          'createRelatedPostNode uses document.createElement ' + createElCount3 + ' times to build related cards. Must clone template gg-template-related-post-card.'));
      }
    }
  }

  // --- 4. renderRelatedPosts must not build dots with document.createElement ---
  if (jsSource) {
    var renderRelatedPostsBody = extractFunctionBody(jsSource, 'renderRelatedPosts');
    if (renderRelatedPostsBody) {
      var dotCreateEl = renderRelatedPostsBody.match(/document\.createElement\(\s*['"]button['"]|document\.createElement\(\s*['"]div['"]/g);
      if (dotCreateEl && dotCreateEl.length > 0 && renderRelatedPostsBody.indexOf('gg-related-posts__dot') !== -1) {
        issues.push(issue(B, 'RELATED_DOTS_CREATE_ELEMENT',
          'renderRelatedPosts builds related dots with document.createElement. Must clone template gg-template-related-posts-dot.'));
      }
    }
  }

  // --- 5. Preview CTA row physically lives inside gg-preview__footer ---
  if (indexXml) {
    // Check: the footer section should contain gg-preview__cta-row
    var footerSection = indexXml.match(/<footer[^>]*gg-preview__footer[^>]*>([\s\S]*?)<\/footer>/);
    if (footerSection) {
      if (!footerSection[1].includes('gg-preview__cta-row')) {
        issues.push(issue(B, 'PREVIEW_CTA_NOT_IN_FOOTER',
          'Preview CTA row not found inside gg-preview__footer. CTA must physically live in the footer.'));
      }
    } else {
      issues.push(issue(B, 'PREVIEW_FOOTER_MISSING', 'gg-preview__footer element not found in index.xml.'));
    }
  }

  // --- 6. Body-level duplicate gg-preview__cta-row does not exist ---
  if (indexXml) {
    // Find all gg-preview__cta-row occurrences
    var ctaMatches = indexXml.match(/class=['"]gg-preview__cta-row['"]/g) || [];
    if (ctaMatches.length > 1) {
      issues.push(issue(B, 'DUPLICATE_PREVIEW_CTA',
        'Found ' + ctaMatches.length + ' gg-preview__cta-row instances. Only one (in footer) should exist.'));
    }
  }

  // --- 7. Hard-coded #fbfaf4 and #f4f3ed not in component CSS outside tokens ---
  var cssFiles = ['src/css/gg-app.source.css', 'src/css/gg-critical.source.css'];
  var tokenFiles = ['src/css/tokens.css', 'src/css/gg-tokens.css', 'src/css/variables.css'];
  for (var ci = 0; ci < cssFiles.length; ci++) {
    var cssPath = resolve(ROOT, cssFiles[ci]);
    if (!existsSync(cssPath)) continue;
    var cssContent = readFileSync(cssPath, 'utf-8');
    var lines = cssContent.split('\n');
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      if (/#fbfaf4|#f4f3ed/i.test(line)) {
        issues.push(issue(B, 'HARD_CODED_COLOR',
          'Hard-coded color found in ' + cssFiles[ci] + ' line ' + (li + 1) + ': ' + line.trim().substring(0, 80) +
          '. Replace with Gaga token.'));
      }
    }
  }

  // Also check index.xml inline CSS for hard-coded colors (skip token declarations)
  if (indexXml) {
    var indexLines = indexXml.split('\n');
    for (var il = 0; il < indexLines.length; il++) {
      var iline = indexLines[il];
      if (/#fbfaf4|#f4f3ed/i.test(iline)) {
        // Allow CSS custom property token declarations (--gg-*)
        if (/^\s*--[a-zA-Z-]+\s*:/.test(iline)) continue;
        issues.push(issue(B, 'HARD_CODED_COLOR_XML',
          'Hard-coded color found in index.xml line ' + (il + 1) + ': ' + iline.trim().substring(0, 80) +
          '. Replace with Gaga token.'));
      }
    }
  }

  return report(issues);
}

function report(issues) {
  var blockers = issues.filter(function(i) { return i.severity === 'BLOCKER'; });
  var advisories = issues.filter(function(i) { return i.severity === 'ADVISORY'; });

  console.log('\n📋 GG Public Surface Static Markup Guard');
  console.log('══════════════════════════════════════════');
  console.log('Blockers:  ' + blockers.length);
  console.log('Advisory:  ' + advisories.length);
  console.log('──────────────────────────────────────────\n');

  for (var idx = 0; idx < issues.length; idx++) {
    var item = issues[idx];
    var icon = item.severity === 'BLOCKER' ? '🔴' : '🟡';
    console.log(icon + ' [' + item.id + '] ' + item.message);
  }

  console.log('\n──────────────────────────────────────────');

  if (blockers.length > 0) {
    console.log('❌ PUBLIC SURFACE STATIC MARKUP GUARD FAILED');
    console.log('   ' + blockers.length + ' blocker(s) found.\n');
    process.exit(1);
  }

  if (advisories.length > 0) {
    console.log('⚠️  PASSED WITH ADVISORIES');
    console.log('   ' + advisories.length + ' advisory warning(s).\n');
    process.exit(0);
  }

  console.log('✅ PUBLIC SURFACE STATIC MARKUP GUARD PASSED\n');
  process.exit(0);
}

run();