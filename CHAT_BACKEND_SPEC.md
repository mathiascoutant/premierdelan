# 💬 Spécification Backend - Système de Chat Admin

## 📋 Vue d'ensemble

Système de chat en temps réel entre administrateurs avec notifications PWA, invitations, et gestion des conversations.

---

## 🗄️ Structure de la Base de Données

### Collection `conversations`

```javascript
{
  _id: ObjectId,
  participants: [
    {
      userId: ObjectId("admin1_id"),
      role: "admin",
      status: "active" // active, left
    },
    {
      userId: ObjectId("admin2_id"),
      role: "admin",
      status: "active"
    }
  ],
  status: "pending", // pending, accepted, rejected, active
  createdBy: ObjectId("admin1_id"),
  createdAt: "2025-01-15T10:30:00Z",
  updatedAt: "2025-01-15T10:30:00Z",
  lastMessageAt: "2025-01-15T10:30:00Z"
}
```

### Collection `messages`

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId("conversation_id"),
  senderId: ObjectId("admin_id"),
  content: "Salut, comment ça va ?",
  type: "text", // text, image, file
  isRead: false,
  readBy: [
    {
      userId: ObjectId("admin_id"),
      readAt: "2025-01-15T10:30:00Z"
    }
  ],
  createdAt: "2025-01-15T10:30:00Z"
}
```

### Collection `chat_invitations`

```javascript
{
  _id: ObjectId,
  fromUserId: ObjectId("admin1_id"),
  toUserId: ObjectId("admin2_id"),
  status: "pending", // pending, accepted, rejected
  message: "Salut, on peut discuter ?",
  createdAt: "2025-01-15T10:30:00Z",
  respondedAt: "2025-01-15T10:35:00Z"
}
```

---

## 🔗 Endpoints à Créer

### 1. GET `/api/admin/chat/conversations`

**Récupérer les conversations de l'admin connecté (incluant les invitations en attente)**

**Headers requis** :

```
Authorization: Bearer <token>
```

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_123",
      "participant": {
        "id": "admin_456",
        "firstname": "Jean",
        "lastname": "Dupont",
        "email": "jean@email.com"
      },
      "lastMessage": {
        "content": "Salut, comment ça va ?",
        "timestamp": "2025-01-15T10:30:00Z",
        "isRead": false
      },
      "status": "accepted",
      "unreadCount": 2
    },
    {
      "id": "inv_789",
      "participant": {
        "id": "admin_789",
        "firstname": "Marie",
        "lastname": "Martin",
        "email": "marie@email.com"
      },
      "status": "pending",
      "unreadCount": 0
    }
  ]
}
```

**⚠️ Important** : Cet endpoint doit retourner :

- Les **conversations acceptées** (status: "accepted") avec leurs messages
- Les **invitations envoyées en attente** (status: "pending") pour que l'expéditeur puisse voir le statut

### 2. GET `/api/admin/chat/conversations/:id/messages`

**Récupérer les messages d'une conversation**

**Headers requis** :

```
Authorization: Bearer <token>
```

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_123",
      "content": "Salut ! Comment ça va ?",
      "senderId": "admin_456",
      "timestamp": "2025-01-15T10:25:00Z",
      "isRead": true
    }
  ]
}
```

### 3. POST `/api/admin/chat/conversations/:id/messages`

**Envoyer un message dans une conversation**

**Headers requis** :

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body requis** :

```json
{
  "content": "Salut, comment ça va ?"
}
```

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "message": {
    "id": "msg_123",
    "content": "Salut, comment ça va ?",
    "senderId": "admin_123",
    "timestamp": "2025-01-15T10:30:00Z",
    "isRead": false
  }
}
```

### 4. GET `/api/admin/chat/admins/search`

**Rechercher des admins pour créer une conversation**

**Headers requis** :

```
Authorization: Bearer <token>
```

**Query params** :

```
?q=jean&limit=10
```

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "admins": [
    {
      "id": "admin_456",
      "firstname": "Jean",
      "lastname": "Dupont",
      "email": "jean@email.com"
    }
  ]
}
```

### 5. POST `/api/admin/chat/invitations`

**Envoyer une invitation de chat**

**Headers requis** :

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body requis** :

```json
{
  "toUserId": "admin_456",
  "message": "Salut, on peut discuter ?"
}
```

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "invitation": {
    "id": "inv_123",
    "fromUserId": "admin_123",
    "toUserId": "admin_456",
    "status": "pending",
    "message": "Salut, on peut discuter ?",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### 6. PUT `/api/admin/chat/invitations/:id/respond`

**Accepter ou refuser une invitation**

**Headers requis** :

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body requis** :

```json
{
  "action": "accept" // ou "reject"
}
```

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "conversation": {
    "id": "conv_123",
    "participants": [...],
    "status": "accepted"
  }
}
```

**⚠️ Important** : Lors de l'acceptation (`action: "accept"`), le backend doit :

1. Mettre à jour le statut de l'invitation à "accepted"
2. **Créer une nouvelle conversation** dans la collection `conversations` avec les deux participants
3. Retourner l'ID de la conversation créée
4. Envoyer une notification au demandeur que son invitation a été acceptée

### 7. GET `/api/admin/chat/invitations`

**Récupérer les invitations reçues**

**Headers requis** :

```
Authorization: Bearer <token>
```

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "invitations": [
    {
      "id": "inv_123",
      "fromUser": {
        "id": "admin_123",
        "firstname": "Mathias",
        "lastname": "Coutant",
        "email": "mathias@email.com"
      },
      "message": "Salut, on peut discuter ?",
      "status": "pending",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🔔 Système de Notifications

### Notifications Firebase

**Types de notifications** :

1. **Invitation de chat** :

```json
{
  "title": "Nouvelle invitation de chat",
  "body": "Mathias vous a invité à discuter",
  "data": {
    "type": "chat_invitation",
    "invitationId": "inv_123",
    "fromUserId": "admin_123"
  }
}
```

2. **Nouveau message** :

```json
{
  "title": "Nouveau message",
  "body": "Mathias: Salut, comment ça va ?",
  "data": {
    "type": "chat_message",
    "conversationId": "conv_123",
    "senderId": "admin_123"
  }
}
```

### Endpoints de notifications

### 8. POST `/api/admin/chat/notifications/send`

**Envoyer une notification de chat**

**Headers requis** :

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body requis** :

```json
{
  "toUserId": "admin_456",
  "type": "chat_invitation", // ou "chat_message"
  "title": "Nouvelle invitation de chat",
  "body": "Mathias vous a invité à discuter",
  "data": {
    "invitationId": "inv_123",
    "fromUserId": "admin_123"
  }
}
```

---

## 🔄 WebSocket (Optionnel)

### Connexion WebSocket

**URL** : `wss://believable-spontaneity-production.up.railway.app/ws/chat`

**Authentification** :

```javascript
// Connexion avec token
const ws = new WebSocket(
  "wss://believable-spontaneity-production.up.railway.app/ws/chat?token=JWT_TOKEN"
);
```

### Messages WebSocket

**Nouveau message** :

```json
{
  "type": "new_message",
  "data": {
    "conversationId": "conv_123",
    "message": {
      "id": "msg_123",
      "content": "Salut !",
      "senderId": "admin_123",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  }
}
```

**Message lu** :

```json
{
  "type": "message_read",
  "data": {
    "conversationId": "conv_123",
    "messageId": "msg_123",
    "readBy": "admin_456"
  }
}
```

---

## 🧪 Tests

### Test recherche d'admins

```bash
curl -X GET \
  "https://believable-spontaneity-production.up.railway.app/api/admin/chat/admins/search?q=jean" \
  -H "Authorization: Bearer <token>"
```

### Test envoi d'invitation

```bash
curl -X POST \
  https://believable-spontaneity-production.up.railway.app/api/admin/chat/invitations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "toUserId": "admin_456",
    "message": "Salut, on peut discuter ?"
  }'
```

### Test envoi de message

```bash
curl -X POST \
  https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations/conv_123/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Salut, comment ça va ?"
  }'
```

---

## ✅ Checklist d'implémentation

- [ ] Créer les collections `conversations`, `messages`, `chat_invitations`
- [ ] Créer l'endpoint GET `/api/admin/chat/conversations`
- [ ] Créer l'endpoint GET `/api/admin/chat/conversations/:id/messages`
- [ ] Créer l'endpoint POST `/api/admin/chat/conversations/:id/messages`
- [ ] Créer l'endpoint GET `/api/admin/chat/admins/search`
- [ ] Créer l'endpoint POST `/api/admin/chat/invitations`
- [ ] Créer l'endpoint PUT `/api/admin/chat/invitations/:id/respond`
- [ ] Créer l'endpoint GET `/api/admin/chat/invitations`
- [ ] Créer l'endpoint POST `/api/admin/chat/notifications/send`
- [ ] Configurer les notifications Firebase pour le chat
- [ ] Implémenter WebSocket (optionnel)
- [ ] Tester tous les endpoints

---

## 🎯 Notes importantes

- **Admin uniquement** : Tous les endpoints nécessitent un token admin
- **Recherche** : Seuls les admins apparaissent dans les résultats
- **Notifications** : Intégration avec le système Firebase existant
- **Temps réel** : WebSocket pour les messages instantanés
- **Sécurité** : Validation des permissions pour chaque action
- **Performance** : Pagination pour les messages et conversations

---

**Une fois implémenté, le système de chat sera entièrement fonctionnel avec notifications PWA !** 💬📱✨
