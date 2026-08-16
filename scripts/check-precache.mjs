#!/usr/bin/env node
// Vérifie que la PWA est réellement utilisable hors ligne après un seul
// chargement :
//
// 1. chaque URL de la liste ASSETS (générée dans service-worker.js) existe bien
//    sur le disque — sinon `cache.put` échoue et l'installation entière est
//    abandonnée ;
// 2. chaque ressource locale référencée par les pages, le manifeste, les
//    modules JS et les feuilles de style figure dans ASSETS — sinon elle n'est
//    téléchargée qu'au premier usage en ligne, et un tout premier lancement
//    hors ligne échoue.
//
// Ce qui n'est PLUS vérifié ici, parce que ce n'est plus vérifiable : il n'y a
// plus de numéro de version à tenir synchronisé entre deux fichiers. Le nom de
// la génération est un hachage du contenu publié, calculé par
// scripts/stamp-assets.mjs ; c'est `npm run check:stamp` qui garantit qu'il est
// à jour.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Ressources volontairement hors du pré-cache.
const NEVER_PRECACHED = new Set([
  "service-worker.js" // Doit toujours être rechargé depuis le réseau.
]);

// Les deux documents navigables. Tout le reste de ce qu'on analyse (modules,
// feuilles de style) est déduit de la liste ASSETS elle-même : ajouter un module
// ne demande donc de le déclarer nulle part.
const SCANNED_PAGES = ["index.html", "donnees.html"];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

// "./js/app.js?v=abc12345" → "js/app.js"
function normalize(reference, fromFile = "index.html") {
  let value = reference.trim();
  if (!value || value.startsWith("#") || value.startsWith("data:")) return null;
  if (/^[a-z]+:/i.test(value) || value.startsWith("//")) return null; // URL absolue

  value = value.split("?")[0].split("#")[0];
  if (!value) return null;

  const base = value.startsWith("/") ? root : path.join(root, path.dirname(fromFile));
  const absolute = path.resolve(base, value.replace(/^\//, ""));
  let relative = path.relative(root, absolute).replaceAll(path.sep, "/");

  if (relative.startsWith("..")) return null;
  if (relative.endsWith("/") || value.endsWith("/")) relative += "index.html";
  if (relative === "") relative = "index.html";

  return relative;
}

// Le bloc généré de service-worker.js : des chaînes JSON, une par ligne.
//
// Les URLs sont rendues telles quelles *et* normalisées. Les deux vues sont
// nécessaires : « ./ » et « ./index.html » désignent le même fichier — c'est
// voulu, ce sont deux clés de cache distinctes — mais doivent rester deux
// entrées distinctes de la liste.
function extractPrecachedUrls() {
  const source = read("service-worker.js");
  const block = source.match(/const\s+ASSETS\s*=\s*\[([\s\S]*?)\n\];/);
  if (!block) return null;

  const urls = [];
  const entryRe = /"([^"]+)"/g;
  let match;
  while ((match = entryRe.exec(block[1]))) {
    urls.push(match[1]);
  }
  return urls;
}

function extractPrecachedPaths() {
  return (extractPrecachedUrls() ?? []).map((url) => normalize(url)).filter(Boolean);
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
  const manifest = JSON.parse(read("site.webmanifest"));
  const references = [];
  for (const icon of manifest.icons || []) {
    const normalized = normalize(icon.src, "site.webmanifest");
    if (normalized) references.push(normalized);
  }
  const start = normalize(manifest.start_url || "./", "site.webmanifest");
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
    const normalized = normalize(match[1], "index.html");
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

  const urls = extractPrecachedUrls();
  if (!urls) {
    issues.push("Liste ASSETS introuvable dans service-worker.js");
    return issues;
  }

  if (urls.length !== new Set(urls).size) {
    issues.push("ASSETS contient des URLs en double");
  }

  const precached = urls.map((url) => normalize(url)).filter(Boolean);
  const precachedSet = new Set(precached);

  for (const entry of precached) {
    if (!existsSync(path.join(root, entry))) {
      issues.push(`ASSETS référence un fichier absent : ${entry}`);
    }
    if (NEVER_PRECACHED.has(entry)) {
      issues.push(`${entry} ne doit jamais être pré-caché`);
    }
  }

  // Les fichiers à analyser sortent de la liste elle-même.
  const scripts = precached.filter((p) => p.endsWith(".js"));
  const styles = precached.filter((p) => p.endsWith(".css"));

  const referenced = new Map();
  const addAll = (source, list) => {
    for (const reference of list) {
      if (!referenced.has(reference)) referenced.set(reference, source);
    }
  };

  for (const page of SCANNED_PAGES) addAll(page, collectHtmlReferences(page));
  addAll("site.webmanifest", collectManifestReferences());
  for (const file of scripts) addAll(file, collectScriptReferences(file));
  for (const file of styles) addAll(file, collectStyleReferences(file));

  for (const [reference, source] of referenced) {
    if (NEVER_PRECACHED.has(reference)) continue;
    if (!existsSync(path.join(root, reference))) {
      issues.push(`${source} référence un fichier absent : ${reference}`);
      continue;
    }
    if (!precachedSet.has(reference)) {
      issues.push(`${reference} (référencé par ${source}) manque dans ASSETS`);
    }
  }

  return issues;
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const issues = collectPrecacheIssues();
  if (issues.length) {
    console.error("Vérification du pré-cache échouée :");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }
  console.log(`Vérification du pré-cache réussie (${extractPrecachedPaths().length} ressources).`);
}
