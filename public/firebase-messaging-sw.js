// Service Worker pour les notifications Firebase
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuration Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDUope_RLAr2khRI3zovTE-xZk5lXzTb2Q",
  authDomain: "premierdelan-c81c1.firebaseapp.com",
  projectId: "premierdelan-c81c1",
  storageBucket: "premierdelan-c81c1.firebasestorage.app",
  messagingSenderId: "1092182821611",
  appId: "1:1092182821611:web:7c5dc6ab5119e16af12ea9",
  measurementId: "G-LP1FH2HJMX"
});

const messaging = firebase.messaging();

// Écouter les messages push natifs
self.addEventListener('push', function(event) {
  console.log('📨 Message push reçu !', event);
  
  let data = {};
  let title = 'Notification';
  let body = '';
  
  try {
    if (event.data) {
      data = event.data.json();
      title = data.notification?.title || data.data?.title || 'Notification';
      body = data.notification?.body || data.data?.message || '';
    }
  } catch (e) {
    console.error('Erreur parsing push:', e);
  }
  
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: data.data || data,
      tag: data.data?.type || 'default',
      requireInteraction: true,
    })
  );
});

// Gestion des notifications en arrière-plan (Firebase)
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Message Firebase reçu en arrière-plan:', payload);

  const notificationTitle = payload.notification?.title || 'Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data || {},
    tag: payload.data?.type || 'default',
    requireInteraction: true,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestion du clic sur la notification
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Clic sur notification:', event.notification.data);
  event.notification.close();
  
  const data = event.notification.data;
  let url = 'https://mathiascoutant.github.io/premierdelan/';
  
  // Si c'est un message de chat, rediriger vers la conversation
  if (data.type === 'chat_message' && data.conversationId) {
    url = `https://mathiascoutant.github.io/premierdelan/chat?conversation=${data.conversationId}`;
  }
  // Si c'est une invitation, rediriger vers le chat
  else if (data.type === 'chat_invitation') {
    url = 'https://mathiascoutant.github.io/premierdelan/chat';
  }
  
  event.waitUntil(
    clients.openWindow(url)
  );
});
