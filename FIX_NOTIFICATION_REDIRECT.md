# 🔔 Fix: Redirection des notifications vers les conversations

## 🐛 Problème

Quand on clique sur une notification de message, on arrive sur la page d'accueil au lieu d'arriver directement dans la conversation.

## ✅ Format attendu par le frontend

### Notification push Firebase (backend Python)

Le backend DOIT envoyer les notifications avec ce format exact :

```python
# Pour un message de chat
message = messaging.Message(
    notification=messaging.Notification(
        title=f"Nouveau message de {sender_name}",
        body=message_content
    ),
    data={
        "type": "chat_message",
        "conversationId": str(conversation_id),  # ⚠️ IMPORTANT: camelCase !
        "senderId": str(sender_id),
        "senderName": sender_name
    },
    token=fcm_token
)
```

### ⚠️ TRÈS IMPORTANT

Le champ **DOIT** être **`conversationId`** (camelCase) et non `conversation_id` (snake_case) !

Le service worker et le frontend cherchent `data.conversationId`.

## 🔍 Vérification backend

### 1. Vérifier le format envoyé

Dans le backend, logger ce qui est envoyé :

```python
print("📤 Notification envoyée:")
print(f"  Type: {message.data['type']}")
print(f"  ConversationId: {message.data.get('conversationId')}")
print(f"  Data complet: {message.data}")
```

### 2. Vérifier le endpoint d'envoi

**Endpoint** : `POST /api/fcm/send` ou `/api/admin/chat/send-notification`

Le payload doit contenir :

```json
{
  "fcm_token": "user_token_here",
  "notification": {
    "title": "Nouveau message de Mathias",
    "body": "Salut, comment ça va ?"
  },
  "data": {
    "type": "chat_message",
    "conversationId": "68f16e34484cc37ef8764d28",
    "senderId": "admin_id",
    "senderName": "Mathias"
  }
}
```

## 📱 Forcer la mise à jour du Service Worker (utilisateur)

Si le backend envoie le bon format mais ça ne marche toujours pas, il faut forcer la mise à jour du service worker :

### Sur Android Chrome/Edge :

1. **Fermer complètement l'app PWA** (swipe depuis les apps récentes)
2. **Aller dans Chrome** (navigateur)
3. **Menu** → **Paramètres** → **Confidentialité et sécurité** → **Effacer les données de navigation**
4. **Cocher** : "Fichiers et images en cache"
5. **Période** : "Dernières 24 heures"
6. **Effacer les données**
7. **Réinstaller la PWA** depuis le site web

### Alternative rapide (pour tester) :

1. **Ouvrir le site dans Chrome** (pas la PWA)
2. **Menu** → **Plus d'outils** → **Outils de développement** (si disponible sur mobile)
3. **Application** → **Service Workers** → **Unregister**
4. **Fermer Chrome**
5. **Réouvrir la PWA**

## 🧪 Test complet

1. Vérifier les logs backend → Le `conversationId` est bien envoyé en camelCase
2. Envoyer une notification test
3. Cliquer sur la notification
4. Vérifier qu'on arrive bien sur `/chat?conversation=...`

## 🎯 Flux attendu

```
Backend envoie notification
  ↓
  data: { type: "chat_message", conversationId: "123" }
  ↓
Service Worker reçoit notificationclick
  ↓
Vérifie si app ouverte
  ↓
Si OUI → postMessage vers NotificationRedirectHandler
  ↓
router.push("/chat?conversation=123")
  ↓
Si NON → clients.openWindow("/premierdelan/chat?conversation=123")
  ↓
✅ Utilisateur arrive dans la conversation
```

## 🔧 Code backend correct (exemple Python)

```python
from firebase_admin import messaging

def send_chat_notification(recipient_fcm_token, sender_name, message_content, conversation_id, sender_id):
    """
    Envoie une notification de message de chat
    """
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=f"💬 {sender_name}",
                body=message_content[:100]  # Limiter à 100 caractères
            ),
            data={
                "type": "chat_message",
                "conversationId": str(conversation_id),  # ⚠️ camelCase obligatoire
                "senderId": str(sender_id),
                "senderName": sender_name
            },
            token=recipient_fcm_token,
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    icon='ic_notification',
                    color='#D4AF37',  # Couleur dorée
                    sound='default',
                    click_action='FLUTTER_NOTIFICATION_CLICK'
                )
            ),
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    icon='/icon-192x192.png',
                    badge='/icon-192x192.png'
                ),
                fcm_options=messaging.WebpushFCMOptions(
                    link=f'https://mathiascoutant.github.io/premierdelan/chat?conversation={conversation_id}'
                )
            )
        )
        
        response = messaging.send(message)
        print(f"✅ Notification envoyée: {response}")
        return {"success": True, "message_id": response}
        
    except Exception as e:
        print(f"❌ Erreur envoi notification: {e}")
        return {"success": False, "error": str(e)}
```

## 🔴 Erreurs courantes

### ❌ Erreur 1 : snake_case au lieu de camelCase

```python
# ❌ MAUVAIS
data = {
    "type": "chat_message",
    "conversation_id": str(conversation_id)  # ← Ne fonctionnera PAS
}

# ✅ CORRECT
data = {
    "type": "chat_message",
    "conversationId": str(conversation_id)  # ← Bon format
}
```

### ❌ Erreur 2 : ObjectId non converti en string

```python
# ❌ MAUVAIS
"conversationId": conversation_id  # ObjectId non sérialisable

# ✅ CORRECT
"conversationId": str(conversation_id)
```

### ❌ Erreur 3 : Pas de données dans la notification

```python
# ❌ MAUVAIS - Seulement notification, pas de data
message = messaging.Message(
    notification=messaging.Notification(title="Message", body="..."),
    token=token
)

# ✅ CORRECT - Avec data
message = messaging.Message(
    notification=messaging.Notification(title="Message", body="..."),
    data={"type": "chat_message", "conversationId": "..."},
    token=token
)
```

---

## 📝 TODO Backend

- [ ] Vérifier que les notifications utilisent `conversationId` (camelCase)
- [ ] Logger les données envoyées pour debug
- [ ] Tester l'envoi d'une notification
- [ ] Vérifier que le frontend reçoit bien le `conversationId`

## 📝 TODO Frontend (fait ✅)

- [x] Service worker utilise `postMessage` pour app ouverte
- [x] NotificationRedirectHandler gère la redirection
- [x] Logs de debug ajoutés
- [x] Support du paramètre `?conversation=...` dans la page chat

---

🎯 **Une fois le backend corrigé et le service worker mis à jour, la redirection fonctionnera !**

