#!/usr/bin/env node
/*
 * Estampille les URLs d'assets d'un hachage de contenu, puis régénère le bloc
 * de précache du service worker.
 *
 * Pourquoi : sans cela, `./js/app.js` désigne un contenu différent selon le
 * moment. Une page peut alors mélanger des fichiers de deux générations — un
 * `app.js` d'hier avec un `index.html` d'aujourd'hui — et se casser alors que
 * chaque génération, prise entière, fonctionne. Aucune stratégie de cache ne
 * peut corriger cela : c'est l'URL qui est ambiguë.
 *
 * Avec `?v=<hachage>`, une URL désigne un contenu IMMUABLE. Deux générations ne
 * se disputent plus jamais la même URL : une page servie par le HTML de la
 * génération N ne demande que des URLs N. La cohérence n'est plus surveillée à
 * l'exécution, elle est acquise par construction — et c'est ce qui permet au
 * service worker de servir ces URLs en « cache d'abord » (instantané, donc hors
 * ligne) tout en servant les documents en « réseau d'abord » (donc toujours à
 * jour). Voir l'en-tête de service-worker.js.
 *
 * `?v=` est une chaîne de requête : le serveur sert le même fichier au même
 * chemin. Aucun lien direct ne casse, et rien n'est renommé sur le disque.
 *
 * Idempotent : relancer sans rien changer ne produit aucune diff. C'est ce que
 * vérifie `npm run check:stamp`, joué par la CI — le dépôt ne peut donc pas
 * dériver de ce que le service worker déclare.
 *
 *   node scripts/stamp-assets.mjs           # réécrit les fichiers
 *   node scripts/stamp-assets.mjs --check   # signale sans rien écrire
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK_ONLY = process.argv.includes("--check");

const readBin = (p) => readFileSync(path.join(root, p));
const readText = (p) => readFileSync(path.join(root, p), "utf8");

// 8 hexa de SHA-256 : de quoi distinguer sans ambiguïté la quinzaine de
// fichiers du site, et l'URL reste lisible.
const hashOf = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 8);

/* --------------------------------------------------------------------------
 * Quoi estampiller.
 *
 * Le critère est celui du dégât : un fichier est estampillé si son incohérence
 * avec le reste de la génération CASSE le site. C'est le cas du code et des
 * styles — un `menu.js` d'hier avec le `index.html` d'aujourd'hui, et
 * `requireElement()` lève au démarrage.
 *
 * Ne sont pas estampillés les données, les sons, les images, les icônes et le
 * manifeste : dépareillés, ils ne cassent rien. Les données ont en outre leur
 * propre mécanisme de fraîcheur (le champ `version` et la revalidation de
 * js/entries.js, §4 de CLAUDE.md), et les sons comme les images sont adressés à
 * l'exécution par `BASE_PATH` et non par un littéral qu'on pourrait réécrire.
 * Ils restent précachés, et servis en « réseau d'abord ».
 * ----------------------------------------------------------------------- */

// Points d'entrée : jamais estampillés, ce sont les URLs publiques.
const DOCUMENTS = ["index.html", "donnees.html"];

// Précachés mais non estampillés (cf. ci-dessus).
const UNSTAMPED = [
  "data/entries-light.json",
  "data/entries-full.json",
  "images/center3.avif",
  "images/le-modele-social-francais.png",
  "audio/wheel-spin2.mp3",
  "audio/coin4.mp3",
  "audio/frottement-papier2.mp3",
  "icons/favicon.ico",
  "icons/apple-touch-icon.png",
  "icons/icon-192x192.png",
  "icons/icon-512x512.png",
  "icons/og-image.png",
  "site.webmanifest"
];

/* --------------------------------------------------------------------------
 * Découverte du graphe.
 *
 * Les fichiers à estampiller ne sont pas listés à la main : on part des deux
 * documents et on suit les références. Ajouter un module ou une feuille de
 * style ne demande donc aucune modification ici — c'est exactement l'oubli que
 * l'ancienne liste `urlsToCache` rendait possible.
 * ----------------------------------------------------------------------- */

const STATIC_IMPORT_RE = /import\s+(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
const EXPORT_FROM_RE = /export\s+[^'";]+?\s+from\s+["']([^"']+)["']/g;
const SCRIPT_SRC_RE = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
const LINK_HREF_RE = /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
const CSS_URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;

// "./entries.js?v=abc" (depuis js/app.js) → "js/entries.js"
function resolveRef(specifier, fromFile) {
  const clean = specifier.split("?")[0].split("#")[0];
  if (!clean || clean.startsWith("data:") || /^[a-z]+:/i.test(clean) || clean.startsWith("//")) {
    return null;
  }
  const base = clean.startsWith("/") ? root : path.dirname(path.join(root, fromFile));
  const resolved = path.resolve(base, clean.replace(/^\//, ""));
  const relative = path.relative(root, resolved).replaceAll(path.sep, "/");
  return relative.startsWith("..") ? null : relative;
}

// Toutes les références sortantes d'un fichier, telles qu'elles y sont écrites.
function referencesOf(file) {
  const source = readText(file);
  const found = new Set();
  const patterns = file.endsWith(".html")
    ? [SCRIPT_SRC_RE, LINK_HREF_RE]
    : file.endsWith(".css")
      ? [CSS_URL_RE]
      : [STATIC_IMPORT_RE, DYNAMIC_IMPORT_RE, EXPORT_FROM_RE];

  for (const re of patterns) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(source))) found.add(match[1]);
  }

  // Le JS des deux pages est aussi porté par des <script type="module"> inline.
  if (file.endsWith(".html")) {
    const inline = /<script\b(?=[^>]*\btype=["']module["'])[^>]*>([\s\S]*?)<\/script>/gi;
    let block;
    while ((block = inline.exec(source))) {
      for (const re of [STATIC_IMPORT_RE, DYNAMIC_IMPORT_RE]) {
        re.lastIndex = 0;
        let match;
        while ((match = re.exec(block[1]))) found.add(match[1]);
      }
    }
  }

  return [...found];
}

// Un fichier est estampillable s'il porte du code ou du style.
const isStampable = (p) => p.endsWith(".js") || p.endsWith(".css");

// Parcours en profondeur depuis les documents : ensemble des fichiers à
// estampiller, et arêtes du graphe pour l'ordre de hachage.
const dependencies = new Map(); // "js/app.js" → Set("js/entries.js", …)

function discover(file) {
  if (dependencies.has(file)) return;
  dependencies.set(file, new Set());

  for (const specifier of referencesOf(file)) {
    const target = resolveRef(specifier, file);
    if (!target || !isStampable(target)) continue;
    dependencies.get(file).add(target);
    discover(target);
  }
}

for (const doc of DOCUMENTS) discover(doc);

const stampable = [...dependencies.keys()].filter(isStampable);

/* --------------------------------------------------------------------------
 * Ordre de hachage.
 *
 * Un module qui en importe d'autres doit voir ses propres références réécrites
 * AVANT d'être haché : sans cela le hachage ne décrirait pas le contenu
 * réellement servi. On hache donc les dépendances d'abord — un tri topologique.
 * ----------------------------------------------------------------------- */

function topologicalOrder() {
  const order = [];
  const state = new Map(); // file → "encours" | "fini"

  function visit(file, trail) {
    if (state.get(file) === "fini") return;
    if (state.get(file) === "encours") {
      console.error(`Cycle d'imports : ${[...trail, file].join(" → ")}`);
      process.exit(1);
    }
    state.set(file, "encours");
    for (const dep of dependencies.get(file) ?? []) visit(dep, [...trail, file]);
    state.set(file, "fini");
    if (isStampable(file)) order.push(file);
  }

  for (const file of stampable) visit(file, []);
  return order;
}

/* --------------------------------------------------------------------------
 * Réécriture.
 * ----------------------------------------------------------------------- */

const stamped = new Map(); // "js/entries.js" → "abc12345"
const rewritten = new Map(); // fichier → contenu réécrit (mémoire d'abord)

// Remplace chaque référence par elle-même suivie de `?v=<hachage>`.
//
// La réécriture est faite DANS la syntaxe de référence (`import "…"`,
// `src="…"`, `url(…)`) et nulle part ailleurs. Un remplacement textuel du
// chemin nu serait plus simple, mais ce dépôt cite abondamment ses propres
// fichiers dans les commentaires : on estamperait « buttons.css » au milieu
// d'une phrase, et chaque changement de hachage réécrirait de la prose.
//
// Le `?v=` déjà présent est absorbé par le motif : c'est ce qui rend l'outil
// idempotent, sans jamais empiler deux estampilles.
function stampSpecifier(specifier, fromFile) {
  const target = resolveRef(specifier, fromFile);
  if (!target || !stamped.has(target)) return null;
  const bare = specifier.split("?")[0].split("#")[0];
  return `${bare}?v=${stamped.get(target)}`;
}

function rewriteIn(source, patterns, fromFile) {
  let out = source;

  for (const re of patterns) {
    out = out.replace(new RegExp(re.source, re.flags), (match, specifier) => {
      const url = stampSpecifier(specifier, fromFile);
      return url ? match.replace(specifier, url) : match;
    });
  }

  return out;
}

function rewriteReferences(file, source) {
  if (file.endsWith(".css")) return rewriteIn(source, [CSS_URL_RE], file);

  if (!file.endsWith(".html")) {
    return rewriteIn(source, [STATIC_IMPORT_RE, DYNAMIC_IMPORT_RE, EXPORT_FROM_RE], file);
  }

  // Les pages portent des références en attributs *et* du JS de module inline.
  let out = rewriteIn(source, [SCRIPT_SRC_RE, LINK_HREF_RE], file);
  return out.replace(
    /<script\b(?=[^>]*\btype=["']module["'])[^>]*>([\s\S]*?)<\/script>/gi,
    (match, body) =>
      match.replace(body, rewriteIn(body, [STATIC_IMPORT_RE, DYNAMIC_IMPORT_RE], file))
  );
}

for (const file of topologicalOrder()) {
  const source = rewriteReferences(file, readText(file));
  rewritten.set(file, source);
  stamped.set(file, hashOf(Buffer.from(source)));
}

// Les documents ferment la marche : ils ne sont pas hachés, mais leurs
// références le sont.
for (const doc of DOCUMENTS) {
  rewritten.set(doc, rewriteReferences(doc, readText(doc)));
}

/* --------------------------------------------------------------------------
 * Bloc généré de service-worker.js.
 * ----------------------------------------------------------------------- */

const stampedUrls = [...stamped.keys()].sort().map((p) => `./${p}?v=${stamped.get(p)}`);

// « ./ » d'abord : c'est l'URL de la page d'accueil, distincte de `index.html`
// pour le cache, et celle qu'ouvre la PWA installée (`start_url` du manifeste).
const ASSETS = [
  "./",
  ...DOCUMENTS.map((p) => `./${p}`),
  ...stampedUrls,
  ...UNSTAMPED.map((p) => `./${p}`)
];

// VERSION nomme la génération, donc le cache. Elle couvre AUSSI les documents et
// les assets non estampillés : une correction de texte dans index.html ne change
// aucun hachage d'asset, mais doit tout de même ouvrir un cache neuf pour que
// l'instantané hors ligne soit celui de la version publiée.
const fingerprint = [...DOCUMENTS, ...UNSTAMPED]
  .map((p) => `${p}:${hashOf(p.endsWith(".html") ? Buffer.from(rewritten.get(p)) : readBin(p))}`)
  .concat(stampedUrls)
  .sort()
  .join("\n");
const VERSION = hashOf(Buffer.from(fingerprint));

const BEGIN = "/* --- généré par scripts/stamp-assets.mjs — ne pas éditer à la main --- */";
const END = "/* --- fin du bloc généré --- */";

// Pas de virgule finale : la configuration Prettier du dépôt n'en veut pas, et
// un bloc généré que `npm run format` réécrirait mettrait les deux outils en
// désaccord permanent — chacun défaisant le travail de l'autre.
const block = [
  BEGIN,
  `const VERSION = "${VERSION}";`,
  "const ASSETS = [",
  ASSETS.map((u) => `  ${JSON.stringify(u)}`).join(",\n"),
  "];",
  END
].join("\n");

const swSource = readText("service-worker.js");
const begin = swSource.indexOf(BEGIN);
const end = swSource.indexOf(END);
if (begin === -1 || end === -1) {
  console.error("service-worker.js : marqueurs du bloc généré introuvables.");
  process.exit(1);
}
rewritten.set(
  "service-worker.js",
  swSource.slice(0, begin) + block + swSource.slice(end + END.length)
);

/* --------------------------------------------------------------------------
 * Écriture (ou rapport).
 * ----------------------------------------------------------------------- */

const changed = [...rewritten.entries()].filter(([file, out]) => readText(file) !== out);

if (CHECK_ONLY) {
  if (changed.length) {
    console.error("Estampillage périmé. Fichiers qui diffèrent :");
    for (const [file] of changed) console.error(`- ${file}`);
    console.error("\nLancez `npm run stamp` puis committez le résultat.");
    process.exit(1);
  }
  console.log(`Estampillage à jour — génération ${VERSION}, ${stamped.size} assets estampillés.`);
} else {
  for (const [file, out] of changed) writeFileSync(path.join(root, file), out);
  console.log(
    `Génération ${VERSION} — ${stamped.size} assets estampillés, ${ASSETS.length} entrées précachées` +
      (changed.length ? `, ${changed.length} fichier(s) réécrit(s).` : " (déjà à jour).")
  );
}
