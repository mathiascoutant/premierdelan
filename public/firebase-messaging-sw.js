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

// ✅ Listener push natif pour les notifications FCM
self.addEventListener("push", function (event) {
  console.log("📨 Message push reçu !", event);

  if (!event.data) {
    console.log("❌ Pas de data dans l'event");
    return;
  }

  try {
    const payload = event.data.json();

    // ✅ LOGGER LE PAYLOAD COMPLET POUR DEBUG
    console.log("🔍 PAYLOAD COMPLET:", JSON.stringify(payload, null, 2));
    console.log("🔍 Type de payload:", typeof payload);
    console.log("🔍 Keys du payload:", Object.keys(payload));
    console.log("🔍 payload.notification:", payload.notification);
    console.log("🔍 payload.data:", payload.data);

    // NE RIEN FAIRE - Laisser le système afficher nativement
    console.log("✅ Pas de traitement - Affichage natif par le système");
    return;
  } catch (e) {
    console.error("❌ Erreur parsing push:", e);
  }
});

// Gestion du clic sur la notification
self.addEventListener("notificationclick", function (event) {
  console.log("🔔 Clic sur notification:", event.notification.data);
  event.notification.close();

  const data = event.notification.data;
  let url = "https://mathiascoutant.github.io/premierdelan/";

  // Si c'est un message de chat, rediriger vers la conversation
  if (data.type === "chat_message" && data.conversationId) {
    url = `https://mathiascoutant.github.io/premierdelan/chat?conversation=${data.conversationId}`;
  }
  // Si c'est une invitation, rediriger vers le chat
  else if (data.type === "chat_invitation") {
    url = "https://mathiascoutant.github.io/premierdelan/chat";
  }

  event.waitUntil(clients.openWindow(url));
});
