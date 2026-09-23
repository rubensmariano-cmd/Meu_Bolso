// Meu Bolso — service worker (cache offline)
const CACHE = 'meu-bolso-v1';
const ARQUIVOS = [
  './',
  './index.html',
  './consts.js',
  './util.js',
  './demo.js',
  './app.js',
  './compute.js',
  './chart.js',
  './navegacao.js',
  './dashboard.js',
  './lancamentos.js',
  './resumo.js',
  './config.js',
  './manifest.webmanifest',
  './favicon.svg',
  './icons-192.png',
  './icons-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(chaves.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r =>
      r || fetch(e.request).then(resp => {
        const url = new URL(e.request.url);
        if (resp.ok && url.origin === location.origin) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
