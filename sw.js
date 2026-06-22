const CACHE_VERSION='78m70';
const CACHE_NAME='rice-navi-'+CACHE_VERSION;
self.addEventListener('install',event=>{ self.skipWaiting(); });
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('rice-navi-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try{
      const res=await fetch(req);
      if(res && res.ok) cache.put(req,res.clone());
      return res;
    }catch(e){
      const cached=await cache.match(req);
      return cached || Response.error();
    }
  })());
});
