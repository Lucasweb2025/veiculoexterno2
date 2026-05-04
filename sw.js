self.addEventListener('install', (e) => {
  console.log('L.A. SW Ativo');
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});