const CACHE_NAME = 'hax-vendas-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/perfil.jpg',
    '/diamante.jpg',
    '/passe.jpg',
    '/bot.jpg',
    '/bypass.jpg',
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap',
    'https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js'
];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - retorna a resposta
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    function(response) {
                        // Verifica se recebemos uma resposta válida
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANTE: Clone a resposta. Uma resposta é um stream
                        // e porque queremos que o browser consuma a resposta
                        // assim como o cache consumindo a resposta, precisamos
                        // cloná-la para que tenhamos dois streams.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Atualização do Service Worker
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Notificações push (para futuras implementações)
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'Nova promoção disponível!',
        icon: '/perfil.jpg',
        badge: '/perfil.jpg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver promoção',
                icon: '/diamante.jpg'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('HAX VENDAS', options)
    );
});

// Clique em notificações
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'explore') {
        // Abre o site
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

self.addEventListener('install', event => {
    self.skipWaiting(); // Força a nova versão a ser ativada imediatamente
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(cache => caches.delete(cache))))
    );
});
