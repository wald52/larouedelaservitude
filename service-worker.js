// Version du cache - À INCRÉMENTER à chaque déploiement
const CACHE_VERSION = 'v15';
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

   📊 STRATÉGIES (100% Network First) :
   - HTML : Network First (toujours le dernier)
   - JS/CSS : Network First (MAJ auto + offline)
   - JSON : Network First (entries.json toujours à jour)
   - Images : Network First (icônes, centre roue, etc.)
   - Audio : Network First (pré-cachés mais vérifiés)
   - Tout autre fichier : Network First (fallback global)
   
   💯 TOUS les fichiers sont vérifiés sur le réseau en premier !
   
   ℹ️ FONTS : Aucun - utilisation de fonts système uniquement
   (system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial)
*/

const BASE = '/larouedelaservitude';

// Liste des fichiers à pré-cacher (CRITIQUE pour offline)
const urlsToCache = [
  `${BASE}/`,
  `${BASE}/index.html`,

  // 📜 Scripts (critique)
  `${BASE}/js/entries.js`,
  `${BASE}/js/audio.js`,
  `${BASE}/js/menu.js`,
  `${BASE}/bills.js`,

  // 🎨 Styles
  `${BASE}/bills.css`,
  `${BASE}/menu.css`,

  // 🎵 Sons (critique pour offline)
  `${BASE}/audio/wheel-spin2.mp3`,
  `${BASE}/audio/coin4.mp3`,
  `${BASE}/audio/frottement-papier2.mp3`,

  // 📱 Icônes PWA
  `${BASE}/icons/icon-192x192.png`,
  `${BASE}/icons/icon-512x512.png`,
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
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // ⚠️ API Netlify : Hors du SW (jamais en cache)
  if (url.pathname.includes("/.netlify/functions/")) {
    return;
  }
  
  // ⚠️ buttons.html : Jamais en cache (dynamique)
  if (url.pathname.endsWith("buttons.html")) {
    return;
  }
  
  const request = event.request;
  
  // 📝 HTML → Network First avec fallback cache
  // Toujours essayer de récupérer la dernière version
  if (request.headers.get("accept")?.includes("text/html")) {
    return event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return res;
        })
        .catch(() => {
          console.log('[SW] HTML: fallback sur cache (offline)');
          return caches.match(request);
        })
    );
  }
  
  // 📜 JS et CSS → Network First avec fallback cache
  // Vérifie le réseau en premier, utilise le cache si offline
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    return event.respondWith(
      fetch(request)
        .then((res) => {
          if (!res || res.status !== 200) return res;

          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
            console.log('[SW] JS/CSS: cache mis à jour:', url.pathname);
          });
          return res;
        })
        .catch(() => {
          console.log('[SW] JS/CSS: fallback sur cache (offline):', url.pathname);
          return caches.match(request);
        })
    );
  }

  // 📊 TOUS les JSON → Network First avec fallback cache
  // entries.json, site.webmanifest, etc. toujours à jour
  if (url.pathname.endsWith('.json')) {
    return event.respondWith(
      fetch(request)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
            console.log('[SW] JSON: cache mis à jour:', url.pathname);
          });
          return res;
        })
        .catch(() => {
          console.log('[SW] JSON: fallback sur cache (offline):', url.pathname);
          return caches.match(request);
        })
    );
  }

  // 🖼️ Images → Network First avec fallback cache
  // Même les images sont vérifiées à chaque fois (MAJ auto)
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|avif)$/i)) {
    return event.respondWith(
      fetch(request)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
            console.log('[SW] Image: cache mis à jour:', url.pathname);
          });
          return res;
        })
        .catch(() => {
          console.log('[SW] Image: fallback sur cache (offline):', url.pathname);
          return caches.match(request);
        })
    );
  }

  // 🕳️ FALLBACK : Network First pour tout le reste
  // Attrape tous les fichiers non listés ci-dessus
  return event.respondWith(
    fetch(request)
      .then((res) => {
        if (!res || res.status !== 200) return res;
        
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone);
        });
        return res;
      })
      .catch(() => {
        console.log('[SW] Fallback: récupération depuis le cache:', url.pathname);
        return caches.match(request);
      })
  );
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
