
const CACHE_RESET_VERSION = 'rice-navi-v19-cache-reset';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => caches.delete(n)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({type:'window'});
    for (const client of clients) client.navigate(client.url);
  })());
});
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request, {cache:'no-store'}).catch(() => fetch(event.request)));
});
