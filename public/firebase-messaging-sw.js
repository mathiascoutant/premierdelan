// Service Worker Firebase Cloud Messaging
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Configuration Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBdQ8j21Vx7N2myh6ir8gY_zZkRCl-25qI",
  authDomain: "premier-de-lan.firebaseapp.com",
  projectId: "premier-de-lan",
  storageBucket: "premier-de-lan.firebasestorage.app",
  messagingSenderId: "220494656911",
  appId: "1:220494656911:web:2ff99839c5f7271ddf07fa",
});

const messaging = firebase.messaging();

// Gérer les notifications en arrière-plan
// IMPORTANT: Si vous recevez 2 notifications, c'est que le backend envoie
// un "notification message" au lieu d'un "data message"
// Voir BACKEND_FCM_FORMAT.md pour la solution
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Notification Firebase reçue:", payload);

  // Extraire titre et message
  // Si backend envoie "data message" → payload.data.title, payload.data.message
  // Si backend envoie "notification message" → payload.notification.title, payload.notification.body
  const title =
    payload.notification?.title || payload.data?.title || "Notification";
  const body =
    payload.notification?.body ||
    payload.data?.message ||
    payload.data?.body ||
    "";

  const options = {
    body: body,
    icon: "/premierdelan/icon-192x192.png",
    badge: "/premierdelan/icon-192x192.png",
    vibrate: [200, 100, 200],
    tag: "fcm-notification",
    requireInteraction: false,
    data: payload.data || {},
  };

  // Afficher la notification
  return self.registration.showNotification(title, options);
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
