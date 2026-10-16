// Service Worker สำหรับ AI EDU System (PWA Caching & Safe Asset Handling)
const CACHE_NAME = "ai-edu-system-v3";
const STATIC_ASSETS = [
  "/manifest.json",
  "/favicon.ico"
];

// ติดตั้ง Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("SW install cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// เปิดใช้งานและล้าง Cache เก่าที่ไม่ตรงเวอร์ชันทันที
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Removing outdated cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// จัดการ Fetch: ปล่อยคำร้องขอ _next, html documents และ script.google.com ผ่าน Network ตรงๆ เสมอ
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  // สำหรับ Next.js dynamic chunks, API requests, และ Google Apps Script ให้ใช้ Network เสมอ
  if (
    url.includes("/_next/") ||
    url.includes("script.google.com") ||
    event.request.mode === "navigate" ||
    event.request.headers.get("accept")?.includes("text/html")
  ) {
    return;
  }

  // สำหรับ static assets อื่นๆ เช่น manifest, icons ให้ใช้ Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
