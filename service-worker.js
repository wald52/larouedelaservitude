const CACHE_NAME = 'larouedelaservitude-v9';

/*
   Service Worker optimisé pour PWA offline-first
   - entries-light.json : cache critique (chargement initial)
   - entries-full.json : cache background (détails complets)
   - Assets statiques : cache first
   - HTML : network first avec fallback cache
*/

const BASE = '/larouedelaservitude';

// Ressources critiques à pré-cacher pour le premier chargement
const urlsToCache = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/data/entries-light.json`,  // ⚡ Critique pour afficher la roue
  `${BASE}/bills.css`,
  `${BASE}/js/entries.js`,
  
  // 🎵 Sons (critique pour offline)
  `${BASE}/audio/wheel-spin2.mp3`,
  `${BASE}/audio/coin4.mp3`,
  `${BASE}/audio/frottement-papier2.mp3`,
  
  // 📱 Icônes pour PWA
  `${BASE}/icons/icon-192x192.png`,
  `${BASE}/icons/icon-512x512.png`,
  `${BASE}/site.webmanifest`,
];

/* ------------------------
   INSTALLATION (pré-cache)
------------------------ */
self.addEventListener("install", (event) => {
  // Skip waiting pour activer immédiatement le nouveau SW
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pré-cache des ressources critiques');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Pré-cache terminé');
      })
      .catch((err) => {
        console.error("[SW] Erreur pré-cache :", err);
      })
  );
});

/* ------------------------
   ACTIVATION (nettoyage)
------------------------ */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      )
    ).then(() => {
      console.log('[SW] Activation terminée');
      // Prend le contrôle des pages immédiatement
      return self.clients.claim();
    })
  );
});

/* ------------------------
   FETCH optimisé
   - API Netlify => jamais en cache (sortie du SW)
   - JSON données => Cache First avec fallback network
   - HTML => Network First avec fallback cache
   - Assets (CSS, JS, images) => Cache First
------------------------ */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // ⚠️ API Netlify : On sort du Service Worker
  // Le navigateur fera la requête réseau standard sans interception
  if (url.pathname.includes("/.netlify/functions/")) {
    return;
  }
  
  // ⚠️ NE PAS cacher buttons.html (chargé dynamiquement)
  if (url.pathname.endsWith("buttons.html")) {
    return;
  }
  
  const request = event.request;
  
  // 📝 HTML → Network First avec fallback cache
  if (request.headers.get("accept")?.includes("text/html")) {
    return event.respondWith(
      fetch(request)
        .then((res) => {
          // Cloner la réponse pour le cache
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return res;
        })
        .catch(() => {
          // Fallback sur le cache si offline
          return caches.match(request);
        })
    );
  }
  
  // 📊 JSON données (entries-light.json, entries-full.json) → Cache First
  if (url.pathname.endsWith('.json')) {
    return event.respondWith(
      caches.match(request)
        .then((cacheRes) => {
          if (cacheRes) {
            console.log('[SW] Cache hit pour:', url.pathname);
            // Retourner depuis le cache immédiatement
            return cacheRes;
          }
          
          // Sinon, fetch réseau et mise en cache
          return fetch(request)
            .then((res) => {
              if (!res || res.status !== 200) return res;
              
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, clone);
              });
              return res;
            })
            .catch((err) => {
              console.error('[SW] Erreur fetch JSON:', err);
              return null;
            });
        })
    );
  }
  
  // 🎵 Assets statiques (CSS, JS, images) → Cache First
  return event.respondWith(
    caches.match(request)
      .then((cacheRes) => {
        if (cacheRes) return cacheRes;
        
        return fetch(request)
          .then((res) => {
            if (!res || res.status !== 200) return res;
            
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
            return res;
          })
          .catch(() => cacheRes);
      })
  );
});

/* ------------------------
   Message pour refresh cache
------------------------ */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Message pour forcer le refresh des données
  if (event.data && event.data.type === 'REFRESH_DATA') {
    console.log('[SW] Refresh des données demandé');
    caches.open(CACHE_NAME).then((cache) => {
      cache.delete(`${BASE}/data/entries-light.json`);
      cache.delete(`${BASE}/data/entries-full.json`);
    });
  }
});
