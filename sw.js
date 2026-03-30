self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("app").then(cache =>
      cache.addAll(["./", "./index.html", "./app.js", "./style.css"])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});