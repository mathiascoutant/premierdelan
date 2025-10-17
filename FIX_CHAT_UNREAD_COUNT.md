# 🐛 Fix: unread_count ne se met pas à jour après mark-read

## Problème

Quand un utilisateur ouvre une conversation et que le frontend appelle `POST /api/admin/chat/conversations/:id/mark-read`, le backend **ne met pas à jour le `unread_count`** dans la liste des conversations.

Résultat : les messages restent affichés comme "non lus" même après avoir été lus.

## Diagnostic

1. Frontend ouvre une conversation
2. Frontend appelle `POST /api/admin/chat/conversations/:conversation_id/mark-read`
3. Backend marque les messages comme lus (`is_read = true`, `read_at = timestamp`)
4. ❌ **MAIS** le `unread_count` n'est pas recalculé
5. Quand le frontend appelle `GET /api/admin/chat/conversations`, le `unread_count` est toujours > 0

## Solution à implémenter dans le backend

### Endpoint concerné : `POST /api/admin/chat/conversations/:id/mark-read`

**Ce qui devrait se passer** :

```python
@app.route('/api/admin/chat/conversations/<conversation_id>/mark-read', methods=['POST'])
@require_auth
def mark_conversation_read(conversation_id, current_user_id):
    # 1. Marquer tous les messages non lus comme lus
    result = db.messages.update_many(
        {
            "conversation_id": ObjectId(conversation_id),
            "sender_id": {"$ne": ObjectId(current_user_id)},  # Pas mes propres messages
            "is_read": False  # Seulement les non lus
        },
        {
            "$set": {
                "read_at": datetime.utcnow(),
                "is_read": True
            }
        }
    )
    
    # 2. ✅ IMPORTANT : Mettre à jour last_message_at de la conversation
    #    pour que le unread_count soit recalculé lors du prochain GET
    db.conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$set": {"last_message_at": datetime.utcnow()}}
    )
    
    return jsonify({
        "success": True,
        "marked_read": result.modified_count,
        "message": f"{result.modified_count} messages marqués comme lus"
    })
```

### Alternative : Recalculer unread_count à chaque GET

Dans `GET /api/admin/chat/conversations`, au lieu de stocker `unread_count`, **le calculer dynamiquement** :

```python
@app.route('/api/admin/chat/conversations', methods=['GET'])
@require_auth
def get_conversations(current_user_id):
    conversations = []
    
    for conv in db.conversations.find({"participants.userId": ObjectId(current_user_id)}):
        # Calculer le unread_count en temps réel
        unread_count = db.messages.count_documents({
            "conversation_id": conv["_id"],
            "sender_id": {"$ne": ObjectId(current_user_id)},
            "is_read": False
        })
        
        # Récupérer le dernier message
        last_message = db.messages.find_one(
            {"conversation_id": conv["_id"]},
            sort=[("created_at", -1)]
        )
        
        # Identifier l'autre participant
        other_participant = next(
            (p for p in conv["participants"] if str(p["userId"]) != str(current_user_id)),
            None
        )
        
        if other_participant:
            participant_data = db.users.find_one({"_id": other_participant["userId"]})
            
            conversations.append({
                "id": str(conv["_id"]),
                "participant": {
                    "id": str(participant_data["_id"]),
                    "firstname": participant_data["firstname"],
                    "lastname": participant_data["lastname"],
                    "email": participant_data["email"]
                },
                "last_message": {
                    "content": last_message["content"],
                    "timestamp": last_message["created_at"],
                    "is_read": last_message.get("is_read", False)
                } if last_message else None,
                "status": conv.get("status", "accepted"),
                "unread_count": unread_count  # ✅ Calculé en temps réel
            })
    
    return jsonify({
        "success": True,
        "conversations": conversations
    })
```

## Test

1. Avoir une conversation avec des messages non lus (`unread_count > 0`)
2. Ouvrir la conversation dans le frontend
3. Le frontend appelle `POST /conversations/:id/mark-read`
4. Retourner à la liste des conversations
5. Le frontend appelle `GET /conversations`
6. ✅ Le `unread_count` doit être **0**

## Logs frontend - Résultat actuel

Le frontend affiche ces logs dans la console :

```
📖 Marquage conversation comme lue: 68f16e34484cc37ef8764d28
✅ Réponse backend mark-read: {success: true, data: {marked_read: 0}}  ⚠️ PROBLÈME ICI !
📊 UnreadCounts après rechargement: [{id: "68f16e34...", participant: "Mathias COUTANT", unreadCount: 2}]
```

### 🐛 Problème identifié

**`marked_read: 0`** signifie que le backend **ne trouve AUCUN message à marquer comme lu** !

Pourtant, le `unreadCount: 2` indique qu'il y a bien 2 messages non lus dans cette conversation.

### Causes possibles

1. **Problème de filtre dans la requête MongoDB**
   - Le `conversation_id` n'est peut-être pas converti en ObjectId
   - Le `sender_id` dans le filtre ne correspond pas
   - Les messages sont peut-être déjà marqués `is_read: true`

2. **Problème de vérification de l'utilisateur**
   - Le backend vérifie peut-être `sender_id == current_user_id` au lieu de `sender_id != current_user_id`
   - On veut marquer comme lus les messages **reçus**, pas les messages envoyés

3. **Champs incorrects**
   - Le champ `is_read` pourrait ne pas exister ou avoir un autre nom
   - Le champ `conversation_id` pourrait être `conversationId` (camelCase)

## Debug Backend - Requêtes à tester

Pour diagnostiquer, exécutez ces requêtes MongoDB dans le backend :

### 1. Lister tous les messages de la conversation

```javascript
db.messages.find({
  conversation_id: ObjectId("68f16e34484cc37ef8764d28")
}).pretty()
```

**Vérifier** :
- Y a-t-il des messages ?
- Quel est le `sender_id` de chaque message ?
- Quelle est la valeur de `is_read` ?

### 2. Compter les messages non lus (vue du destinataire)

```javascript
// Remplacer YOUR_USER_ID par l'ID de l'utilisateur connecté
db.messages.countDocuments({
  conversation_id: ObjectId("68f16e34484cc37ef8764d28"),
  sender_id: {$ne: ObjectId("YOUR_USER_ID")},  // Messages reçus
  is_read: false
})
```

**Résultat attendu** : 2 (correspond au `unreadCount`)

### 3. Tester la requête update_many

```javascript
// Tester ce que la requête mark-read DEVRAIT faire
db.messages.find({
  conversation_id: ObjectId("68f16e34484cc37ef8764d28"),
  sender_id: {$ne: ObjectId("YOUR_USER_ID")},
  is_read: false
})
```

**Si cette requête retourne 0 documents** → Le problème est dans le filtre !

### Solutions selon le résultat

**Si le filtre ne trouve rien** :
- ✅ Vérifier que `conversation_id` est bien un ObjectId
- ✅ Vérifier que `sender_id` est bien un ObjectId
- ✅ Logger le `current_user_id` pour s'assurer qu'il correspond
- ✅ Vérifier le nom exact du champ (`is_read` vs `isRead`)

**Si le filtre trouve des documents mais marked_read = 0** :
- ✅ Vérifier les permissions (l'utilisateur a-t-il le droit d'update ?)
- ✅ Logger les erreurs MongoDB

## Priorité

🔴 **CRITIQUE** - Bloque l'UX du chat, les utilisateurs ne savent pas quels messages sont lus ou non.

## Solution recommandée

**Option 1 (Rapide)** : Calculer `unread_count` dynamiquement dans `GET /conversations` (pas de modification de `mark-read`)

**Option 2 (Optimale)** : Recalculer `unread_count` après chaque `mark-read` ET au GET (double sécurité)

---

✅ Une fois corrigé, le compteur de messages non lus se mettra automatiquement à jour dans le frontend !

