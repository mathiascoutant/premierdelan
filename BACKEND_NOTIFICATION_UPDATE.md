# 🔄 Mise à jour Frontend - Service Worker Simplifié

## 📅 Date : 17 octobre 2025

## ✅ Changement Frontend

On est **revenu à la version simple du service worker** qui fonctionnait avant.

### ❌ Ancienne approche (complexe, ne fonctionnait plus)
```javascript
// Tentait de faire postMessage, matchAll, etc.
// Trop complexe, causait des problèmes de redirection
```

### ✅ Nouvelle approche (simple, fonctionne)
```javascript
self.addEventListener("notificationclick", function (event) {
  const data = event.notification.data;
  let url = "https://mathiascoutant.github.io/premierdelan/";

  if (data.type === "chat_message" && data.conversationId) {
    url = `https://mathiascoutant.github.io/premierdelan/chat?conversation=${data.conversationId}`;
  }
  
  event.waitUntil(clients.openWindow(url));
});
```

## ⚠️ CE QUE LE BACKEND DOIT VÉRIFIER

### 1. Format des notifications (CRITIQUE)

Le backend **DOIT** envoyer les notifications avec ce format exact :

```go
data := map[string]interface{}{
    "type":           "chat_message",
    "conversationId": conversation.ID.Hex(),  // ⚠️ IMPORTANT: camelCase !
    "messageId":      message.ID.Hex(),
    "senderId":       senderID.Hex(),
    "senderName":     sender.Firstname + " " + sender.Lastname,
}
```

### Points critiques :

✅ **`conversationId`** (camelCase) - PAS `conversation_id` (snake_case)  
✅ **`type: "chat_message"`** (avec underscore)  
✅ Tous les IDs doivent être des **strings** (`.Hex()`)

### 2. Structure complète de la notification

```go
message := messaging.Message{
    Notification: &messaging.Notification{
        Title: fmt.Sprintf("💬 %s", senderName),
        Body:  messageContent[:100], // Limiter à 100 caractères
    },
    Data: map[string]string{  // ⚠️ Doit être map[string]string pour Firebase
        "type":           "chat_message",
        "conversationId": conversationID,
        "messageId":      messageID,
        "senderId":       senderID,
        "senderName":     senderName,
    },
    Token: recipientFCMToken,
    Android: &messaging.AndroidConfig{
        Priority: "high",
        Notification: &messaging.AndroidNotification{
            Icon:        "ic_notification",
            Color:       "#D4AF37", // Couleur dorée
            Sound:       "default",
            ClickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
    },
    Webpush: &messaging.WebpushConfig{
        Notification: &messaging.WebpushNotification{
            Icon:  "/icon-192x192.png",
            Badge: "/icon-192x192.png",
        },
        FCMOptions: &messaging.WebpushFCMOptions{
            Link: fmt.Sprintf("https://mathiascoutant.github.io/premierdelan/chat?conversation=%s", conversationID),
        },
    },
}
```

## 🧪 Comment tester que le backend envoie le bon format

### 1. Logger les données envoyées

Dans le code d'envoi de notification :

```go
log.Printf("📤 Notification envoyée")
log.Printf("  Type: %s", data["type"])
log.Printf("  ConversationId: %s", data["conversationId"])
log.Printf("  MessageId: %s", data["messageId"])
log.Printf("  Data complet: %+v", data)
```

### 2. Vérifier la réponse Firebase

```go
response, err := fcm.Send(ctx, &message)
if err != nil {
    log.Printf("❌ Erreur envoi notification: %v", err)
    return err
}
log.Printf("✅ Notification envoyée avec succès: %s", response)
```

## 🔍 Diagnostic si ça ne fonctionne toujours pas

### Scénario 1 : Notification reçue, mais clic n'ouvre pas la conversation

**Cause probable** : Le champ `conversationId` n'est pas présent ou mal nommé

**Vérifier** :
```go
// ❌ MAUVAIS
data["conversation_id"] = id  // snake_case

// ✅ BON
data["conversationId"] = id   // camelCase
```

### Scénario 2 : Notification reçue, mais clic ouvre l'accueil

**Cause probable** : Le champ `type` n'est pas `"chat_message"` ou manque

**Vérifier** :
```go
data["type"] = "chat_message"  // Exactement cette chaîne
```

### Scénario 3 : Erreur lors de l'envoi de la notification

**Cause probable** : Les données contiennent des types non-string

**Solution** : Tous les champs dans `Data` doivent être des `string`

```go
// ❌ MAUVAIS
Data: map[string]interface{}{
    "conversationId": conversation.ID,  // ObjectId, pas string
}

// ✅ BON
Data: map[string]string{
    "conversationId": conversation.ID.Hex(),  // String
}
```

## 📊 Flux complet (pour référence)

```
1. Backend envoie notification
   ↓
   data: { type: "chat_message", conversationId: "68f16e34..." }
   ↓
2. Firebase distribue la notification
   ↓
3. Utilisateur clique sur la notification
   ↓
4. Service Worker détecte le clic
   ↓
5. Lit event.notification.data
   ↓
6. Construit URL: https://...github.io/premierdelan/chat?conversation=68f16e34...
   ↓
7. Ouvre l'URL avec clients.openWindow()
   ↓
8. Page /chat détecte le paramètre ?conversation=...
   ↓
9. Ouvre automatiquement la conversation
   ↓
✅ SUCCÈS
```

## 🚨 Erreurs courantes à éviter

### ❌ Erreur 1 : snake_case au lieu de camelCase
```go
"conversation_id" // ❌ Ne fonctionne PAS
"conversationId"  // ✅ Fonctionne
```

### ❌ Erreur 2 : Type non-string
```go
"conversationId": conversationID  // ❌ Si conversationID est ObjectId
"conversationId": conversationID.Hex()  // ✅ String
```

### ❌ Erreur 3 : Champ manquant
```go
data := map[string]string{
    // "type" manque ❌
    "conversationId": id,
}

data := map[string]string{
    "type": "chat_message",  // ✅ Présent
    "conversationId": id,
}
```

## ✅ Checklist Backend

Avant de tester :

- [ ] Le champ s'appelle bien `conversationId` (camelCase)
- [ ] Le champ `type` vaut exactement `"chat_message"`
- [ ] Tous les IDs sont convertis en string avec `.Hex()`
- [ ] La map `Data` est bien `map[string]string`
- [ ] Les logs montrent les bonnes valeurs
- [ ] La notification s'envoie sans erreur

## 📞 Contact

Si après ces vérifications ça ne fonctionne toujours pas, envoyer :

1. Les **logs d'envoi** de la notification (avec les données complètes)
2. La **réponse Firebase** (succès ou erreur)
3. Une **capture** de ce que l'utilisateur voit en cliquant sur la notif

---

## 🎯 Version Frontend actuelle

- Service Worker : **v2.4.0** (version simple)
- Page Chat : Gère le paramètre `?conversation=...` automatiquement
- Compatible avec : Backend Go v2.2.0+

---

✅ **Le frontend est prêt, il attend juste que le backend envoie le bon format !**

