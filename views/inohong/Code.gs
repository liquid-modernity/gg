/**
 * =========================================================================
 * INOHONG KBMS v2
 * Lightweight 2-sheet catalog backend for Blogger special surface.
 *
 * SHEETS
 * - user      : name | role | status | email
 * - kbms_sync : auto-managed by Drive sync
 * - kbms_meta : manual overlay metadata
 *
 * IMPORTANT
 * - This version is lightweight and fast.
 * - Login is session-gated, but it is still allowlist-based.
 * - It is NOT the same thing as hard identity verification.
 * - For real identity proof, add Google Sign-In / Id token verification later.
 * =========================================================================
 */

const MASTER_FOLDER_ID = '1I-L7blaVHbRBCcgBI5tVbVH4cfCO_3AT';

const SHEET_USERS = 'user';
const SHEET_SYNC = 'kbms_sync';
const SHEET_META = 'kbms_meta';
const LEGACY_SYNC_SHEET = 'kbms';

const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const CATALOG_CACHE_SECONDS = 60 * 5;     // 5 minutes
const API_VERSION = '2026-04-05.inohong.v2';
const DEFAULT_LANG = 'id';
const DEFAULT_ACCESS_LEVEL = 'internal';
const DEFAULT_STATUS = 'active';

const SYNC_HEADERS = [
  'doc_uid',
  'category',
  'subcategory',
  'title',
  'doc_id',
  'doc_type',
  'updated_at'
];

const META_HEADERS = [
  'doc_uid',
  'summary',
  'keywords',
  'owner',
  'audience',
  'access_level',
  'status',
  'sort_order',
  'featured',
  'lang'
];

const USER_HEADERS = ['name', 'role', 'status', 'email'];

function doGet(e) {
  return handleRequest_(e, 'GET');
}

function doPost(e) {
  return handleRequest_(e, 'POST');
}

function handleRequest_(e, method) {
  try {
    ensureSchema_();

    const request = parseRequest_(e, method);
    const action = String(request.action || '').trim();

    if (!action) {
      return jsonOutput_({ status: 'error', message: 'No action specified.' }, 400);
    }

    if (action === 'ping') {
      return jsonOutput_({
        status: 'success',
        apiVersion: API_VERSION,
        time: new Date().toISOString()
      });
    }

    if (action === 'login') {
      return handleLogin_(request);
    }

    if (action === 'logout') {
      return handleLogout_(request);
    }

    if (action === 'getCatalog') {
      return handleGetCatalog_(request);
    }

    if (action === 'adminSync') {
      return handleAdminSync_(request);
    }

    return jsonOutput_({ status: 'error', message: 'Unknown action.' }, 404);
  } catch (error) {
    console.error(error);
    return jsonOutput_({
      status: 'error',
      message: error && error.message ? error.message : 'Unexpected server error.'
    }, 500);
  }
}

function handleLogin_(request) {
  const email = normalizeEmail_(request.email);
  if (!email) {
    return jsonOutput_({ status: 'error', message: 'Email wajib diisi.' }, 400);
  }

  const user = findUserByEmail_(email);
  if (!user) {
    return jsonOutput_({ status: 'denied', message: 'Email tidak terdaftar atau akses nonaktif.' }, 403);
  }

  const session = createSession_(user);

  return jsonOutput_({
    status: 'success',
    apiVersion: API_VERSION,
    user: user,
    session: session
  });
}

function handleLogout_(request) {
  const token = String(request.token || '').trim();
  if (token) {
    CacheService.getScriptCache().remove(sessionCacheKey_(token));
  }
  return jsonOutput_({ status: 'success' });
}

function handleGetCatalog_(request) {
  const session = requireSession_(request.token);
  const catalog = getCatalog_(session.user);

  return jsonOutput_({
    status: 'success',
    apiVersion: API_VERSION,
    user: session.user,
    meta: {
      generatedAt: new Date().toISOString(),
      count: catalog.length
    },
    data: catalog
  });
}

function handleAdminSync_(request) {
  const session = requireSession_(request.token);
  const role = String(session.user.role || '').toLowerCase();
  if (role !== 'admin') {
    return jsonOutput_({ status: 'denied', message: 'Akses admin diperlukan.' }, 403);
  }

  autoSyncKBMS();
  return jsonOutput_({
    status: 'success',
    message: 'Sinkronisasi selesai.',
    time: new Date().toISOString()
  });
}

function parseRequest_(e, method) {
  const params = (e && e.parameter) ? e.parameter : {};
  if (method === 'POST' && e && e.postData && e.postData.contents) {
    try {
      const body = JSON.parse(e.postData.contents);
      return Object.assign({}, params, body || {});
    } catch (error) {
      throw new Error('Body JSON tidak valid.');
    }
  }
  return params;
}

function ensureSchema_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  ensureSheet_(ss, SHEET_USERS, USER_HEADERS);
  ensureSheet_(ss, SHEET_SYNC, SYNC_HEADERS);
  ensureSheet_(ss, SHEET_META, META_HEADERS);

  migrateLegacyKbmsIfNeeded_(ss);
}

function ensureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeader = headers.some(function(header, index) {
    return String(currentHeaders[index] || '') !== header;
  });

  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

function migrateLegacyKbmsIfNeeded_(ss) {
  const syncSheet = ss.getSheetByName(SHEET_SYNC);
  const hasSyncData = syncSheet && syncSheet.getLastRow() > 1;
  if (hasSyncData) return;

  const legacySheet = ss.getSheetByName(LEGACY_SYNC_SHEET);
  if (!legacySheet || legacySheet.getLastRow() <= 1) return;

  const rows = legacySheet.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const category = String(rows[i][0] || '').trim();
    const title = String(rows[i][1] || '').trim();
    const docId = String(rows[i][2] || '').trim();
    if (!title || !docId) continue;
    out.push([
      createDocUid_(docId),
      category || 'Uncategorized',
      '',
      title,
      docId,
      'doc',
      ''
    ]);
  }

  if (out.length) {
    syncSheet.getRange(2, 1, out.length, SYNC_HEADERS.length).setValues(out);
  }
}

function normalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeText_(value) {
  return String(value || '').trim();
}

function normalizeCsvText_(value) {
  return String(value || '')
    .split(',')
    .map(function(item) { return item.trim(); })
    .filter(Boolean)
    .join(', ');
}

function toBool_(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'featured'].indexOf(normalized) !== -1;
}

function toNumberOrDefault_(value, fallback) {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
}

function findUserByEmail_(email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const name = normalizeText_(rows[i][0]);
    const role = normalizeText_(rows[i][1]);
    const status = normalizeText_(rows[i][2]).toLowerCase();
    const rowEmail = normalizeEmail_(rows[i][3]);

    if (rowEmail === email && status === 'active') {
      return {
        name: name,
        role: role || 'member',
        status: status,
        email: rowEmail
      };
    }
  }

  return null;
}

function createSession_(user) {
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + (SESSION_TTL_SECONDS * 1000)).toISOString();
  const payload = {
    user: user,
    expiresAt: expiresAt,
    createdAt: new Date().toISOString()
  };

  CacheService.getScriptCache().put(
    sessionCacheKey_(token),
    JSON.stringify(payload),
    SESSION_TTL_SECONDS
  );

  return {
    token: token,
    expiresAt: expiresAt
  };
}

function requireSession_(token) {
  const normalizedToken = String(token || '').trim();
  if (!normalizedToken) {
    throw new Error('Session token tidak ditemukan.');
  }

  const raw = CacheService.getScriptCache().get(sessionCacheKey_(normalizedToken));
  if (!raw) {
    throw new Error('Session tidak valid atau sudah kedaluwarsa.');
  }

  const session = JSON.parse(raw);
  if (!session || !session.user) {
    throw new Error('Data session rusak.');
  }

  return session;
}

function sessionCacheKey_(token) {
  return 'session:' + token;
}

function catalogCacheKey_() {
  return 'catalog:' + API_VERSION;
}

function getCatalog_(requestUser) {
  const scriptCache = CacheService.getScriptCache();
  const cached = scriptCache.get(catalogCacheKey_());
  let merged = [];

  if (cached) {
    merged = JSON.parse(cached);
  } else {
    merged = buildMergedCatalog_();
    scriptCache.put(catalogCacheKey_(), JSON.stringify(merged), CATALOG_CACHE_SECONDS);
  }

  return merged
    .filter(function(item) {
      return isVisibleForUser_(item, requestUser);
    })
    .sort(compareCatalogItems_);
}

function buildMergedCatalog_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const syncSheet = ss.getSheetByName(SHEET_SYNC);
  const metaSheet = ss.getSheetByName(SHEET_META);

  const syncRows = rowsToObjects_(syncSheet.getDataRange().getValues());
  const metaRows = rowsToObjects_(metaSheet.getDataRange().getValues());
  const metaMap = {};

  metaRows.forEach(function(row) {
    const docUid = normalizeText_(row.doc_uid);
    if (!docUid) return;
    metaMap[docUid] = row;
  });

  return syncRows
    .map(function(row) {
      const docUid = normalizeText_(row.doc_uid || createDocUid_(row.doc_id));
      if (!docUid) return null;

      const meta = metaMap[docUid] || {};
      const category = normalizeText_(row.category) || 'Uncategorized';
      const subcategory = normalizeText_(row.subcategory);
      const title = normalizeText_(row.title);
      const docId = normalizeText_(row.doc_id);
      const docType = normalizeText_(row.doc_type) || 'doc';

      if (!title || !docId) return null;

      return {
        doc_uid: docUid,
        category: category,
        subcategory: subcategory,
        title: title,
        summary: normalizeText_(meta.summary),
        keywords: normalizeCsvText_(meta.keywords),
        doc_id: docId,
        doc_type: docType,
        icon: iconForDocType_(docType),
        owner: normalizeText_(meta.owner),
        audience: normalizeCsvText_(meta.audience),
        access_level: normalizeText_(meta.access_level).toLowerCase() || DEFAULT_ACCESS_LEVEL,
        status: normalizeText_(meta.status).toLowerCase() || DEFAULT_STATUS,
        sort_order: toNumberOrDefault_(meta.sort_order, 9999),
        featured: toBool_(meta.featured),
        lang: normalizeText_(meta.lang).toLowerCase() || DEFAULT_LANG,
        updated_at: normalizeText_(row.updated_at),
        search_text: [
          title,
          category,
          subcategory,
          normalizeText_(meta.summary),
          normalizeCsvText_(meta.keywords),
          normalizeText_(meta.owner)
        ].join(' ').toLowerCase()
      };
    })
    .filter(Boolean);
}

function rowsToObjects_(matrix) {
  if (!matrix || matrix.length < 2) return [];

  const headers = matrix[0].map(function(header) {
    return String(header || '').trim();
  });

  const out = [];
  for (let i = 1; i < matrix.length; i++) {
    const row = matrix[i];
    const obj = {};
    let hasValue = false;

    headers.forEach(function(header, index) {
      obj[header] = row[index];
      if (String(row[index] || '').trim() !== '') hasValue = true;
    });

    if (hasValue) out.push(obj);
  }
  return out;
}

function compareCatalogItems_(a, b) {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;

  const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
  const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
  if (aDate !== bDate) return bDate - aDate;

  return String(a.title || '').localeCompare(String(b.title || ''), 'id', { sensitivity: 'base' });
}

function isVisibleForUser_(item, user) {
  if (!item) return false;
  const status = String(item.status || '').toLowerCase();
  if (status !== 'active') return false;

  const userRole = String((user && user.role) || '').toLowerCase();
  const access = String(item.access_level || DEFAULT_ACCESS_LEVEL).toLowerCase();

  if (!access || access === 'internal' || access === 'public') return true;
  if (access === 'admin') return userRole === 'admin';

  const acceptedRoles = access.split(',').map(function(part) { return part.trim(); }).filter(Boolean);
  if (acceptedRoles.indexOf(userRole) !== -1) return true;

  return false;
}

function iconForDocType_(docType) {
  const type = String(docType || '').toLowerCase();
  switch (type) {
    case 'sheet': return 'table_view';
    case 'slide': return 'slideshow';
    case 'pdf': return 'picture_as_pdf';
    case 'folder': return 'folder';
    case 'link': return 'link';
    default: return 'description';
  }
}

function createDocUid_(docId) {
  return docId ? 'gdoc_' + String(docId).trim() : '';
}

function docTypeFromMime_(mimeType) {
  const mime = String(mimeType || '').toLowerCase();
  if (mime === MimeType.GOOGLE_DOCS || mime.indexOf('document') !== -1) return 'doc';
  if (mime === MimeType.GOOGLE_SHEETS || mime.indexOf('spreadsheet') !== -1) return 'sheet';
  if (mime === MimeType.GOOGLE_SLIDES || mime.indexOf('presentation') !== -1) return 'slide';
  if (mime === MimeType.PDF || mime.indexOf('pdf') !== -1) return 'pdf';
  return 'file';
}

function autoSyncKBMS() {
  ensureSchema_();

  if (!MASTER_FOLDER_ID || MASTER_FOLDER_ID === 'PASTE_MASTER_FOLDER_ID_HERE') {
    throw new Error('MASTER_FOLDER_ID belum diisi.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_SYNC);
    const masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);
    const rows = [];

    collectFolderRows_(masterFolder, [], rows);

    rows.sort(function(a, b) {
      const left = (String(a[1] || '') + '|' + String(a[2] || '') + '|' + String(a[3] || '')).toLowerCase();
      const right = (String(b[1] || '') + '|' + String(b[2] || '') + '|' + String(b[3] || '')).toLowerCase();
      return left.localeCompare(right, 'id', { sensitivity: 'base' });
    });

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, SYNC_HEADERS.length).clearContent();
    }

    if (rows.length) {
      sheet.getRange(2, 1, rows.length, SYNC_HEADERS.length).setValues(rows);
    }

    CacheService.getScriptCache().remove(catalogCacheKey_());
  } finally {
    lock.releaseLock();
  }
}

function collectFolderRows_(folder, path, rows) {
  const category = path[0] || 'Uncategorized';
  const subcategory = path.length > 1 ? path.slice(1).join(' / ') : '';

  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();
    rows.push([
      createDocUid_(fileId),
      category,
      subcategory,
      file.getName(),
      fileId,
      docTypeFromMime_(file.getMimeType()),
      file.getLastUpdated().toISOString()
    ]);
  }

  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    const subfolder = subfolders.next();
    const nextPath = path.concat([subfolder.getName()]);
    collectFolderRows_(subfolder, nextPath, rows);
  }
}

function jsonOutput_(payload, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);

  // ContentService cannot set HTTP status directly in Apps Script web apps.
  // statusCode is accepted here for readability and future Worker mapping.
  return output;
}
