const CACHE_VERSION='textrecovery29-googleui16-auditfix-logoremove-logoremove-20260701';
const CACHE_NAME='rice-navi-googleui16-auditfix-logoremove-logoremove-20260701'+CACHE_VERSION;
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('rice-navi-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;event.respondWith(fetch(req,{cache:'reload'}).catch(async()=>{const cache=await caches.open(CACHE_NAME);return (await cache.match(req))||Response.error();}));});
