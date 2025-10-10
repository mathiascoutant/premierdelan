# 🔥 Format des notifications Firebase côté Backend

## ⚠️ IMPORTANT : Éviter le "from ..."

Pour éviter le "from ..." et avoir le contrôle total, le backend doit envoyer des **DATA MESSAGES** uniquement (pas de champ `notification`).

## ❌ FORMAT À ÉVITER (affiche "from ...")

```python
# NE PAS FAIRE ÇA
message = messaging.Message(
    notification=messaging.Notification(  # ← PROBLÈME ICI
        title="Test",
        body="Message"
    ),
    token=fcm_token
)
```

## ✅ FORMAT CORRECT (pas de "from ...")

### Python (Firebase Admin SDK)

```python
from firebase_admin import messaging

# UNIQUEMENT des data messages
message = messaging.Message(
    data={
        'title': '🔔 Test de notification',
        'message': 'Votre système fonctionne parfaitement !',
        'action': 'test',
        'url': '/mes-evenements'
    },
    token=fcm_token,
    webpush=messaging.WebpushConfig(
        headers={
            'Urgency': 'high'
        },
        fcm_options=messaging.WebpushFCMOptions(
            link='https://mathiascoutant.github.io/premierdelan/'
        )
    )
)

response = messaging.send(message)
print('✅ Notification envoyée:', response)
```

### Node.js (Firebase Admin SDK)

```javascript
const admin = require('firebase-admin');

const message = {
  data: {
    title: '🔔 Test de notification',
    message: 'Votre système fonctionne parfaitement !',
    action: 'test',
    url: '/mes-evenements'
  },
  token: fcmToken,
  webpush: {
    headers: {
      Urgency: 'high'
    },
    fcm_options: {
      link: 'https://mathiascoutant.github.io/premierdelan/'
    }
  }
};

admin.messaging().send(message)
  .then((response) => {
    console.log('✅ Notification envoyée:', response);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
  });
```

---

## 🔧 Service Worker Frontend (déjà à jour)

Le Service Worker intercepte maintenant l'événement `push` et extrait les données :

```javascript
self.addEventListener('push', function(event) {
  const payload = event.data.json();
  
  // Extraire depuis data (pas notification)
  const title = payload.data?.title || 'Notification';
  const body = payload.data?.message || '';
  
  self.registration.showNotification(title, {
    body: body,
    icon: '/icon.png',
    // ...
  });
});
```

---

## 📊 Comparaison

| Type de message | Backend envoie | Frontend affiche | "from ..." |
|----------------|----------------|------------------|------------|
| **Notification message** | `notification: {...}` | Automatique par Firebase | ✅ OUI |
| **Data message** ✅ | `data: {...}` | Vous contrôlez (SW) | ❌ NON |

---

## 🎯 Action requise

Modifiez votre backend pour utiliser **UNIQUEMENT** des data messages (voir exemples ci-dessus).

Le Service Worker frontend est déjà prêt à recevoir ce format ! 🚀

