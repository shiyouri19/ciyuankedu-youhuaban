const CACHE_NAME = 'ciyuan-kedu-shell-v1.4.0';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon.svg',
  '/assets/keke-pack/mood-normal.png',
  '/assets/keke-pack/mood-cheer.png',
  '/assets/keke-pack/mood-curious.png',
  '/assets/keke-pack/mood-shy.png',
  '/assets/keke-pack/mood-night.png',
  '/assets/keke-pack/sticker-cheer.png',
  '/assets/keke-pack/sticker-thanks.png',
  '/assets/keke-pack/sticker-pat.png',
  '/assets/keke-pack/sticker-watch.png',
  '/assets/keke-pack/sticker-ok.png',
  '/assets/keke-pack/sticker-goodnight.png',
  '/assets/keke-pack/pose-cat.png',
  '/assets/keke-pack/pose-work.png',
  '/assets/keke-pack/pose-read.png',
  '/assets/keke-pack/pose-heart.png',
  '/assets/keke-pack/chibi-sit.png',
  '/assets/keke-pack/deco-quote.png',
  '/assets/keke-chibi.svg',
  '/assets/keke-cheer.svg',
  '/assets/keke-night.svg',
  '/assets/keke-curious.svg',
  '/assets/keke-shy.svg',
  '/assets/keke-sheet.svg',
  '/public/assets/aistudio/keke-sheet_13d3b3b4.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/index.html')))
  );
});
