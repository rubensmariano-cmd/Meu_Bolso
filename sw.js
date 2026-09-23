// Meu Bolso — service worker (cache offline, atualização imediata na navegação)
const CACHE = 'meu-bolso-v3';
const ARQUIVOS = [
  './', './index.html',
  './consts.js', './util.js', './demo.js', './app.js', './compute.js',
  './chart.js', './navegacao.js', './dashboard.js', './lancamentos.js',
  './resumo.js', './config.js',
  './manifest.webmanifest', './favicon.svg', './icons-192.png', './icons-512.png'
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
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // navegação (abrir o app): tenta a rede primeiro → se cair, usa o cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put('./index.html', clone));
          return resp;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // demais recursos: cache primeiro, atualiza em segundo plano
  e.respondWith(
    caches.match(e.request).then(r => {
      const atualiza = fetch(e.request)
        .then(resp => { if (resp.ok) { const c2 = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, c2)); } return resp; })
        .catch(() => r);
      return r || atualiza;
    })
  );
});
