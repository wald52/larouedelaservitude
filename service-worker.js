// Version du cache - À INCRÉMENTER à chaque déploiement
const CACHE_VERSION = 'v18';
const CACHE_NAME = `larouedelaservitude-${CACHE_VERSION}`;

/*
   Service Worker PWA offline-first avec MAJ immédiate
   ================================================

   🔄 MISE À JOUR IMMÉDIATE :
   - skipWaiting() + clients.claim() = activation instantanée
   - Tous les onglets sont mis à jour automatiquement

   📦 CACHE OFFLINE :
   - Tous les fichiers critiques sont pré-cachés à l'installation
   - Fonctionne sans connexion après première visite

   📊 STRATÉGIES :
   - index.html : Network First (dernière version + fallback offline)
   - JS/CSS/manifest/données : Stale-While-Revalidate
   - Images, icônes et audio : Cache First
   - API et pages dynamiques : hors du Service Worker
   
   ℹ️ FONTS : Aucun - utilisation de fonts système uniquement
   (system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial)
*/

const BASE = self.location.pathname.replace(/\/[^\/]*$/, '');

// Liste des fichiers à pré-cacher (CRITIQUE pour offline)
const urlsToCache = [
  `${BASE}/`,
  `${BASE}/index.html`,

  // 📜 Scripts (critique)
  `${BASE}/js/app.js`,
  `${BASE}/js/entries.js`,
  `${BASE}/js/audio.js`,
  `${BASE}/js/menu.js`,
  `${BASE}/bills.js`,

  // 🎨 Styles
  `${BASE}/bills.css`,
  `${BASE}/menu.css`,

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
  `${BASE}/site.webmanifest`,
];

/* =====================================================
   INSTALLATION : Pré-cache de TOUS les fichiers critiques
   ===================================================== */
self.addEventListener("install", (event) => {
  console.log(`[SW] Installation de ${CACHE_NAME}`);
  
  // Force l'activation immédiate (skip waiting)
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pré-cache des ressources critiques...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] ✅ Pré-cache terminé - prêt pour offline');
      })
      .catch((err) => {
        console.error("[SW] ❌ Erreur pré-cache :", err);
        // Certains fichiers peuvent échouer (ex: audio), ce n'est pas bloquant
      })
  );
});

/* =====================================================
   ACTIVATION : Nettoyage des anciens caches + claim
   ===================================================== */
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activation de ${CACHE_NAME}`);
  
  event.waitUntil(
    // 1. Supprimer TOUS les anciens caches
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] 🗑️ Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => {
      console.log('[SW] ✅ Anciens caches supprimés');
      // 2. Prendre le contrôle IMMÉDIAT de tous les onglets
      return self.clients.claim();
    })
    .then(() => {
      console.log('[SW] ✅ Claim effectué - tous les onglets sont à jour');
      // 3. Notifier tous les clients pour refresh si nécessaire
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          // Optionnel : recharger automatiquement
          // client.navigate(client.url);
          
          // Ou envoyer un message pour afficher un bouton "Mettre à jour"
          client.postMessage({
            type: 'SW_UPDATED',
            cache: CACHE_NAME
          });
        });
      });
    })
  );
});

/* =====================================================
   FETCH : Stratégies adaptées par type de fichier
   ===================================================== */
const INDEX_PATHS = new Set([`${BASE}/`, `${BASE}/index.html`]);
const DATA_PATHS = new Set([
  `${BASE}/data/entries-light.json`,
  `${BASE}/data/entries-full.json`,
]);
const STATIC_ASSET_REGEX = /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|avif|mp3|wav|ogg|m4a)$/i;

function isCacheableResponse(response) {
  return response && response.status === 200;
}

function putInCache(request, response) {
  if (!isCacheableResponse(response)) return Promise.resolve();

  return caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      putInCache(request, response);
      return response;
    })
    .catch(() => caches.match(request));
}

function cacheFirst(request) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) return cachedResponse;

    return fetch(request).then((response) => {
      putInCache(request, response);
      return response;
    });
  });
}

function staleWhileRevalidate(request) {
  return caches.match(request).then((cachedResponse) => {
    const networkResponse = fetch(request)
      .then((response) => {
        putInCache(request, response);
        return response;
      })
      .catch(() => cachedResponse);

    return cachedResponse || networkResponse;
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
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
  
  // ⚠️ buttons.html : Jamais en cache (dynamique)
  if (url.pathname.endsWith("buttons.html")) {
    return;
  }

  // 📝 Page principale → Network First
  // Objectif : obtenir rapidement la dernière version d'index.html avec fallback offline.
  if (INDEX_PATHS.has(url.pathname)) {
    return event.respondWith(networkFirst(request));
  }

  // 📊 Données métier → Stale-While-Revalidate
  // Les entrées peuvent être légèrement anciennes pendant quelques secondes.
  if (DATA_PATHS.has(url.pathname)) {
    return event.respondWith(staleWhileRevalidate(request));
  }

  // 📱 Manifest → Stale-While-Revalidate
  if (url.pathname === `${BASE}/site.webmanifest`) {
    return event.respondWith(staleWhileRevalidate(request));
  }

  // 📜 JS/CSS → Stale-While-Revalidate pour un rendu rapide + mise à jour en arrière-plan.
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    return event.respondWith(staleWhileRevalidate(request));
  }

  // 🖼️ Images, icônes et audio → Cache First : fichiers versionnés/peu changeants.
  if (STATIC_ASSET_REGEX.test(url.pathname)) {
    return event.respondWith(cacheFirst(request));
  }
});

/* =====================================================
   MESSAGES : Communication avec les clients
   ===================================================== */
self.addEventListener('message', (event) => {
  // Message pour forcer l'activation
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Message pour vider le cache (refresh forcé)
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clear cache demandé');
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      }).then(() => {
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            client.navigate(client.url);
          });
        });
      })
    );
  }
  
  // Message pour refresh des données JSON seulement
  if (event.data && event.data.type === 'REFRESH_DATA') {
    console.log('[SW] Refresh des données JSON demandé');
    caches.open(CACHE_NAME).then((cache) => {
      cache.delete(`${BASE}/data/entries-light.json`);
      cache.delete(`${BASE}/data/entries-full.json`);
    });
  }
});
