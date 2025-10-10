// Service Worker pour Firebase Cloud Messaging
// Version avec contrôle total (pas de "from ...")

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBdQ8j21Vx7N2myh6ir8gY_zZkRCl-25qI",
  authDomain: "premier-de-lan.firebaseapp.com",
  projectId: "premier-de-lan",
  storageBucket: "premier-de-lan.firebasestorage.app",
  messagingSenderId: "220494656911",
  appId: "1:220494656911:web:2ff99839c5f7271ddf07fa",
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Intercepter l'événement push AVANT Firebase pour avoir le contrôle total
self.addEventListener("push", function (event) {
  console.log("📩 Push event reçu:", event);

  if (!event.data) {
    console.log("Pas de données dans le push");
    return;
  }

  try {
    const payload = event.data.json();
    console.log("Payload:", payload);

    // Extraire les données (format Firebase)
    const notificationData = payload.notification || payload.data || {};
    const title =
      notificationData.title || payload.data?.title || "Notification";
    const body = notificationData.body || payload.data?.message || "";

    const options = {
      body: body,
      icon: "/premierdelan/icon-192x192.png",
      badge: "/premierdelan/icon-192x192.png",
      vibrate: [200, 100, 200],
      data: payload.data || {},
      tag: "premier-notification",
      requireInteraction: false,
      silent: false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("Erreur parsing notification:", error);
  }
});

// Gérer le clic sur la notification
self.addEventListener("notificationclick", function (event) {
  console.log("👆 Notification cliquée");
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/premierdelan/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Si une fenêtre est déjà ouverte, la focus
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ("focus" in client) {
            return client.focus();
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
