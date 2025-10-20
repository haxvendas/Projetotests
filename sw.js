const CACHE_NAME = 'hax-vendas-v1.3.6'; // Atualize a versão quando quiser forçar atualização
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/perfil.jpg',
  '/diamante.jpg',
  '/passe.jpg',
  '/bot.jpg',
  '/caixa.jpg',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap',
  'https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js'
];

// Instalação
self.addEventListener('install', event => {
  self.skipWaiting(); // Ativa a nova versão imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cache atualizado');
      return cache.addAll(urlsToCache);
    })
  );
});

// Ativação (remove caches antigos)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deletando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

// Notificações push (opcional)
self.addEventListener('push', function (event) {
  const options = {
    body: event.data ? event.data.text() : 'Nova promoção disponível!',
    icon: '/perfil.jpg',
    badge: '/perfil.jpg',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
    actions: [
      { action: 'explore', title: 'Ver promoção', icon: '/diamante.jpg' },
      { action: 'close', title: 'Fechar', icon: '/close.png' }
    ]
  };

  event.waitUntil(self.registration.showNotification('HAX VENDAS', options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});
