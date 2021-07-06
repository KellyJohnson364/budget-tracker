const CACHE_NAME = 'static-cache-v2'
const DATA_CACHE_NAME = 'data-cache-v1'

// upon install cache all files indicated

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then( cache => {
      return cache.addAll([
        "/",
        "./index.js",
        "./db.js",
        "./manifest.webmanifest",
        "./styles.css",
        "./icons/icon-192x192.png",
        "./icons/icon-512x512.png",

      ]);
    })
  );
  console.log('Install');
  self.skipWaiting();
});



// fetch
self.addEventListener("fetch", function(evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});
