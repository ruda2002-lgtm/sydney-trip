const CACHE_NAME = 'sydney-trip-cache-v6';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './images/opera_house.jpg',
  './images/botanic_garden.jpg',
  './images/bondi.jpg',
  './images/taronga_zoo.jpg',
  './images/nye_fireworks.jpg',
  './images/blue_mountains.jpg',
  './images/manly.jpg',
  './images/darling_harbour.jpg',
  './images/watsons_bay.jpg',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 같은 오리진(same-origin) 요청만 처리. Google Maps/예약 사이트 등 외부 도메인은
  // 절대 가로채지 않고 그대로 네트워크로 보낸다 (오프라인 캐시 대상 아님).
  if (url.origin !== self.location.origin) {
    return;
  }

  // GET 요청만 캐시 대상으로 처리.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
