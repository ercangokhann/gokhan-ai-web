self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  // Basit geçiş - önbelleksiz, sadece PWA kurulabilirlik şartı için var.
  event.respondWith(fetch(event.request).catch(() => new Response('Çevrimdışı', { status: 503 })));
});
