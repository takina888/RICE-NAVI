const CACHE_NAME = 'rice-navi-v7-translation-polish';
const CORE_ASSETS = [
  './', './index.html', './styles.css', './app.js', './manifest.webmanifest',
  './assets/rice_navi_rn_logo.png', './assets/icon-192.png', './assets/icon-512.png',
  './data/rice_navi_module_manifest_v2.json',
  './data/rice_navi_app_menu_v2.json',
  './data/rice_navi_json_import_manifest_v2.json',
  './data/rice_navi_learning_cards_multilingual_v82.json',
  './data/rice_navi_term_glossary_multilingual_v82.json',
  './data/rice_navi_storage_mold_rules_v1_0.json',
  './data/rice_navi_future_rice_50_ja_LATEST.json'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
