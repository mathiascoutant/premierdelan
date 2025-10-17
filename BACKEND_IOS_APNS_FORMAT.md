# 🍎 Solution iOS - Format APNs correct

## 🐛 Problème actuel

iOS ouvre en mode "Safari Preview" (avec logo Safari en bas) au lieu d'ouvrir la PWA proprement.

## ✅ Solution

Utiliser le bon format APNs pour iOS.

## 📝 Code Backend

```go
message := &messaging.Message{
    Token: fcmToken,
    Notification: &messaging.Notification{
        Title: fmt.Sprintf("💬 %s", senderName),
        Body:  messageContent,
    },
    Data: map[string]string{
        "type":           "chat_message",
        "conversationId": conversationID,
        "messageId":      messageID,
        "senderId":       senderID,
        "senderName":     senderName,
    },
    Android: &messaging.AndroidConfig{
        Priority: "high",
        Notification: &messaging.AndroidNotification{
            Icon:        "ic_notification",
            Color:       "#D4AF37",
            Sound:       "default",
            ClickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
    },
    APNS: &messaging.APNSConfig{
        Payload: &messaging.APNSPayload{
            Aps: &messaging.Aps{
                Alert: &messaging.ApsAlert{
                    Title: fmt.Sprintf("💬 %s", senderName),
                    Body:  messageContent,
                },
                Sound: "default",
                Badge: nil,
                MutableContent: true,
                Category: "CHAT_MESSAGE",
            },
            CustomData: map[string]interface{}{
                "type":           "chat_message",
                "conversationId": conversationID,
            },
        },
        Headers: map[string]string{
            "apns-priority": "10",
            "apns-push-type": "alert",
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

## 🔑 Points clés

1. **`APNS.Payload.CustomData`** contient `conversationId`
2. **`MutableContent: true`** permet de gérer la notification
3. **`Webpush.FCMOptions.Link`** avec `?conversation=...` pour fallback web

## 📱 Alternative Simple (RECOMMANDÉE)

Si le format APNs est compliqué, utilisez juste :

```go
Link: "https://mathiascoutant.github.io/premierdelan/chat"  // Sans paramètres
```

Et le frontend lit `conversationId` depuis `Data` via le cache.

**Mais pour que ça marche, il faut que le service worker s'exécute !**

---

## 🎯 Décision à prendre

**Option A** : Accepter les barres blanches 1-2 secondes
- Backend envoie `Link: .../chat?conversation=...`
- Fonctionne à 100%
- Barres blanches temporaires

**Option B** : PWA propre mais nécessite service worker
- Backend envoie `Link: .../chat` (sans paramètres)
- Nécessite que le service worker fonctionne
- Ne fonctionne peut-être pas sur iOS

**Je recommande l'Option A** (accepter les barres 1-2s) car c'est la SEULE qui fonctionne vraiment sur iOS.

---

✅ **Le frontend est prêt pour les 2 options. À vous de choisir !**

