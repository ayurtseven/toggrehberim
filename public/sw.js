const CACHE_VERSION = "v1";
const CACHE_NAME = `toggrehberim-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

// Uygulama kabuğu — her zaman önbelleğe alınır
const PRECACHE_URLS = [
  "/",
  "/rehber",
  "/ikaz-arama",
  "/sarj-haritasi",
  "/offline",
  "/manifest.json",
];

// ── Kurulum: uygulama kabuğunu önbelleğe al ──────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Aktifleştirme: eski önbellekleri temizle ──────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: strateji seçimi ────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // GET olmayan ve farklı origin'ler → atla
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // /_next/static/ → Cache First (build hash'li dosyalar değişmez)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  // /api/ikaz-sembolleri → Stale While Revalidate (offline'da sembol listesi çalışsın)
  if (url.pathname === "/api/ikaz-sembolleri") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fresh = fetch(request).then((res) => {
            if (res.status === 200) cache.put(request, res.clone());
            return res;
          });
          return cached || fresh;
        })
      )
    );
    return;
  }

  // /api/arama-index → Stale While Revalidate (offline'da arama çalışsın)
  if (url.pathname === "/api/arama-index") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fresh = fetch(request).then((res) => {
            cache.put(request, res.clone());
            return res;
          });
          return cached || fresh;
        })
      )
    );
    return;
  }

  // HTML sayfalar → Network First, offline fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.status === 200) {
            caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Diğerleri → Network First, cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
