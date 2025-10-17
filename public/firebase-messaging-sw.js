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

// ✅ GARDER UNIQUEMENT le listener pour les clics sur les notifications
self.addEventListener("notificationclick", function (event) {
  console.log("👆 Notification cliquée");
  console.log("📦 Data complète:", event.notification.data);
  
  event.notification.close();

  const data = event.notification.data;
  console.log("📦 Type:", data.type);
  console.log("📦 ConversationId:", data.conversationId);
  
  // URL de base selon l'environnement
  const baseUrl = self.location.origin + "/premierdelan";
  
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        console.log("🔍 Clients trouvés:", clientList.length);

        // Chercher un client déjà ouvert
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes("premierdelan") && "focus" in client) {
            console.log("🪟 Focus sur client existant");
            
            // Envoyer un message au client pour qu'il gère la redirection
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              data: data,
            });
            
            return client.focus();
          }
        }

        // Aucun client ouvert, ouvrir une nouvelle fenêtre
        console.log("🆕 Ouverture nouvelle fenêtre");
        let targetUrl = baseUrl + "/";
        
        // Construire l'URL cible selon le type de notification
        if (data.type === "chat_message" && data.conversationId) {
          targetUrl = baseUrl + `/chat?conversation=${data.conversationId}`;
          console.log("💬 URL conversation:", targetUrl);
        } else if (data.type === "chat_invitation") {
          targetUrl = baseUrl + "/chat";
          console.log("📨 URL chat:", targetUrl);
        }
        
        console.log("🎯 URL cible complète:", targetUrl);
        return clients.openWindow(targetUrl);
      })
  );
});
