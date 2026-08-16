/*
 * Service worker — rend le site installable et utilisable hors ligne (PWA).
 *
 * Trois exigences, tenues ensemble :
 *   a. en avion, sans réseau, le site fonctionne entièrement — et ce dès la
 *      première visite, sans la moindre interaction ;
 *   b. en ligne, un rechargement donne toujours la dernière version, sans que
 *      le visiteur ait à vider quoi que ce soit, et SANS rechargement
 *      automatique dans son dos ;
 *   c. une page ne mélange JAMAIS des fichiers de deux générations.
 *
 * Le point (c) est le plus difficile, et il ne se règle pas ici : il se règle
 * dans les URLs. Le code et les styles sont estampillés d'un hachage de contenu
 * (`?v=…`, posé par scripts/stamp-assets.mjs), donc une URL estampillée désigne
 * un contenu IMMUABLE. Le HTML de la génération N ne référence que des URLs N :
 * la cohérence d'une page est acquise par construction, quelle que soit la
 * provenance — réseau ou cache — de chaque fichier.
 *
 * D'où les trois règles ci-dessous :
 *
 *   1. Documents (navigations) → RÉSEAU D'ABORD, avec repli sur le cache.
 *      Recharger en ligne donne le dernier HTML, donc le dernier jeu d'URLs
 *      estampillées. Hors ligne, le cache sert le HTML de la dernière
 *      génération complète, qui ne référence que des URLs de cette génération —
 *      toutes présentes.
 *
 *   2. Assets estampillés → CACHE D'ABORD, toutes générations confondues.
 *      Instantané, et sans risque puisque l'URL fixe le contenu.
 *
 *   3. Le reste (données, sons, images, icônes, manifeste) → RÉSEAU D'ABORD.
 *      Non estampillé, mais dépareillé cela ne casse pas le site. Les données
 *      ont de surcroît leur propre fraîcheur (champ `version` + revalidation
 *      dans js/entries.js).
 *
 * Pas de `skipWaiting()`, et aucun rechargement provoqué : un onglet resté
 * ouvert continue d'être servi par son service worker et son cache, y compris
 * pour ce qu'il charge tardivement (les données complètes, les sons). Le nouveau
 * service worker précache sa génération dès son installation — l'instantané hors
 * ligne est donc prêt bien avant qu'il prenne la main — et n'active, avec purge
 * des anciens caches, que lorsque plus aucune page de l'ancienne génération
 * n'est ouverte. Le visiteur recharge quand il veut.
 *
 * ℹ️ FONTS : aucune — polices système uniquement.
 */
/* --- généré par scripts/stamp-assets.mjs — ne pas éditer à la main --- */
const VERSION = "eebfe25a";
const ASSETS = [
  "./",
  "./index.html",
  "./donnees.html",
  "./bills.css?v=3274a064",
  "./bills.js?v=d86bcbd3",
  "./buttons.css?v=8e4cf8f9",
  "./donnees.css?v=4a3d61a8",
  "./js/app.js?v=1da0ed99",
  "./js/audio.js?v=f32973a2",
  "./js/charts.js?v=9c0905cd",
  "./js/constants.js?v=2713e882",
  "./js/data-explorer.js?v=0d2c7e6b",
  "./js/entries.js?v=5638691f",
  "./js/focus-trap.js?v=0b34fd1c",
  "./js/game.js?v=e75363c7",
  "./js/menu.js?v=07363a33",
  "./js/settings.js?v=d7e3f5e3",
  "./js/stats.js?v=a54f91d1",
  "./js/sw-update.js?v=3cf9d32b",
  "./menu.css?v=90453bf1",
  "./data/entries-light.json",
  "./data/entries-full.json",
  "./images/center3.avif",
  "./images/le-modele-social-francais.png",
  "./audio/wheel-spin2.mp3",
  "./audio/coin4.mp3",
  "./audio/frottement-papier2.mp3",
  "./icons/favicon.ico",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  "./icons/og-image.png",
  "./site.webmanifest"
];
/* --- fin du bloc généré --- */

const CACHE = `larouedelaservitude-${VERSION}`;

// Le réseau « zombie » — qui pend sans échouer — est le pire cas pour une
// navigation : passé ce délai on sert le cache, ce qui vaut mieux qu'un écran
// blanc.
const NETWORK_TIMEOUT_MS = 5000;

// Nombre de nouvelles tentatives par fichier au précache (réseau instable sur
// mobile) avant de faire échouer l'installation.
const PRECACHE_RETRIES = 2;

const BASE = self.location.pathname.replace(/\/[^/]*$/, "");

// Une page, une entrée de cache : `/`, `/index`, `/index.html` désignent la même
// coquille, tout comme `/donnees` et `/donnees.html` (certains hébergeurs
// servent les pages sans leur extension). Sans cette table, la même page
// pourrait exister en deux copies selon l'URL empruntée.
const INDEX_KEY = "./index.html";
const DONNEES_KEY = "./donnees.html";
const PAGE_KEYS_BY_PATH = new Map([
  [`${BASE}/`, INDEX_KEY],
  [`${BASE}/index`, INDEX_KEY],
  [`${BASE}/index.html`, INDEX_KEY],
  [`${BASE}/donnees`, DONNEES_KEY],
  [`${BASE}/donnees.html`, DONNEES_KEY]
]);

/* =====================================================
   INSTALLATION : pré-cache atomique de la génération
   ===================================================== */

// `cache: "reload"` : on remplit la génération depuis le réseau sans passer par
// le cache HTTP du navigateur, pour que l'instantané soit fidèle à ce qui vient
// d'être publié.
async function precacheOne(cache, url, attempt = 0) {
  try {
    const response = await fetch(new Request(url, { cache: "reload", credentials: "same-origin" }));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await cache.put(url, response);
  } catch (error) {
    if (attempt < PRECACHE_RETRIES) {
      return precacheOne(cache, url, attempt + 1);
    }
    throw new Error(`${url} (${error.message})`);
  }
}

async function precacheAll() {
  const cache = await caches.open(CACHE);
  const results = await Promise.allSettled(ASSETS.map((url) => precacheOne(cache, url)));
  const failures = results.filter((result) => result.status === "rejected");

  if (failures.length) {
    // Cache incomplet = hors ligne cassé : on préfère échouer et laisser la
    // génération précédente en place, intacte. Le navigateur retentera.
    await caches.delete(CACHE);
    throw new Error(`Pré-cache incomplet : ${failures.map((f) => f.reason.message).join(", ")}`);
  }
}

self.addEventListener("install", (event) => {
  console.log(`[SW] Installation de ${CACHE}`);
  event.waitUntil(
    precacheAll()
      .then(() => {
        // Pas de skipWaiting : la génération est prête et attend son tour. Les
        // pages ouvertes continuent d'être servies par la leur, entière.
        console.log("[SW] ✅ Pré-cache complet — prêt pour le hors ligne");
      })
      .catch((error) => {
        console.error("[SW] ❌ Installation abandonnée :", error.message);
        throw error;
      })
  );
});

/* =====================================================
   ACTIVATION : purge des anciennes générations
   ===================================================== */
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activation de ${CACHE}`);
  event.waitUntil(
    (async () => {
      // Sans skipWaiting, on n'arrive ici que lorsque plus aucune page servie
      // par la génération précédente n'est ouverte : purger les autres caches
      // ne peut donc couper l'herbe sous le pied d'aucune page vivante.
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== CACHE)
          .map((name) => {
            console.log("[SW] 🗑️ Suppression ancien cache :", name);
            return caches.delete(name);
          })
      );
      await self.clients.claim();
    })()
  );
});

/* =====================================================
   FETCH : les trois règles
   ===================================================== */

function isCacheableResponse(response) {
  return response && response.status === 200 && response.type === "basic";
}

// Assets estampillés. `caches.match` sans nom de cache interroge TOUTES les
// générations présentes : une URL estampillée désignant un contenu immuable, la
// servir depuis un cache plus ancien est exact — et évite un aller-retour réseau
// pour les fichiers qu'une nouvelle génération n'a pas modifiés.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheableResponse(response)) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}

// "no-cache" : le navigateur revalide auprès du serveur (ETag → 304 si
// inchangé). Le délai couvre les réseaux qui pendent sans échouer.
//
// On passe l'URL et non la Request : reconstruire une Request à partir d'une
// requête de navigation lève une TypeError (le mode « navigate » ne peut pas
// être posé par le constructeur). Le site étant statique et de même origine,
// rien d'utile ne se perd au passage.
function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { cache: "no-cache", signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

// Documents et assets non estampillés.
async function networkFirst(request, cacheKey = request) {
  try {
    const response = await fetchWithTimeout(request.url, NETWORK_TIMEOUT_MS);
    if (isCacheableResponse(response)) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(cacheKey, copy));
    }
    return response;
  } catch (error) {
    const cached = await caches.match(cacheKey);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const index = await caches.match(INDEX_KEY);
      if (index) return index;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // ⚠️ API Netlify : jamais interceptée, jamais mise en cache.
  if (url.pathname.includes("/.netlify/functions/")) return;

  // 🔄 Revalidation des données par js/entries.js : elle veut la version
  // publiée pour la comparer à celle qu'elle a en cache. On la laisse filer
  // vers le réseau sans l'intercepter — et sans mettre son URL horodatée en
  // cache, ce qui y créerait une entrée par revalidation.
  if (url.searchParams.has("fresh")) return;

  // 1. Documents (y compris avec des paramètres de partage ou de filtres).
  const pageKey = PAGE_KEYS_BY_PATH.get(url.pathname);
  if (pageKey) {
    return event.respondWith(networkFirst(request, pageKey));
  }

  // 2. Assets estampillés : l'URL fixe le contenu, donc cache d'abord.
  if (url.searchParams.has("v")) {
    return event.respondWith(cacheFirst(request));
  }

  // 3. Le reste, précaché ou non : réseau d'abord, repli sur le cache.
  event.respondWith(networkFirst(request));
});

/* =====================================================
   MESSAGES : communication avec les clients
   ===================================================== */
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  // Permet à la page d'afficher la génération qui la sert (panneau Réglages).
  if (data.type === "GET_VERSION") {
    const port = event.ports && event.ports[0];
    const payload = { type: "VERSION", version: VERSION };
    if (port) port.postMessage(payload);
    else if (event.source) event.source.postMessage(payload);
    return;
  }

  // Vidage complet (dépannage) : aucun client ne l'envoie.
  if (data.type === "CLEAR_CACHE") {
    console.log("[SW] Clear cache demandé");
    event.waitUntil(caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n)))));
  }
});
