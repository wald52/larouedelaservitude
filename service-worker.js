const CACHE_NAME = 'ma-pwa-cache-v1';
const urlsToCache = [
  '/larouedelaservitude/',
  '/larouedelaservitude/icons/icon-192x192.png',
  '/larouedelaservitude/images/center3.avif',
  '/larouedelaservitude/audio/wheel-spin2.mp3',
  '/larouedelaservitude/audio/coin2.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
