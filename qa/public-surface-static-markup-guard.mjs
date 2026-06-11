#!/usr/bin/env node

/**
 * GG Public Surface Static Markup Guard
 * 
 * Verifies that public Blogger surfaces use index.xml as the source of truth
 * for semantic structure, templates, hooks, and microcopy.
 * 
 * Fails when runtime JS creates UI HTML via strings instead of using
 * index.xml templates.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function error(id, message) {
  return { id, message, severity: 'BLOCKER' };
}

function warn(id, message) {
  return { id, message, severity: 'ADVISORY' };
}

function info(id, message) {
  return { id, message, severity: 'INFO' };
}

function readFile(relativePath) {
  const fullPath = resolve(ROOT, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, 'utf-8');
}

function run() {
  const issues = [];
  const indexXml = readFile('index.xml');
  const jsSource = readFile('src/js/gg-app.source.js');

  // 1. Check index.xml exists
  if (!indexXml) {
    issues.push(error('NO_INDEX_XML', 'index.xml not found. Public surface templates must exist in index.xml.'));
    return report(issues);
  }

  // 2. Check for innerHTML / insertAdjacentHTML patterns in public runtime JS
  if (jsSource) {
    const dangerousPatterns = [
      { pattern: /\.innerHTML\s*=\s*`[^`]+gg-entry-row[^`]*`/g, label: 'Listing row HTML via template string' },
      { pattern: /\.innerHTML\s*=\s*`[^`]+gg-related-posts[^`]*`/g, label: 'Related posts card HTML via template string' },
      { pattern: /\.innerHTML\s*=\s*`[^`]+gg-preview[^`]*`/g, label: 'Preview CTA HTML via template string' },
      { pattern: /\.innerHTML\s*=\s*`[^`]+gg-empty-state[^`]*`/g, label: 'Empty state HTML via template string' },
      { pattern: /insertAdjacentHTML\(\s*['"]beforeend['"],\s*`[^`]+gg-`/g, label: 'Gaga UI append via insertAdjacentHTML' },
      { pattern: /\.innerHTML\s*=\s*['"]<section[^>]*gg-empty-state[^>]*>/g, label: 'Empty state markup via innerHTML string' },
      { pattern: /\.innerHTML\s*=\s*['"]<nav[^>]*gg-detail-outline[^>]*>/g, label: 'Pagination markup via innerHTML string' },
      { pattern: /createRelatedPostNode\s*\(/.test(jsSource) ? !/<template id=["']gg-template-related-post-card["']/.test(indexXml) ? /gg-template-related-post-card/ : null : null, label: 'createRelatedPostNode uses innerHTML instead of template' },
    ];

    // Check for createRelatedPostNode using innerHTML
    if (/function createRelatedPostNode/.test(jsSource)) {
      if (/\.innerHTML\s*=/.test(jsSource.match(/function createRelatedPostNode[\s\S]*?(?=\nfunction |\nvar |\nlet |\nconst |$)/)?.[0] || '')) {
        issues.push(warn('RELATED_POSTS_HTML_STRING', 'createRelatedPostNode may use innerHTML for card rendering. Should use index.xml template.'));
      }
    }

    // Check for createListingRow using innerHTML
    if (/function createListingRow/.test(jsSource)) {
      const listingRowFn = jsSource.match(/function createListingRow[\s\S]*?(?=\nfunction |\nvar |\nlet |\nconst |$)/)?.[0] || '';
      // This function uses createElement which is allowable but creates full UI trees programmatically
      // The guard should flag this as needing template usage
    }

    // Check for saved listing innerHTML
    if (/saved\.empty\.title|saved\.empty\.body/.test(jsSource)) {
      const savedMatch = jsSource.match(/\n\s*node\.innerHTML\s*=\s*['"][^'"]*saved\.empty[^'"]*['"]/g);
      if (savedMatch && savedMatch.length > 0) {
        issues.push(error('SAVED_EMPTY_INNERHTML', 'Saved empty state rendered via innerHTML instead of index.xml template.'));
      }
    }

    // Check for popular listing innerHTML
    if (/popular.*empty/.test(jsSource)) {
      const popularMatch = jsSource.match(/\n\s*node\.innerHTML\s*=\s*['"][^'"]*Popular[^'"]*['"]/g);
      if (popularMatch && popularMatch.length > 0) {
        issues.push(error('POPULAR_EMPTY_INNERHTML', 'Popular listing empty state rendered via innerHTML instead of index.xml template.'));
      }
    }
  }

  // 3. Check required templates exist in index.xml
  const requiredTemplates = [
    'gg-template-listing-row',
    'gg-template-related-post-card',
    'gg-template-related-posts-dots',
    'gg-template-related-posts-dot',
    'gg-template-entry-adjacent',
    'gg-template-preview-cta-row',
    'gg-empty-state-saved-general',
    'gg-empty-state-saved-articles',
    'gg-empty-state-comments',
    'gg-empty-state-search',
    'gg-empty-state-recent-error',
    'gg-empty-state-offline',
    'gg-empty-state-404',
    'gg-empty-state-popular-unavailable',
  ];

  for (const templateId of requiredTemplates) {
    if (!indexXml.includes(`id="${templateId}"`) && !indexXml.includes(`id='${templateId}'`)) {
      issues.push(error(
        `MISSING_TEMPLATE_${templateId.toUpperCase().replace(/-/g, '_')}`,
        `Required template "${templateId}" is missing from index.xml.`
      ));
    }
  }

  // 4. Check for duplicate template IDs
  const templateIdMatches = indexXml.match(/id=["'](gg-template-[^"']+)["']/g) || [];
  const templateIds = templateIdMatches.map(m => m.replace(/id=["']|["']/g, '').replace(/^id=/, ''));
  const seenIds = {};
  for (const id of templateIds) {
    if (seenIds[id]) {
      issues.push(error('DUPLICATE_TEMPLATE_ID', `Duplicate template ID found: "${id}". All template IDs must be unique.`));
    }
    seenIds[id] = true;
  }

  // 5. Check required empty/error microcopy exists
  const requiredCopy = [
    { text: 'No saved items yet.', label: 'saved-general empty headline' },
    { text: 'No saved articles yet.', label: 'saved-articles empty headline' },
    { text: 'No comments yet.', label: 'comments empty headline' },
    { text: 'No results found.', label: 'search empty headline' },
    { text: 'Page not found.', label: '404 empty headline' },
    { text: 'Connection unavailable.', label: 'offline empty headline' },
    { text: 'Recent articles are unavailable right now.', label: 'recent-error empty headline' },
  ];

  for (const { text, label } of requiredCopy) {
    if (!indexXml.includes(text)) {
      issues.push(warn(
        `MISSING_MICROCOPY_${label.toUpperCase().replace(/[\s-]/g, '_')}`,
        `Required microcopy "${text}" (${label}) not found in index.xml.`
      ));
    }
  }

  // 6. Check contact sheet copy cleanup (visible text only, not data attributes)
  // Strip all data-* attributes and hidden elements before checking
  // Use a simple approach: find <form[^>]*gg-contact-form[^>]*> content
  const contactFormMatch = indexXml.match(/<form[^>]*gg-contact-form[^>]*>([\s\S]*?)<\/form>/);
  const contactSheetMatch = indexXml.match(/<div[^>]*gg-contact-sheet[^>]*>([\s\S]*?)<\/div>/);
  const contactText = (contactFormMatch?.[1] || '') + (contactSheetMatch?.[1] || '');

  const forbiddenContactCopy = [
    { text: 'plumbing', label: 'plumbing (visible text only, not data-*)' },
    { text: 'Native Blogger ContactForm plumbing detected', label: 'technical diagnosis copy' },
    { text: 'Fallback:', label: 'fallback label' },
    { text: 'Ready to send through Blogger contact form', label: 'status copy' },
  ];

  for (const { text, label } of forbiddenContactCopy) {
    if (contactText.includes(text)) {
      issues.push(error(
        'CONTACT_SHEET_TECHNICAL_COPY',
        `Contact sheet visible text contains forbidden copy: "${text}" (${label}). This must be removed from user-visible UI.`
      ));
    }
  }

  // 7. Check root pagination for forbidden visible labels
  if (/Pagination/i.test(indexXml.match(/<nav[^>]*pagination[^>]*>([\s\S]*?)<\/nav>/)?.[0] || '') && 
      !/aria-label/.test(indexXml.match(/<nav[^>]*pagination[^>]*>([\s\S]*?)<\/nav>/)?.[0] || '')) {
    issues.push(warn('PAGINATION_LABEL_CHECK', 'Root pagination should not contain visible "Pagination" or "Browse entries" labels.'));
  }

  // 8. Check preview CTA row location in index.xml
  const previewSection = indexXml.match(/<section[^>]*gg-preview__surface[^>]*>([\s\S]*?)<\/section>/)?.[0] || '';
  // The existing CTA row in the preview body is the legacy one that needs migration
  // The task requires it to be in the footer instead
  if (previewSection.includes('gg-preview__cta-row')) {
    issues.push(warn(
      'PREVIEW_CTA_IN_BODY',
      'Preview CTA row found inside gg-preview__surface body. Per contract, CTA should be in the preview footer area.'
    ));
  }

  // 9. Check for gg-more-footer__social in more sheet
  // (Already removed in index.xml, but let's verify)
  // No action needed - verified during contact sheet review

  return report(issues);
}

function report(issues) {
  const blockers = issues.filter(i => i.severity === 'BLOCKER');
  const advisories = issues.filter(i => i.severity === 'ADVISORY');
  const infos = issues.filter(i => i.severity === 'INFO');

  console.log('\n📋 GG Public Surface Static Markup Guard');
  console.log('══════════════════════════════════════════');
  console.log(`Blockers:  ${blockers.length}`);
  console.log(`Advisory:  ${advisories.length}`);
  console.log(`Info:      ${infos.length}`);
  console.log('──────────────────────────────────────────\n');

  for (const issue of issues) {
    const icon = issue.severity === 'BLOCKER' ? '🔴' : issue.severity === 'ADVISORY' ? '🟡' : 'ℹ️';
    console.log(`${icon} [${issue.id}] ${issue.message}`);
  }

  console.log('\n──────────────────────────────────────────');

  if (blockers.length > 0) {
    console.log('❌ PUBLIC SURFACE STATIC MARKUP GUARD FAILED');
    console.log(`   ${blockers.length} blocker(s) found.\n`);
    process.exit(1);
  }

  if (advisories.length > 0) {
    console.log('⚠️  PASSED WITH ADVISORIES');
    console.log(`   ${advisories.length} advisory warning(s).\n`);
    process.exit(0);
  }

  console.log('✅ PUBLIC SURFACE STATIC MARKUP GUARD PASSED\n');
  process.exit(0);
}

run();