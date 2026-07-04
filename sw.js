// Rebound service worker — cache-first so the app works fully offline.
// Bump VERSION whenever any file changes to push an update to installed phones.
var VERSION = 'rebound-v1';
var FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/exercises.js',
  './js/state.js',
  './js/generator.js',
  './js/progression.js',
  './js/protein.js',
  './js/workout.js',
  './js/history.js',
  './js/settings.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        var copy = res.clone();
        caches.open(VERSION).then(function(c){ c.put(e.request, copy); });
        return res;
      });
    })
  );
});
