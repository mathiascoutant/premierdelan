// Service Worker pour les notifications Firebase
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Configuration Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDUope_RLAr2khRI3zovTE-xZk5lXzTb2Q",
  authDomain: "premierdelan-c81c1.firebaseapp.com",
  projectId: "premierdelan-c81c1",
  storageBucket: "premierdelan-c81c1.firebasestorage.app",
  messagingSenderId: "1092182821611",
  appId: "1:1092182821611:web:7c5dc6ab5119e16af12ea9",
  measurementId: "G-LP1FH2HJMX",
});

const messaging = firebase.messaging();

// ✅ Ne rien faire dans onBackgroundMessage (iOS gère l'affichage)
messaging.onBackgroundMessage((payload) => {
  console.log('📨 [Firebase] Message en arrière-plan - iOS gère l\'affichage');
  return null; // Empêche Firebase d'afficher (iOS le fait déjà)
});

// ✅ Forcer l'activation immédiate du nouveau service worker
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 🔔 Gestion du clic sur notification (iOS PWA Compatible)
self.addEventListener("notificationclick", function (event) {
  console.log("🔔 [SW] Notification cliquée");
  event.notification.close();

  const data = event.notification.data || {};
  console.log("📦 [SW] Data complète:", JSON.stringify(data));

  const baseUrl = "https://mathiascoutant.github.io/premierdelan";
  let targetUrl = baseUrl + "/";
  
  if (data.type === "chat_message" || data.type === "chat_invitation") {
    targetUrl = baseUrl + "/chat";
  }

  // 💾 Si c'est un message chat, SAUVEGARDER AVANT d'ouvrir
  if (data.type === "chat_message" && data.conversationId) {
    console.log("💾 [SW] Sauvegarde conversationId:", data.conversationId);
    
    event.waitUntil(
      caches.open('notification-data')
        .then(cache => {
          console.log("📂 [SW] Cache ouvert");
          return cache.put('/notification-data', 
            new Response(JSON.stringify({ 
              conversationId: data.conversationId,
              timestamp: Date.now()
            }))
          );
        })
        .then(() => {
          console.log("✅ [SW] Sauvegardé, ouverture app...");
          return clients.openWindow(targetUrl);
        })
        .catch(e => {
          console.error("❌ [SW] Erreur:", e);
          return clients.openWindow(targetUrl);
        })
    );
  } else {
    // Pour les autres types, ouvrir directement
    console.log("🎯 [SW] Ouverture directe:", targetUrl);
    event.waitUntil(clients.openWindow(targetUrl));
  }
});
