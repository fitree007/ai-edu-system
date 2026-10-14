// Service Worker สำหรับ AI EDU System (PWA Caching & Offline Support)
const CACHE_NAME = "ai-edu-system-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/globals.css",
  "/favicon.ico"
];

// ติดตั้ง Service Worker และบันทึก Core Assets ลง Cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("SW install cache error:", err);
      });
    })
  );
  self.skipWaiting();
});

// เปิดใช้งาน Service Worker และลบ Cache เก่าที่ไม่ตรงเวอร์ชัน
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// จัดการ Fetch: Network First with Cache Fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // สำหรับคำร้องขอที่ไปยัง Google Apps Script ให้ใช้ Network เสมอ
  if (event.request.url.includes("script.google.com")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }
        });
      })
  );
});
