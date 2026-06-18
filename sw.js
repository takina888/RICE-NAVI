// RICE NAVI v26: self-destroying legacy Service Worker remover. No app caching.
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    try { if (self.registration && self.registration.unregister) await self.registration.unregister(); } catch(e) {}
    try { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } catch(e) {}
    try { const cs = await clients.matchAll({type:'window', includeUncontrolled:true}); cs.forEach(c => c.navigate(c.url.split('?')[0]+'?v=26&swreset='+Date.now())); } catch(e) {}
  })());
});
self.addEventListener('fetch', event => { /* no interception */ });
