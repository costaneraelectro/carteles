/* Service worker: cache-first para el marco de la app (funciona offline).
   Las peticiones a otros dominios (falabella.com, media.falabella, Firebase)
   pasan directo a la red para no romper CORS ni datos en vivo. */
const CACHE = "carteles-v1";
const CORE = [
  "./",
  "index.html",
  "css/styles.css",
  "js/app.js",
  "js/lib/qrcode.min.js",
  "js/lib/html2canvas.min.js",
  "js/lib/jspdf.umd.min.js",
  "manifest.webmanifest",
  "assets/icon/icon-192.png",
  "assets/icon/icon-512.png",
  "assets/icon/favicon-32.png",
  "assets/icon/apple-touch.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // deja pasar dominios externos
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match("index.html"));
    })
  );
});
