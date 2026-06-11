const CACHE = 'obwocha-v6';
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
  '/product.html',
  '/account.html',
  '/css/style.css',
  '/js/cart.js',
  '/manifest.json',
  '/delivery.html',
  '/careers.html',
  '/health-tips.html',
  '/loyalty.html',
  '/refund.html',
  '/order-confirmation.html',
  '/admin.html'
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
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Skip API requests — never cache or intercept them
  if (e.request.url.includes('/api/')) return;
  if (e.request.method !== 'GET') return;
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
