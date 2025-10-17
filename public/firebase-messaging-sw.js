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
  console.log("📦 [SW] Data:", data);

  // 💾 SAUVEGARDER dans localStorage via postMessage + Cache API
  if (data.type === "chat_message" && data.conversationId) {
    console.log("💾 [SW] Sauvegarde conversationId:", data.conversationId);
    
    // Méthode 1: PostMessage aux clients ouverts
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SAVE_CONVERSATION_ID',
              conversationId: data.conversationId
            });
          });
        })
        .catch(e => console.warn("⚠️ [SW] PostMessage échoué:", e))
    );
    
    // Méthode 2: Cache API (fallback robuste)
    event.waitUntil(
      caches.open('notification-data').then(cache => {
        return cache.put('pending-conversation', 
          new Response(JSON.stringify({ 
            conversationId: data.conversationId,
            timestamp: Date.now()
          }))
        );
      }).catch(e => console.warn("⚠️ [SW] Cache échoué:", e))
    );
  }

  // 🎯 Ouvrir /chat (SANS paramètre pour compatibilité iOS)
  const baseUrl = "https://mathiascoutant.github.io/premierdelan";
  let targetUrl = baseUrl + "/";
  
  if (data.type === "chat_message" || data.type === "chat_invitation") {
    targetUrl = baseUrl + "/chat";
  }
  
  console.log("🎯 [SW] Ouverture:", targetUrl);
  event.waitUntil(clients.openWindow(targetUrl));
});
