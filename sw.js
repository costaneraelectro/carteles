/* Service worker.
   - Shell (HTML/CSS/JS): NETWORK-FIRST → siempre trae lo último si hay red,
     cae a caché solo sin conexión (evita servir versiones viejas).
   - Imágenes/fuentes locales: cache-first (rápido y offline).
   - Otros dominios (falabella.com, media.falabella, Firebase): directo a la red. */
const CACHE = "carteles-v3";
const CORE = [
  "./",
  "index.html",
  "css/styles.css",
  "js/app.js",
  "js/lib/qrcode.min.js",
  "js/lib/html2canvas.min.js",
  "js/lib/jspdf.umd.min.js",
  "manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function isShell(url) {
  return url.pathname.endsWith("/") || /\.(html|css|js|webmanifest)$/i.test(url.pathname);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // deja pasar dominios externos

  if (req.mode === "navigate" || isShell(url)) {
    // NETWORK-FIRST: trae lo último; guarda copia; sin red usa caché
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req).then((h) => h || caches.match("index.html")))
    );
    return;
  }

  // resto (imágenes, fuentes): CACHE-FIRST
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      });
    })
  );
});
