// RICE NAVI v24: legacy Service Worker removal helper.
self.addEventListener('install', function(event){ self.skipWaiting(); });
self.addEventListener('activate', function(event){
  event.waitUntil((async function(){
    if (self.registration && self.registration.unregister) await self.registration.unregister();
    var keys = await caches.keys();
    await Promise.all(keys.map(function(k){ return caches.delete(k); }));
    var clientsList = await clients.matchAll({type:'window'});
    clientsList.forEach(function(client){ client.navigate(client.url.split("?")[0]+"?v=24&swreset="+Date.now()); });
  })());
});
self.addEventListener('fetch', function(event){ return; });
