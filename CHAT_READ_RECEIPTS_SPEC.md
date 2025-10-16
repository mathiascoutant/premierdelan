# 📖 Spécification - Accusés de réception (Read Receipts)

## 🎯 Objectif

Permettre de savoir si un message a été **distribué** (reçu par le serveur) ou **vu** (lu par le destinataire).

---

## 📊 Statuts des messages

### 1. **Envoyé** (Sent)

- Message envoyé au serveur avec succès
- Icône : 1 coche grise ✓

### 2. **Distribué** (Delivered)

- Message reçu par le destinataire (polling ou WebSocket)
- Icône : 2 coches grises ✓✓

### 3. **Vu** (Read)

- Message lu par le destinataire
- Icône : 2 coches dorées/ambrées ✓✓
- Afficher l'heure de lecture

---

## 🔧 Modifications Backend

### 1. Modifier la structure des messages

Ajouter les champs suivants dans la collection `messages` :

```json
{
  "_id": "msg_123",
  "conversation_id": "conv_456",
  "sender_id": "user_789",
  "content": "Salut !",
  "created_at": "2025-10-16T20:00:00Z",
  "delivered_at": "2025-10-16T20:00:05Z", // ← NOUVEAU
  "read_at": "2025-10-16T20:01:30Z", // ← NOUVEAU
  "is_read": false // ← GARDER pour compatibilité
}
```

### 2. Endpoint : Marquer comme distribué

**Route** : `POST /api/admin/chat/messages/:messageId/delivered`

**Headers** :

```
Authorization: Bearer <token>
```

**Body** : (vide)

**Réponse** :

```json
{
  "success": true,
  "message": {
    "_id": "msg_123",
    "delivered_at": "2025-10-16T20:00:05Z"
  }
}
```

**Logique** :

- Vérifier que l'utilisateur connecté est le **destinataire** du message
- Mettre à jour `delivered_at` avec la date actuelle (si pas déjà défini)
- Retourner le message mis à jour

---

### 3. Endpoint : Marquer comme lu

**Route** : `POST /api/admin/chat/messages/:messageId/read`

**Headers** :

```
Authorization: Bearer <token>
```

**Body** : (vide)

**Réponse** :

```json
{
  "success": true,
  "message": {
    "_id": "msg_123",
    "read_at": "2025-10-16T20:01:30Z",
    "is_read": true
  }
}
```

**Logique** :

- Vérifier que l'utilisateur connecté est le **destinataire** du message
- Mettre à jour `read_at` avec la date actuelle
- Mettre à jour `is_read` à `true`
- Retourner le message mis à jour
- **Envoyer une notification WebSocket** à l'expéditeur (optionnel)

---

### 4. Marquer automatiquement comme distribué

**Quand** : Lors du `GET /api/admin/chat/conversations/:id/messages`

**Logique** :

- Quand un utilisateur récupère les messages d'une conversation
- Marquer automatiquement tous les messages **non distribués** dont il est le destinataire comme `delivered`
- Mettre à jour `delivered_at` pour ces messages

**Code Python exemple** :

```python
@app.route('/api/admin/chat/conversations/<conversation_id>/messages', methods=['GET'])
@require_auth
def get_messages(conversation_id, current_user_id):
    messages = db.messages.find({
        "conversation_id": conversation_id
    }).sort("created_at", 1)

    # Marquer comme distribué les messages reçus
    db.messages.update_many(
        {
            "conversation_id": conversation_id,
            "sender_id": {"$ne": current_user_id},  # Pas mes messages
            "delivered_at": None  # Pas encore distribué
        },
        {
            "$set": {
                "delivered_at": datetime.utcnow()
            }
        }
    )

    return jsonify({
        "success": True,
        "messages": list(messages)
    })
```

---

### 5. Marquer automatiquement comme lu

**Option 1** : Endpoint dédié (recommandé)

Le frontend appelle `POST /api/admin/chat/messages/mark-all-read` quand l'utilisateur ouvre une conversation.

```python
@app.route('/api/admin/chat/conversations/<conversation_id>/mark-read', methods=['POST'])
@require_auth
def mark_conversation_read(conversation_id, current_user_id):
    result = db.messages.update_many(
        {
            "conversation_id": conversation_id,
            "sender_id": {"$ne": current_user_id},
            "is_read": False
        },
        {
            "$set": {
                "read_at": datetime.utcnow(),
                "is_read": True
            }
        }
    )

    return jsonify({
        "success": True,
        "marked_read": result.modified_count
    })
```

**Option 2** : Automatique au GET (alternative)

Marquer comme lu automatiquement quand on récupère les messages (moins précis).

---

## 📡 WebSocket (optionnel)

Quand un message est lu, envoyer un événement WebSocket à l'expéditeur :

```json
{
  "type": "message_read",
  "data": {
    "message_id": "msg_123",
    "conversation_id": "conv_456",
    "read_at": "2025-10-16T20:01:30Z",
    "read_by": "user_789"
  }
}
```

Le frontend peut alors mettre à jour l'état du message en temps réel.

---

## 🎨 Affichage Frontend

### Messages envoyés par moi :

1. **Envoyé** (juste après envoi)

   - 1 coche grise ✓
   - Pas de `delivered_at` ni `read_at`

2. **Distribué**

   - 2 coches grises ✓✓
   - `delivered_at` existe mais pas `read_at`

3. **Vu**
   - 2 coches dorées ✓✓
   - `read_at` existe
   - Afficher "Vu à 20:01"

### Messages reçus :

- Pas d'indicateur de lecture (uniquement pour mes messages envoyés)

---

## 🔄 Flux complet

1. **Alice** envoie un message à **Bob**

   - Message créé avec `created_at`
   - Statut : **Envoyé** (1 coche grise)

2. **Bob** ouvre la conversation (GET messages)

   - Backend met à jour `delivered_at` automatiquement
   - Statut pour Alice : **Distribué** (2 coches grises)

3. **Bob** lit le message (conversation ouverte pendant 2 secondes)
   - Frontend appelle `POST /conversations/:id/mark-read`
   - Backend met à jour `read_at` et `is_read: true`
   - Statut pour Alice : **Vu** (2 coches dorées + heure)
   - (Optionnel) WebSocket notifie Alice en temps réel

---

## ✅ Résumé des modifications backend

1. ✅ Ajouter `delivered_at` et `read_at` dans la collection `messages`
2. ✅ Modifier `GET /messages` pour auto-marquer comme distribué
3. ✅ Créer `POST /conversations/:id/mark-read` pour marquer comme lu
4. ✅ (Optionnel) Envoyer événement WebSocket `message_read`
5. ✅ Retourner `delivered_at` et `read_at` dans toutes les réponses de messages

---

## 📝 Exemple de message complet

```json
{
  "_id": "msg_123",
  "conversation_id": "conv_456",
  "sender_id": "user_alice",
  "content": "Salut Bob !",
  "created_at": "2025-10-16T20:00:00Z",
  "delivered_at": "2025-10-16T20:00:05Z",
  "read_at": "2025-10-16T20:01:30Z",
  "is_read": true
}
```

**Affichage pour Alice** :

- ✓✓ (2 coches dorées)
- "Vu à 20:01"

**Affichage pour Bob** :

- Juste le message (pas d'indicateur)

---

## 🚀 Priorité

1. **Phase 1** : Ajouter `delivered_at` et `read_at` dans les messages
2. **Phase 2** : Auto-marquer comme distribué au GET
3. **Phase 3** : Endpoint pour marquer comme lu
4. **Phase 4** : WebSocket pour mise à jour temps réel (optionnel)
