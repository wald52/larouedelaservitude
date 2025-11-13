const CACHE_NAME = 'ma-pwa-cache-v1';
const urlsToCache = [
  '/larouedelaservitude/',
  '/larouedelaservitude/icons/icon-192x192.png',
  '/larouedelaservitude/icons/icon-512x512.png',
  '/larouedelaservitude/images/center3.avif',
  '/larouedelaservitude/audio/coin2.mp3',
  '/larouedelaservitude/audio/wheel-spin2.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Gestion des requêtes : stratégie "cache-first" pour TOUTES les requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retourne la version en cache si elle existe
        if (cachedResponse) {
          return cachedResponse;
        }
        // Sinon, essaie de récupérer depuis le réseau
        return fetch(event.request)
          .then((response) => {
            // Met en cache la nouvelle réponse si la requête réseau réussit
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Retourne une réponse par défaut si tout échoue
            return new Response('Ressource non disponible hors-ligne.', {
              status: 404,
              statusText: 'Non trouvé dans le cache ou hors-ligne',
            });
          });
      })
  );
});
