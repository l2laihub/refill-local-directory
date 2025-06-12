self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Perform install steps, like caching assets
  // event.waitUntil(
  //   caches.open('refilllocal-cache-v1').then((cache) => {
  //     return cache.addAll([
  //       '/',
  //       '/index.html',
  //       // Add other assets you want to pre-cache
  //     ]);
  //   })
  // );
  self.skipWaiting(); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Perform activate steps, like cleaning up old caches
  // event.waitUntil(
  //   caches.keys().then((cacheNames) => {
  //     return Promise.all(
  //       cacheNames.map((cacheName) => {
  //         if (cacheName !== 'refilllocal-cache-v1') { // Replace with your current cache name
  //           return caches.delete(cacheName);
  //         }
  //       })
  //     );
  //   })
  // );
  return self.clients.claim(); // Take control of all open clients
});

self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching ', event.request.url);
  // Basic cache-first strategy (example)
  // event.respondWith(
  //   caches.match(event.request).then((response) => {
  //     return response || fetch(event.request);
  //   })
  // );
});