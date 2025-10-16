# 🔧 Fix - Format des notifications FCM

## ❌ Problème actuel

Les notifications affichent :

```
Premier de l'An                    ← Titre (nom de l'app)
from Premier de l'An               ← Sous-titre indésirable
Mathias vous invite à discuter     ← Message
```

**Le "from Premier de l'An" est en trop !**

---

## ✅ Format désiré

```
Mathias vous invite à discuter     ← Titre (nom + action)
Nouveau message                     ← Corps du message
```

OU

```
Mathias                             ← Titre (nom de la personne)
Salut, ça va ?                      ← Corps (contenu du message)
```

---

## 🔧 Solution Backend

### Problème

Le backend envoie probablement ce format :

```python
# ❌ MAUVAIS FORMAT
message = {
    "notification": {
        "title": "Premier de l'An",           # Nom de l'app
        "body": "Mathias vous invite à discuter"
    },
    "data": {
        "type": "chat_invitation",
        "fromUserName": "Mathias",
        # ...
    },
    "token": user_token
}
```

Ce format fait que FCM ajoute automatiquement "from Premier de l'An" parce que le titre est le nom de l'app.

---

### ✅ Correction 1 : Pour les invitations

```python
# ✅ BON FORMAT - Invitations
message = {
    "notification": {
        "title": f"{from_user_name} vous invite à discuter",  # Nom + action
        "body": "Appuyez pour répondre"                       # Call to action
    },
    "data": {
        "type": "chat_invitation",
        "invitationId": str(invitation_id),
        "fromUserId": str(from_user_id),
        "fromUserName": from_user_name
    },
    "token": user_token
}
```

**Résultat** :

```
Mathias vous invite à discuter
Appuyez pour répondre
```

---

### ✅ Correction 2 : Pour les messages

```python
# ✅ BON FORMAT - Messages
message = {
    "notification": {
        "title": f"{sender_name}",           # Juste le nom
        "body": message_content[:100]        # Contenu du message (max 100 char)
    },
    "data": {
        "type": "chat_message",
        "conversationId": str(conversation_id),
        "messageId": str(message_id),
        "senderId": str(sender_id),
        "senderName": sender_name
    },
    "token": user_token
}
```

**Résultat** :

```
Mathias
Salut, ça va ?
```

---

## 📋 Règles importantes

### 1. **Ne JAMAIS mettre le nom de l'app dans `notification.title`**

- Le système d'exploitation affiche déjà le nom de l'app en haut
- Mettre le nom de l'app crée le "from Premier de l'An"

### 2. **Utiliser des titres personnalisés**

- Pour invitations : `"{Nom} vous invite à discuter"`
- Pour messages : `"{Nom}"` (juste le prénom)
- Pour acceptations : `"{Nom} a accepté votre invitation"`

### 3. **Limiter la longueur**

- `title` : max 65 caractères
- `body` : max 240 caractères (tronquer si nécessaire)

---

## 🎯 Format complet recommandé

### Type 1 : Invitation de chat

```python
{
    "notification": {
        "title": f"{from_user['firstname']} {from_user['lastname']} vous invite à discuter",
        "body": "Appuyez pour répondre"
    },
    "data": {
        "type": "chat_invitation",
        "invitationId": str(invitation_id),
        "fromUserId": str(from_user_id),
        "fromUserName": f"{from_user['firstname']} {from_user['lastname']}"
    },
    "token": recipient_token,
    "android": {
        "priority": "high"
    },
    "apns": {
        "headers": {
            "apns-priority": "10"
        }
    }
}
```

---

### Type 2 : Nouveau message

```python
{
    "notification": {
        "title": f"{sender['firstname']} {sender['lastname']}",
        "body": message_content[:240]  # Tronquer si trop long
    },
    "data": {
        "type": "chat_message",
        "conversationId": str(conversation_id),
        "messageId": str(message_id),
        "senderId": str(sender_id),
        "senderName": f"{sender['firstname']} {sender['lastname']}"
    },
    "token": recipient_token,
    "android": {
        "priority": "high"
    },
    "apns": {
        "headers": {
            "apns-priority": "10"
        }
    }
}
```

---

### Type 3 : Invitation acceptée

```python
{
    "notification": {
        "title": f"{accepter['firstname']} a accepté votre invitation",
        "body": "Commencez à discuter"
    },
    "data": {
        "type": "invitation_accepted",
        "conversationId": str(conversation_id),
        "accepterId": str(accepter_id),
        "accepterName": f"{accepter['firstname']} {accepter['lastname']}"
    },
    "token": inviter_token,
    "android": {
        "priority": "high"
    },
    "apns": {
        "headers": {
            "apns-priority": "10"
        }
    }
}
```

---

## 🧪 Test

Après modification, la notification devrait s'afficher comme :

**Sur Android :**

```
[Icône de l'app] Premier de l'An        ← Affiché par le système
Mathias vous invite à discuter          ← notification.title
Appuyez pour répondre                   ← notification.body
```

**Sur iOS :**

```
Premier de l'An                          ← Affiché par le système
Mathias vous invite à discuter          ← notification.title
Appuyez pour répondre                   ← notification.body
```

**Plus de "from Premier de l'An" !** ✅

---

## 📝 Résumé des modifications

1. ✅ Remplacer `"title": "Premier de l'An"` par `"title": "{Nom} {Action}"`
2. ✅ Utiliser le nom de la personne dans le titre
3. ✅ Mettre le contenu du message dans `body`
4. ✅ Tronquer les longs messages (max 240 caractères)
5. ✅ Ajouter `android.priority` et `apns.headers` pour la priorité

---

## 🚀 Fichiers à modifier

Cherchez dans votre backend les lignes avec :

```python
"title": "Premier de l'An"
```

Et remplacez-les par :

```python
"title": f"{from_user['firstname']} {from_user['lastname']} vous invite à discuter"
```

Ou pour les messages :

```python
"title": f"{sender['firstname']} {sender['lastname']}"
```
