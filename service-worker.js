const CACHE_NAME = 'larouedelaservitude-v7';

/*  
   IMPORTANT :
   - On corrige les chemins pour GitHub Pages.
   - On évite de cacher les fichiers dynamiques (boutons, feedback, HTML dynamique).
   - On optimise la bande passante Netlify.
*/

const BASE = '/larouedelaservitude';  // GitHub Pages prefix
const urlsToCache = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/images/center3.avif`,

  // 📱 Icônes importantes pour PWA
  `${BASE}/icons/icon-192x192.png`,
  `${BASE}/icons/icon-512x512.png`,
  `${BASE}/site.webmanifest`,
];

/* ------------------------
   INSTALLATION (pré-cache)
------------------------ */
self.addEventListener("install", (event) => {
  self.skipWaiting(); // active immédiatement

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.error("Pré-cache échoué :", err))
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
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

/* ------------------------
   FETCH optimisé :
   - HTML => Network First (évite les vieilles versions)
   - sons / images => Cache First
   - API (Netlify functions) => jamais mis en cache !
------------------------ */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ⚠️ API Netlify : On sort immédiatement du Service Worker.
  // Le navigateur fera la requête réseau standard sans interception.
  if (url.pathname.includes("/.netlify/functions/")) {
    return;
  }

  // ⚠️ NE PAS cacher buttons.html (chargé dynamiquement)
  if (url.pathname.endsWith("buttons.html")) {
    return event.respondWith(fetch(event.request));
  }

  // 📝 HTML → Network First
  if (event.request.headers.get("accept")?.includes("text/html")) {
    return event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }

  // 🎵 Fichiers statiques → Cache First
  return event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      if (cacheRes) return cacheRes;

      return fetch(event.request)
        .then((res) => {
          if (!res || res.status !== 200) return res;

          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return res;
        })
        .catch(() => cacheRes)
    })
  );
});
