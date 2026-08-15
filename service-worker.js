// Version de l'application - À INCRÉMENTER à chaque déploiement.
// ⚠️ Doit rester identique à APP_VERSION dans js/constants.js
// (égalité vérifiée par `npm run check:precache`).
const CACHE_VERSION = "v54";
const CACHE_NAME = `larouedelaservitude-${CACHE_VERSION}`;

/*
   Service Worker PWA offline-first, une seule version à la fois
   =============================================================

   📦 UNE GÉNÉRATION = UN CACHE :
   - L'installation télécharge TOUS les fichiers de la nouvelle version dans un
     cache neuf, en contournant le cache HTTP (paramètre ?v= + cache: 'reload').
   - Si un seul fichier manque, l'installation échoue : on ne crée jamais un
     cache à moitié rempli. L'ancienne version continue de servir, intacte.
   - Tant que le nouveau SW n'est pas activé, l'ancien sert l'intégralité de son
     cache. Aucun mélange ancien/nouveau n'est donc possible.

   🔄 MISE À JOUR :
   - Première installation : skipWaiting() immédiat, la visite en cours est déjà
     complètement hors ligne sans aucune action de l'utilisateur.
   - Mise à jour : le nouveau SW attend que la page dise « je suis prête »
     (message SKIP_WAITING envoyé par js/sw-update.js), puis la page se
     recharge. C'est ce qui garantit qu'un onglet ne mélange jamais du HTML,
     du JS et des données de deux générations différentes.

   📊 STRATÉGIES : Cache First sur toute la coquille applicative (HTML, JS, CSS,
   JSON, images, sons). La fraîcheur ne vient pas d'une requête réseau par
   fichier — qui ramènerait des fichiers de générations différentes — mais du
   cycle de mise à jour du service worker lui-même.

   Exceptions (jamais interceptées) : les fonctions Netlify, les requêtes
   cross-origin et les URL portant un paramètre `fresh` (revalidation des
   données par js/entries.js).

   ℹ️ FONTS : Aucune - utilisation de fonts système uniquement
   (system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial)
*/

const BASE = self.location.pathname.replace(/\/[^/]*$/, "");

// Nombre de nouvelles tentatives par fichier avant de faire échouer
// l'installation (réseau instable sur mobile).
const PRECACHE_RETRIES = 2;

// Liste des fichiers à pré-cacher (CRITIQUE pour offline)
const urlsToCache = [
  `${BASE}/index.html`,

  // 📊 Page « Données & analyse » (mode avancé) : pré-cachée au même titre que
  // la roue, elle doit rester consultable hors ligne.
  `${BASE}/donnees.html`,

  // 📜 Scripts (critique)
  // ⚠️ Tout module importé par app.js ou data-explorer.js (même indirectement)
  // doit figurer ici : sans cela un tout premier lancement hors ligne échoue
  // sur un import manquant. `npm run check:precache` vérifie cette liste
  // automatiquement.
  `${BASE}/js/app.js`,
  `${BASE}/js/entries.js`,
  `${BASE}/js/audio.js`,
  `${BASE}/js/menu.js`,
  `${BASE}/js/constants.js`,
  `${BASE}/js/settings.js`,
  `${BASE}/js/sw-update.js`,
  `${BASE}/js/focus-trap.js`,
  `${BASE}/js/data-explorer.js`,
  `${BASE}/js/stats.js`,
  `${BASE}/js/charts.js`,
  `${BASE}/bills.js`,

  // 🎨 Styles
  `${BASE}/buttons.css`,
  `${BASE}/bills.css`,
  `${BASE}/menu.css`,
  `${BASE}/donnees.css`,

  // 📊 Données JSON (critique pour offline)
  `${BASE}/data/entries-light.json`,
  `${BASE}/data/entries-full.json`,

  // 🖼️ Images (critique pour offline)
  `${BASE}/images/center3.avif`,

  // 🎵 Sons (critique pour offline)
  `${BASE}/audio/wheel-spin2.mp3`,
  `${BASE}/audio/coin4.mp3`,
  `${BASE}/audio/frottement-papier2.mp3`,

  // 📱 Icônes PWA
  `${BASE}/icons/favicon.ico`,
  `${BASE}/icons/apple-touch-icon.png`,
  `${BASE}/icons/icon-192x192.png`,
  `${BASE}/icons/icon-512x512.png`,
  `${BASE}/icons/og-image.png`,
  `${BASE}/site.webmanifest`
];

const PRECACHED_PATHS = new Set(urlsToCache);

// Une page, une entrée de cache : `${BASE}/`, `${BASE}/index.html` et
// `${BASE}/index` désignent la même coquille, tout comme `${BASE}/donnees` et
// `${BASE}/donnees.html` (certains hébergeurs servent les pages sans leur
// extension). Sans cette table, la même page pourrait exister en deux copies
// de générations différentes selon l'URL empruntée.
const INDEX_KEY = `${BASE}/index.html`;
const DONNEES_KEY = `${BASE}/donnees.html`;
const PAGE_KEYS_BY_PATH = new Map([
  [`${BASE}/`, INDEX_KEY],
  [`${BASE}/index`, INDEX_KEY],
  [INDEX_KEY, INDEX_KEY],
  [`${BASE}/donnees`, DONNEES_KEY],
  [DONNEES_KEY, DONNEES_KEY]
]);

/* =====================================================
   INSTALLATION : pré-cache atomique de la génération
   ===================================================== */

// Le paramètre ?v= et cache: 'reload' garantissent que les octets pré-cachés
// viennent bien du serveur : sans eux, le cache HTTP du navigateur (ou le CDN)
// pourrait resservir les fichiers de la version précédente, et la « nouvelle »
// génération serait un mélange.
function precacheRequest(url) {
  const separator = url.includes("?") ? "&" : "?";
  return new Request(`${url}${separator}v=${CACHE_VERSION}`, {
    cache: "reload",
    credentials: "same-origin"
  });
}

async function precacheOne(cache, url, attempt = 0) {
  try {
    const response = await fetch(precacheRequest(url));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Stocké sous l'URL propre : le paramètre ?v= ne sert qu'au téléchargement.
    // La réponse est reconstruite pour ne pas transporter l'URL horodatée, qui
    // deviendrait sinon l'URL de base des modules ES servis depuis ce cache.
    const body = await response.blob();
    await cache.put(
      url,
      new Response(body, {
        status: 200,
        statusText: response.statusText,
        headers: response.headers
      })
    );
  } catch (error) {
    if (attempt < PRECACHE_RETRIES) {
      return precacheOne(cache, url, attempt + 1);
    }
    throw new Error(`${url} (${error.message})`);
  }
}

async function precacheAll() {
  const cache = await caches.open(CACHE_NAME);
  const results = await Promise.allSettled(urlsToCache.map((url) => precacheOne(cache, url)));
  const failures = results.filter((result) => result.status === "rejected");

  if (failures.length) {
    // Cache incomplet = hors ligne cassé : on préfère échouer et laisser
    // l'ancienne version en place. Le navigateur retentera à la prochaine
    // vérification de mise à jour.
    await caches.delete(CACHE_NAME);
    throw new Error(`Pré-cache incomplet : ${failures.map((f) => f.reason.message).join(", ")}`);
  }
}

// Les versions antérieures à v21 ne savaient pas envoyer SKIP_WAITING : une
// page qui en vient n'aurait aucun moyen de déclencher la bascule, et le
// nouveau SW attendrait indéfiniment. On la reconnaît au nom de son cache —
// d'où la convention « v » + nombre pour CACHE_VERSION. Un nom illisible est
// traité comme ancien : bascule forcée, ce qui reste sûr (les pages concernées
// sont rechargées).
const HANDSHAKE_MIN_VERSION = 21;

async function predecessorKnowsHandshake() {
  const versions = (await caches.keys())
    .map((name) => /^larouedelaservitude-v(\d+)$/.exec(name))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((version) => version !== Number(CACHE_VERSION.slice(1)));

  return versions.length > 0 && versions.every((version) => version >= HANDSHAKE_MIN_VERSION);
}

// Vrai quand on remplace une génération trop ancienne pour la poignée de main :
// l'activation ne peut pas attendre son feu vert, on rechargera ses pages.
let legacyTakeover = false;

self.addEventListener("install", (event) => {
  console.log(`[SW] Installation de ${CACHE_NAME}`);

  event.waitUntil(
    precacheAll()
      .then(async () => {
        console.log("[SW] ✅ Pré-cache complet - prêt pour offline");

        legacyTakeover = Boolean(self.registration.active) && !(await predecessorKnowsHandshake());

        // Première installation : aucun SW actif, donc aucune page ne tourne
        // avec du code d'une autre génération. On prend le contrôle tout de
        // suite pour que la visite en cours soit déjà utilisable hors ligne.
        if (!self.registration.active) {
          await self.skipWaiting();
        } else if (legacyTakeover) {
          console.log("[SW] Génération précédente sans poignée de main : bascule forcée");
          await self.skipWaiting();
        } else {
          // Mise à jour : on reste en attente. C'est la page (js/sw-update.js)
          // qui déclenche la bascule quand elle peut se recharger sans gêner
          // l'utilisateur — sinon elle mélangerait deux générations.
          console.log("[SW] Nouvelle version prête, en attente du feu vert de la page");
        }
      })
      .catch((error) => {
        console.error("[SW] ❌ Installation abandonnée :", error.message);
        // Propagé : l'installation échoue, l'ancienne version reste seule maître.
        throw error;
      })
  );
});

/* =====================================================
   ACTIVATION : Nettoyage des anciens caches + claim
   ===================================================== */
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activation de ${CACHE_NAME}`);

  event.waitUntil(
    (async () => {
      // 1. Supprimer TOUS les anciens caches : une seule génération survit.
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] 🗑️ Suppression ancien cache:", name);
            return caches.delete(name);
          })
      );

      // 2. Prendre le contrôle immédiat de tous les onglets.
      await self.clients.claim();

      // 3. Prévenir les pages : elles se rechargent pour aligner leur code sur
      //    cette génération (voir js/sw-update.js).
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.postMessage({
          type: "SW_UPDATED",
          version: CACHE_VERSION,
          cache: CACHE_NAME
        });

        // Une page d'une génération sans poignée de main ne sait pas se
        // recharger toute seule : elle resterait avec son ancien code face à
        // ce nouveau cache. On la recharge nous-mêmes.
        //
        // ⚠️ Sans `await` : la navigation a besoin d'un SW *activé* pour être
        // servie, l'attendre ici bloquerait l'activation qu'elle attend.
        if (legacyTakeover) {
          client.navigate(client.url).catch((error) => {
            console.warn("[SW] Rechargement de la page impossible :", error);
          });
        }
      }
    })()
  );
});

/* =====================================================
   FETCH : Cache First sur la génération installée
   ===================================================== */

function isCacheableResponse(response) {
  return response && response.status === 200 && response.type === "basic";
}

// Cache First : la réponse vient toujours de la génération installée. Le réseau
// n'est sollicité que pour ce qui n'a pas été pré-caché (ou si le cache a été
// vidé par le navigateur).
function cacheFirst(request, cacheKey = request) {
  return caches.match(cacheKey).then((cachedResponse) => {
    if (cachedResponse) return cachedResponse;

    return fetch(request).then((response) => {
      if (isCacheableResponse(response)) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, copy));
      }
      return response;
    });
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // ⚠️ API Netlify : Hors du SW (jamais en cache)
  if (url.pathname.includes("/.netlify/functions/")) {
    return;
  }

  // 🔄 Revalidation des données par js/entries.js : elle veut la version
  // publiée pour la comparer à celle qu'elle a en cache. On la laisse filer
  // vers le réseau sans l'intercepter — et sans mettre son URL horodatée en
  // cache, ce qui y créerait une entrée par revalidation.
  if (url.searchParams.has("fresh")) {
    return;
  }

  // 📝 Pages HTML (y compris avec des paramètres de partage ou de filtres) → la
  // coquille de la génération installée. Leur fraîcheur est assurée par le
  // cycle de mise à jour du SW, pas par une requête réseau : servir un
  // index.html plus récent que les modules JS en cache casserait l'application.
  const pageKey = PAGE_KEYS_BY_PATH.get(url.pathname);
  if (pageKey) {
    return event.respondWith(cacheFirst(request, pageKey));
  }

  // 📦 Reste de la coquille (JS, CSS, JSON, images, sons, manifeste).
  if (PRECACHED_PATHS.has(url.pathname)) {
    return event.respondWith(cacheFirst(request, url.pathname));
  }

  // Tout le reste (pages de partage, ressources ajoutées à chaud) : réseau.
});

/* =====================================================
   MESSAGES : Communication avec les clients
   ===================================================== */
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  // Envoyé par js/sw-update.js quand la page peut se recharger sans gêner
  // l'utilisateur : c'est le déclencheur de la bascule de version.
  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  // Permet à la page de vérifier que son code appartient bien à la génération
  // servie par ce SW (voir la détection de décalage dans js/sw-update.js).
  if (data.type === "GET_VERSION") {
    const port = event.ports && event.ports[0];
    const payload = { type: "VERSION", version: CACHE_VERSION };
    if (port) port.postMessage(payload);
    else if (event.source) event.source.postMessage(payload);
    return;
  }

  // Vidage complet (dépannage) : les onglets se rechargent sur une génération
  // fraîchement téléchargée.
  if (data.type === "CLEAR_CACHE") {
    console.log("[SW] Clear cache demandé");
    event.waitUntil(
      caches
        .keys()
        .then((names) => Promise.all(names.map((name) => caches.delete(name))))
        .then(() => self.clients.matchAll({ type: "window" }))
        .then((clients) => {
          clients.forEach((client) => client.navigate(client.url));
        })
    );
  }
});
