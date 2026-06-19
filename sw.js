// RICE NAVI development-safe service worker
// Fixed filenames + URL build versions. During active development,
// HTML/CSS/JS/JSON are network-first to avoid stale builds.
const CACHE_NAME = 'rice-navi-static-78ui44';
const CORE_STATIC = [
  './assets/app-icon/RICE_NAVI_RN_icon.png?v=78ui44'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_STATIC).catch(() => null)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  const path = url.pathname;

  // Always prefer fresh app shell and data during active development.
  if (req.mode === 'navigate' || /\/(index\.html|manifest\.json|version\.txt)$/.test(path) || path.includes('/data/') || path.includes('/js/') || path.includes('/css/')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Assets: network-first, cache fallback. This prevents stale icons after replacement,
  // while still allowing offline-ish display for already seen images.
  if (path.includes('/assets/')) {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req))
    );
  }
});
