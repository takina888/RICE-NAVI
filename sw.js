// RICE NAVI v27: no offline cache. Remove old service worker/caches.
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      await self.registration.unregister();
      const clientsList = await clients.matchAll({type:'window', includeUncontrolled:true});
      clientsList.forEach(c => c.navigate(c.url));
    } catch(e) {}
  })());
});
self.addEventListener('fetch', event => {});
