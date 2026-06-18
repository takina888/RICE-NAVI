
const RICE_NAVI_SW_VERSION = 'v22-no-cache-reset';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => caches.delete(n)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({type:'window'});
    for (const client of clients) client.navigate(client.url.split('?')[0] + '?v=22&swreset=' + Date.now());
  })());
});
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request, {cache:'no-store'}).catch(() => fetch(event.request)));
});
