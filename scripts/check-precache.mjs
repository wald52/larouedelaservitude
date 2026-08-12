#!/usr/bin/env node
// Vérifie que la PWA est réellement utilisable hors ligne après un seul
// chargement, et qu'une seule version peut être servie à la fois :
//
// 1. CACHE_VERSION (service-worker.js) === APP_VERSION (js/constants.js) ;
// 2. chaque URL de `urlsToCache` existe bien sur le disque (cache.put échouerait
//    sinon, et l'installation entière serait abandonnée) ;
// 3. chaque ressource locale référencée par index.html, le manifeste, les
//    modules JS et les feuilles de style figure dans `urlsToCache` — sinon elle
//    n'est téléchargée qu'au premier usage en ligne, et un tout premier
//    lancement hors ligne échoue.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Ressources volontairement hors du pré-cache.
const NEVER_PRECACHED = new Set([
  'service-worker.js' // Doit toujours être rechargé depuis le réseau.
]);

// Fichiers dont on analyse les références.
const SCANNED_PAGES = ['index.html', 'donnees.html'];

const SCANNED_SCRIPTS = [
  'js/app.js',
  'js/entries.js',
  'js/audio.js',
  'js/menu.js',
  'js/constants.js',
  'js/settings.js',
  'js/sw-update.js',
  'js/data-explorer.js',
  'js/stats.js',
  'js/charts.js',
  'bills.js'
];

const SCANNED_STYLES = ['bills.css', 'menu.css', 'donnees.css'];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

// `${BASE}/js/app.js` → `js/app.js`
function normalize(reference, fromFile = 'index.html') {
  let value = reference.trim().replace(/^\$\{BASE\}\//, '');
  if (!value || value.startsWith('#') || value.startsWith('data:')) return null;
  if (/^[a-z]+:/i.test(value) || value.startsWith('//')) return null; // URL absolue

  value = value.split('?')[0].split('#')[0];
  if (!value) return null;

  const base = value.startsWith('/') ? root : path.join(root, path.dirname(fromFile));
  const absolute = path.resolve(base, value.replace(/^\//, ''));
  let relative = path.relative(root, absolute).replaceAll(path.sep, '/');

  if (!relative || relative.startsWith('..')) return null;
  if (relative.endsWith('/') || value.endsWith('/')) relative += 'index.html';
  if (relative === '') relative = 'index.html';

  return relative;
}

function extractCacheVersion() {
  const match = read('service-worker.js').match(/const\s+CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function extractAppVersion() {
  const match = read('js/constants.js').match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function extractPrecachedPaths() {
  const source = read('service-worker.js');
  const block = source.match(/const\s+urlsToCache\s*=\s*\[([\s\S]*?)\n\];/);
  if (!block) return null;

  const paths = [];
  const entryRe = /`\$\{BASE\}\/([^`]*)`/g;
  let match;
  while ((match = entryRe.exec(block[1]))) {
    paths.push(match[1]);
  }
  return paths;
}

// Références locales d'un document HTML (src, href) et d'un manifeste.
function collectHtmlReferences(file) {
  const source = read(file);
  const references = [];
  const attributeRe = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = attributeRe.exec(source))) {
    const normalized = normalize(match[1], file);
    if (normalized) references.push(normalized);
  }
  return references;
}

function collectManifestReferences() {
  const manifest = JSON.parse(read('site.webmanifest'));
  const references = [];
  for (const icon of manifest.icons || []) {
    const normalized = normalize(icon.src, 'site.webmanifest');
    if (normalized) references.push(normalized);
  }
  const start = normalize(manifest.start_url || './', 'site.webmanifest');
  if (start) references.push(start);
  return references;
}

// Imports relatifs + chemins de ressources écrits en dur dans les modules.
function collectScriptReferences(file) {
  const source = read(file);
  const references = [];

  // Les imports se résolvent par rapport au module...
  const importPatterns = [
    /import\s+(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(source))) {
      const normalized = normalize(match[1], file);
      if (normalized) references.push(normalized);
    }
  }

  // ...tandis que les chemins de ressources sont écrits par rapport à la racine
  // du site (ils sont préfixés par BASE_PATH à l'exécution).
  const assetRe = /["'`]((?:\.\/)?(?:audio|images|icons|data)\/[^"'`]+)["'`]/g;
  let match;
  while ((match = assetRe.exec(source))) {
    const normalized = normalize(match[1], 'index.html');
    if (normalized) references.push(normalized);
  }

  return references;
}

function collectStyleReferences(file) {
  const source = read(file);
  const references = [];
  const urlRe = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  let match;
  while ((match = urlRe.exec(source))) {
    const normalized = normalize(match[1], file);
    if (normalized) references.push(normalized);
  }
  return references;
}

export function collectPrecacheIssues() {
  const issues = [];

  const cacheVersion = extractCacheVersion();
  const appVersion = extractAppVersion();

  if (!cacheVersion) issues.push('CACHE_VERSION introuvable dans service-worker.js');
  if (!appVersion) issues.push('APP_VERSION introuvable dans js/constants.js');
  if (cacheVersion && appVersion && cacheVersion !== appVersion) {
    issues.push(
      `Versions désynchronisées : CACHE_VERSION=${cacheVersion} (service-worker.js) ` +
        `vs APP_VERSION=${appVersion} (js/constants.js)`
    );
  }

  const precached = extractPrecachedPaths();
  if (!precached) {
    issues.push('Liste urlsToCache introuvable dans service-worker.js');
    return issues;
  }

  const precachedSet = new Set(precached);

  if (precached.length !== precachedSet.size) {
    issues.push('urlsToCache contient des doublons');
  }

  for (const entry of precached) {
    if (!existsSync(path.join(root, entry))) {
      issues.push(`urlsToCache référence un fichier absent : ${entry}`);
    }
    if (NEVER_PRECACHED.has(entry)) {
      issues.push(`${entry} ne doit jamais être pré-caché`);
    }
  }

  const referenced = new Map();
  const addAll = (source, list) => {
    for (const reference of list) {
      if (!referenced.has(reference)) referenced.set(reference, source);
    }
  };

  for (const page of SCANNED_PAGES) addAll(page, collectHtmlReferences(page));
  addAll('site.webmanifest', collectManifestReferences());
  for (const file of SCANNED_SCRIPTS) addAll(file, collectScriptReferences(file));
  for (const file of SCANNED_STYLES) addAll(file, collectStyleReferences(file));

  for (const [reference, source] of referenced) {
    if (NEVER_PRECACHED.has(reference)) continue;
    if (!existsSync(path.join(root, reference))) {
      issues.push(`${source} référence un fichier absent : ${reference}`);
      continue;
    }
    if (!precachedSet.has(reference)) {
      issues.push(`${reference} (référencé par ${source}) manque dans urlsToCache`);
    }
  }

  return issues;
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const issues = collectPrecacheIssues();
  if (issues.length) {
    console.error('Vérification du pré-cache échouée :');
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }
  const count = extractPrecachedPaths().length;
  console.log(`Vérification du pré-cache réussie (${count} ressources, version ${extractAppVersion()}).`);
}
