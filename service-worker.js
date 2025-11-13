const CACHE_NAME = 'larouedelaservitude-v5';
const urlsToCache = [
  '/larouedelaservitude/',
  '/larouedelaservitude/icons/icon-192x192.png',
  '/larouedelaservitude/icons/icon-512x512.png',
  '/larouedelaservitude/images/center3.avif',
  'https://wald52.github.io/larouedelaservitude/audio/coin2.mp3',
  'https://wald52.github.io/larouedelaservitude/audio/wheel-spin2.mp3',
];

// Installation : mise en cache des ressources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Erreur lors de la mise en cache :', error);
      })
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Gestion des requêtes : stratégie "cache-first" pour TOUTES les requêtes
self.addEventListener('fetch', (event) => {
  // Vérifie si la requête concerne un fichier audio
  if (event.request.url.includes('/audio/')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Retourne la version en cache si elle existe
          if (cachedResponse) {
            return cachedResponse;
          }
          // Sinon, essaie de récupérer depuis le réseau et met en cache
          return fetch(event.request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            })
            .catch(() => {
              // Retourne une réponse vide ou un message d'erreur personnalisé
              return new Response('', { status: 200, statusText: 'OK' });
            });
        })
    );
  } else {
    // Pour les autres requêtes, utilise aussi "cache-first"
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            })
            .catch(() => {
              return new Response('Ressource non disponible hors-ligne.', {
                status: 404,
                statusText: 'Non trouvé dans le cache ou hors-ligne',
              });
            });
        })
    );
  }
});
