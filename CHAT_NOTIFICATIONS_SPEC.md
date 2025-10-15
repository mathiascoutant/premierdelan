# 🔔 Spécification - Notifications PWA pour le Chat

## 📋 Vue d'ensemble

Système de notifications push pour le chat admin utilisant Firebase Cloud Messaging (FCM).

---

## 🎯 Quand envoyer des notifications

### 1. **Invitation de chat reçue**

**Déclencheur** : Quand un admin envoie une invitation via `POST /api/admin/chat/invitations`

**Action backend** :

```python
# Après avoir créé l'invitation en base de données
invitation_id = create_invitation(from_user_id, to_user_id, message)

# Envoyer une notification au destinataire
send_chat_notification(
    to_user_id=to_user_id,
    notification_type="chat_invitation",
    title="Nouvelle invitation de chat",
    body=f"{from_user.firstname} {from_user.lastname} vous invite à discuter",
    data={
        "type": "chat_invitation",
        "invitationId": str(invitation_id),
        "fromUserId": str(from_user_id),
        "fromUserName": f"{from_user.firstname} {from_user.lastname}"
    }
)
```

### 2. **Nouveau message reçu**

**Déclencheur** : Quand un admin envoie un message via `POST /api/admin/chat/conversations/:id/messages`

**Action backend** :

```python
# Après avoir enregistré le message
message_id = save_message(conversation_id, sender_id, content)

# Récupérer l'autre participant de la conversation
recipient = get_other_participant(conversation_id, sender_id)

# Envoyer une notification au destinataire
send_chat_notification(
    to_user_id=recipient.id,
    notification_type="chat_message",
    title=f"{sender.firstname} {sender.lastname}",
    body=content[:100],  # Limiter à 100 caractères
    data={
        "type": "chat_message",
        "conversationId": str(conversation_id),
        "messageId": str(message_id),
        "senderId": str(sender_id),
        "senderName": f"{sender.firstname} {sender.lastname}"
    }
)
```

---

## 🔧 Fonction d'envoi de notification

### Code Python (Flask/FastAPI)

```python
import firebase_admin
from firebase_admin import credentials, messaging

def send_chat_notification(to_user_id, notification_type, title, body, data):
    """
    Envoie une notification push à un utilisateur via Firebase

    Args:
        to_user_id: ID de l'utilisateur destinataire
        notification_type: Type de notification ("chat_invitation" ou "chat_message")
        title: Titre de la notification
        body: Corps de la notification
        data: Données additionnelles (dict)
    """
    try:
        # Récupérer le FCM token de l'utilisateur depuis la DB
        user = db.users.find_one({"_id": ObjectId(to_user_id)})

        if not user or not user.get('fcm_token'):
            print(f"Utilisateur {to_user_id} n'a pas de FCM token")
            return False

        # Construire le message Firebase
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data,
            token=user['fcm_token'],
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    title=title,
                    body=body,
                    icon='/icon-192x192.png',
                    badge='/icon-192x192.png',
                ),
                fcm_options=messaging.WebpushFCMOptions(
                    link=f"https://mathiascoutant.github.io/premierdelan/chat"
                )
            )
        )

        # Envoyer la notification
        response = messaging.send(message)
        print(f"✅ Notification envoyée avec succès: {response}")
        return True

    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de la notification: {str(e)}")
        return False
```

---

## 📱 Gestion des clics sur notifications (Frontend)

Le frontend gère déjà les clics sur notifications dans `public/firebase-messaging-sw.js` :

```javascript
// Clic sur une notification
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const data = event.notification.data;
  let url = "https://mathiascoutant.github.io/premierdelan/";

  // Rediriger vers la bonne page selon le type
  if (data.type === "chat_invitation" || data.type === "chat_message") {
    url = "https://mathiascoutant.github.io/premierdelan/chat";

    // Si c'est un message, on pourrait ouvrir directement la conversation
    if (data.conversationId) {
      url += `?conversation=${data.conversationId}`;
    }
  }

  event.waitUntil(clients.openWindow(url));
});
```

---

## 🔄 Intégration dans les endpoints

### POST `/api/admin/chat/invitations`

```python
@app.route('/api/admin/chat/invitations', methods=['POST'])
@require_admin
def create_chat_invitation():
    data = request.get_json()
    to_user_id = data.get('to_user_id')
    message = data.get('message', '')

    # Créer l'invitation
    invitation = {
        "from_user_id": ObjectId(current_user_id),
        "to_user_id": ObjectId(to_user_id),
        "message": message,
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    result = db.chat_invitations.insert_one(invitation)

      # 🔔 ENVOYER LA NOTIFICATION
      from_user = db.users.find_one({"_id": ObjectId(current_user_id)})
      send_chat_notification(
          to_user_id=to_user_id,
          notification_type="chat_invitation",
          title="Nouvelle invitation de chat",
          body=f"{from_user['firstname']} {from_user['lastname']} vous invite à discuter",
          data={
              "type": "chat_invitation",
              "invitationId": str(result.inserted_id),
              "fromUserId": str(current_user_id),
              "fromUserName": f"{from_user['firstname']} {from_user['lastname']}"
          }
      )

    return jsonify({"success": True, "data": {"invitation_id": str(result.inserted_id)}})
```

### POST `/api/admin/chat/conversations/:id/messages`

```python
@app.route('/api/admin/chat/conversations/<conversation_id>/messages', methods=['POST'])
@require_admin
def send_chat_message(conversation_id):
    data = request.get_json()
    content = data.get('content')

    # Sauvegarder le message
    message = {
        "conversation_id": ObjectId(conversation_id),
        "sender_id": ObjectId(current_user_id),
        "content": content,
        "created_at": datetime.utcnow(),
        "is_read": False
    }

    result = db.messages.insert_one(message)

    # Récupérer l'autre participant
    conversation = db.conversations.find_one({"_id": ObjectId(conversation_id)})
    recipient_id = None
    for participant in conversation['participants']:
        if str(participant['userId']) != str(current_user_id):
            recipient_id = str(participant['userId'])
            break

    # 🔔 ENVOYER LA NOTIFICATION
    if recipient_id:
        send_chat_notification(
            to_user_id=recipient_id,
            notification_type="chat_message",
            title=f"{current_user.firstname} {current_user.lastname}",
            body=content[:100],  # Limiter à 100 caractères
            data={
                "type": "chat_message",
                "conversationId": str(conversation_id),
                "messageId": str(result.inserted_id),
                "senderId": str(current_user_id),
                "senderName": f"{current_user.firstname} {current_user.lastname}"
            }
        )

    return jsonify({"success": True, "data": {"message_id": str(result.inserted_id)}})
```

---

## ✅ Checklist d'implémentation

- [ ] Créer la fonction `send_chat_notification()`
- [ ] Intégrer l'envoi de notification dans `POST /api/admin/chat/invitations`
- [ ] Intégrer l'envoi de notification dans `POST /api/admin/chat/conversations/:id/messages`
- [ ] Tester les notifications sur mobile PWA
- [ ] Vérifier que les clics sur notifications redirigent vers le chat

---

## 🧪 Test

### Test manuel

1. **Envoyer une invitation** d'un compte admin à un autre
2. **Vérifier** que le destinataire reçoit une notification PWA
3. **Cliquer** sur la notification
4. **Vérifier** que ça ouvre l'app sur `/chat`

### Test envoi de message

1. **Accepter une invitation**
2. **Envoyer un message** dans la conversation
3. **Vérifier** que l'autre admin reçoit une notification
4. **Cliquer** sur la notification
5. **Vérifier** que ça ouvre directement la conversation

---

## 💡 Notes importantes

- **FCM Token** : Les utilisateurs doivent avoir activé les notifications PWA
- **Format snake_case** : Le backend utilise `to_user_id` et non `toUserId`
- **Permissions** : Seuls les admins peuvent envoyer/recevoir des notifications de chat
- **Redirection** : Les notifications redirigent vers `/chat` (et éventuellement vers une conversation spécifique)

---

**Une fois implémenté, les notifications PWA fonctionneront parfaitement !** 🔔📱✨
