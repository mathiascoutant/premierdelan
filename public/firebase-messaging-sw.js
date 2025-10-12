// ========================================
// Service Worker Firebase - SANS "from ..."
// ========================================

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

// ⚠️ NE PAS initialiser messaging ici sinon Firebase affiche aussi automatiquement !
// const messaging = firebase.messaging(); ← À NE PAS FAIRE

// ⭐ IMPORTANT: Gérer les DATA MESSAGES (pas les notification messages)
// Cela évite le "from ..." sur iOS et Android
self.addEventListener("push", function (event) {
  console.log("📩 Push reçu:", event);

  try {
    const payload = event.data.json();
    console.log("Payload complet:", payload);

    // Le backend envoie UNIQUEMENT des data messages
    // Donc les infos sont dans payload.data (pas payload.notification)
    const data = payload.data || {};

    const title = data.title || "Notification";
    const message = data.body || data.message || "";
    const type = data.type || "general";

    console.log("Titre:", title);
    console.log("Message:", message);
    console.log("Type:", type);

    // Configuration spéciale pour les alertes critiques
    const isCriticalError = type === "critical_error";

    const notificationOptions = {
      body: message,
      icon: "/premierdelan/icon-192x192.png",
      badge: "/premierdelan/icon-192x192.png",
      vibrate: isCriticalError
        ? [300, 100, 300, 100, 300] // Vibration plus intense pour alertes
        : [200, 100, 200],
      tag: isCriticalError ? "critical-error" : "premier-de-lan-notif",
      requireInteraction: isCriticalError, // Reste affichée jusqu'au clic pour les alertes
      data: data,
      // Couleur de badge sur Android (rouge pour alertes critiques)
      ...(isCriticalError && { badge: "🚨" }),
    };

    event.waitUntil(
      self.registration.showNotification(title, notificationOptions)
    );
  } catch (error) {
    console.error("❌ Erreur dans le Service Worker:", error);
  }
});

// Gérer le clic sur la notification
self.addEventListener("notificationclick", function (event) {
  console.log("👆 Notification cliquée");
  console.log("Type de notification:", event.notification.data?.type);
  event.notification.close();

  // URL de redirection (peut être personnalisée par notification)
  const url =
    event.notification.data?.click_action ||
    event.notification.data?.url ||
    "/premierdelan/";

  console.log("🔗 Redirection vers:", url);

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Si une fenêtre est déjà ouverte, la focus et navigue
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ("focus" in client && "navigate" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Sinon, ouvre une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log(
  "✅ Service Worker Firebase chargé - Mode DATA MESSAGE (sans from)"
);
