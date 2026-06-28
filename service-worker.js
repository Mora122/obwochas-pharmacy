const CACHE = 'obwocha-v19';
const API_CACHE = 'obwocha-api-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/shop.html',
  '/cart.html',
  '/checkout.html',
  '/about.html',
  '/contact.html',
  '/faq.html',
  '/blog.html',
  '/brands.html',
  '/services.html',
  '/store-locator.html',
  '/health-conditions.html',
  '/prescription.html',
  '/view-prescription.html',
  '/product.html',
  '/account.html',
  '/css/style.css',
  '/js/cart.js',
  '/manifest.json',
  '/delivery.html',
  '/careers.html',
  '/health-tips.html',
  '/loyalty.html',
  '/order-confirmation.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE && k !== API_CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // ====== Static data: cache-first, never expire ======
  if (url.pathname.startsWith('/static-data/')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }))
    );
    return;
  }

  // ====== Product & brand API: cache-first with stale-while-revalidate ======
  // These are read-heavy, change infrequently. Serve cached instantly,
  // then silently update in background.
  const apiReadPatterns = ['/api/products', '/api/brands', '/api/reviews', '/api/auth'];  // auth GET (seed + list users) is read-heavy
  const isApiRead = apiReadPatterns.some(p => url.pathname.startsWith(p))
    && !url.searchParams.has('action')
    && e.request.method === 'GET';

  if (isApiRead) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(API_CACHE).then(cache => cache.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // ====== Skip other API requests ======
  if (url.pathname.startsWith('/api/')) return;

  // ====== Prescription forms: network-first ======
  if (url.pathname === '/prescription.html' || url.pathname === '/view-prescription.html') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // ====== Admin page: network-first ======
  if (url.pathname === '/admin.html') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // ====== Other static pages: cache-first ======
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
