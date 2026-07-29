const CACHE_NAME = 'la-controle-v77';
const ASSETS = [
  './',
  './index.html',
  './painel.html',
  './assets/js/la-backend-loader.js',
  './assets/js/la-store.js',
  './assets/js/la-supabase.js',
  './assets/js/utils.js',
  './assets/js/constants.js',
  './assets/js/state.js',
  './assets/js/motorista-auth.js',
  './assets/js/destinos.js',
  './assets/js/mapa.js',
  './assets/js/backup-viagem.js',
  './assets/js/gps.js',
  './assets/js/corrida.js',
  './assets/js/gestor-auth.js',
  './assets/css/variables.css',
  './assets/css/motorista.css',
  './assets/css/painel.css',
  './manifest.json',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js',
  'https://i.ibb.co/27cxGcb1/lacustomlogotipo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (url.hostname.includes('supabase.co') || url.hostname.includes('jsdelivr.net')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
