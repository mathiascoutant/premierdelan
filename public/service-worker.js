console.log("🔔 Service Worker chargé");

self.addEventListener("push", function (event) {
  console.log("📩 Notification reçue");
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || "Nouvelle notification",
    icon: data.icon || "/premierdelan/icon-192x192.png",
    badge: data.badge || "/premierdelan/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: data.data || {},
    tag: data.tag || "notification",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Notification", options)
  );
});

self.addEventListener("notificationclick", function (event) {
  console.log("🖱️ Notification cliquée");
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/premierdelan/")
  );
});

