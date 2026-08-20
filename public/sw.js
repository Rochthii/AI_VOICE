/**
 * CHI VOICE - PWA SERVICE WORKER (CACHE-FIRST OFFLINE RUNTIME)
 * Bảo đảm 100% tài nguyên và tệp âm thanh 5 trạm được cache sẵn để du khách xuống hầm 12m không cần mạng
 */

const CACHE_NAME = "chi-voice-v3.0";
const STATIC_ASSETS = [
  "/",
  "/qr",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/audio/stations/01_kitchen_vi.mp3",
  "/audio/stations/01_kitchen_en.mp3",
  "/audio/stations/02_hospital_vi.mp3",
  "/audio/stations/02_hospital_en.mp3",
  "/audio/stations/03_command_vi.mp3",
  "/audio/stations/03_command_en.mp3",
  "/audio/stations/04_termite_vi.mp3",
  "/audio/stations/04_termite_en.mp3",
  "/audio/stations/05_traps_vi.mp3",
  "/audio/stations/05_traps_en.mp3"
];

// 1. Cài đặt Service Worker và Cache trước toàn bộ audio & app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Pre-caching static assets and station audio for subterranean usage...");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Cache addAll warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Kích hoạt và dọn dẹp cache cũ
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Chiến lược Fetch: Cache-First cho Audio/Assets & Network-First cho API
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Không can thiệp API POST requests
  if (request.method !== "GET") return;

  // Audio files: Cache First (Tải 0ms, không phụ thuộc mạng)
  if (url.pathname.startsWith("/audio/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // App Shell & Static assets: Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return cached || new Response("Offline", { status: 503 });
        });

      return cached || fetchPromise;
    })
  );
});
