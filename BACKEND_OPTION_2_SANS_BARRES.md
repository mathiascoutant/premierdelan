# ✅ Option 2 : PWA propre SANS barres blanches

## 🎯 Décision

**On choisit l'Option 2** : URL sans paramètres pour éviter les barres blanches iOS.

## 📝 Ce que le backend doit envoyer

```go
message := &messaging.Message{
    Notification: &messaging.Notification{
        Title: fmt.Sprintf("💬 %s", senderName),
        Body:  messageContent,
    },
    Data: map[string]string{
        "type":           "chat_message",
        "conversationId": conversationID,  // ⚠️ CRUCIAL : Le frontend lit ça !
        "messageId":      messageID,
        "senderId":       senderID,
        "senderName":     senderName,
    },
    Token: fcmToken,
    Android: &messaging.AndroidConfig{
        Priority: "high",
        Notification: &messaging.AndroidNotification{
            Icon:        "ic_notification",
            Color:       "#D4AF37",
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
            // ✅ SANS ?conversation=... pour éviter les barres blanches
            Link: "https://mathiascoutant.github.io/premierdelan/chat",
        },
    },
}
```

## ⚠️ Points CRITIQUES

### 1. Le champ `Data` est OBLIGATOIRE

```go
Data: map[string]string{
    "type":           "chat_message",      // ← Obligatoire
    "conversationId": conversationID,      // ← CRUCIAL pour le frontend
}
```

**Sans `conversationId` dans Data**, le frontend ne saura pas quelle conversation ouvrir.

### 2. `FCMOptions.Link` SANS paramètres

```go
// ✅ BON - PWA propre
Link: "https://mathiascoutant.github.io/premierdelan/chat"

// ❌ MAUVAIS - Barres blanches
Link: "https://mathiascoutant.github.io/premierdelan/chat?conversation=123"
```

## 🔄 Flux complet

```
1. Backend envoie notification
   ↓
   Data: { type: "chat_message", conversationId: "68f16e34..." }
   FCMOptions.Link: ".../chat" (sans paramètres)
   ↓
2. iOS reçoit la notification
   ↓
3. Utilisateur clique
   ↓
4. iOS ouvre la PWA sur /chat (SANS barres blanches ✅)
   ↓
5. Service Worker (onBackgroundMessage):
   - Lit payload.data.conversationId
   - Sauvegarde dans Cache API
   ↓
6. Page /chat se charge:
   - Lit Cache API
   - Trouve conversationId: "68f16e34..."
   - Ouvre automatiquement la conversation
   ↓
✅ SUCCÈS !
```

## 🧪 Comment vérifier que c'est bon

### Logs backend à ajouter

```go
log.Printf("📤 Envoi notification")
log.Printf("  Type: %s", data["type"])
log.Printf("  ConversationId: %s", data["conversationId"])
log.Printf("  FCMOptions.Link: %s", message.Webpush.FCMOptions.Link)
```

**Résultat attendu :**
```
📤 Envoi notification
  Type: chat_message
  ConversationId: 68f16e34484cc37ef8764d28
  FCMOptions.Link: https://mathiascoutant.github.io/premierdelan/chat
```

**⚠️ Si Link contient `?conversation=`** → Barres blanches iOS

## ✅ Checklist

- [ ] `Data` contient `type: "chat_message"`
- [ ] `Data` contient `conversationId: "..."` (string)
- [ ] `FCMOptions.Link` = `.../chat` (SANS ?conversation=)
- [ ] Logger les données pour vérifier
- [ ] Tester l'envoi

## 📱 Résultat après déploiement

✅ **iOS ouvre la PWA proprement** (pas de barres blanches)  
✅ **Le frontend lit `conversationId` depuis le cache**  
✅ **La conversation s'ouvre automatiquement**  

---

## 🎯 TL;DR Backend

**Envoyer :**
```go
Data: map[string]string{"conversationId": conversationID}
Link: ".../chat"  // Sans ?conversation=
```

**Le frontend s'occupe du reste via Cache API !**

---

✅ **Version finale recommandée - v2.4.0**

