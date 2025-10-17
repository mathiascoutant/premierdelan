# ❓ QUESTION CRITIQUE BACKEND - iOS PWA

## 🍎 Problème iOS spécifique

Sur **iOS Safari PWA**, les service workers ne gèrent PAS les clics sur notifications.

C'est **iOS lui-même** qui ouvre l'app à l'URL définie dans la notification.

## ❗ QUESTION POUR LE BACKEND

### Est-ce que vous envoyez ce champ dans les notifications ?

```go
message := &messaging.Message{
    // ... notification ...
    Data: map[string]string{
        "type": "chat_message",
        "conversationId": conversationID,
    },
    Webpush: &messaging.WebpushConfig{
        Notification: &messaging.WebpushNotification{
            Icon:  "/icon-192x192.png",
            Badge: "/icon-192x192.png",
        },
        FCMOptions: &messaging.WebpushFCMOptions{
            // ⚠️ CRUCIAL POUR iOS
            Link: fmt.Sprintf("https://mathiascoutant.github.io/premierdelan/chat?conversation=%s", conversationID),
        },
    },
}
```

### ⚠️ Le champ `FCMOptions.Link` est OBLIGATOIRE pour iOS !

**Sans ce champ** :
- Android : Le service worker gère le clic ✅
- iOS : L'app s'ouvre sur la page d'accueil ❌

**Avec ce champ** :
- Android : Le service worker peut override (ou pas) ✅
- iOS : L'app s'ouvre DIRECTEMENT sur l'URL ✅

## 🔍 Vérification

### 1. Vérifiez votre code d'envoi de notification

**Fichier** : `handlers/chat_handler.go` (ou similaire)

**Cherchez** : `WebpushConfig` ou `Webpush`

**Vérifiez** : Y a-t-il `FCMOptions` avec `Link` ?

### 2. Si le champ manque : AJOUTEZ-LE

```go
func sendChatNotification(recipientFCMToken, senderName, messageContent, conversationID string) error {
    ctx := context.Background()
    
    message := &messaging.Message{
        Token: recipientFCMToken,
        Notification: &messaging.Notification{
            Title: fmt.Sprintf("💬 %s", senderName),
            Body:  messageContent,
        },
        Data: map[string]string{
            "type":           "chat_message",
            "conversationId": conversationID,
            "senderId":       senderID,
        },
        // ✅ ANDROID (optionnel mais recommandé)
        Android: &messaging.AndroidConfig{
            Priority: "high",
            Notification: &messaging.AndroidNotification{
                Icon:        "ic_notification",
                Color:       "#D4AF37",
                Sound:       "default",
                ClickAction: "FLUTTER_NOTIFICATION_CLICK",
            },
        },
        // ⚠️ iOS/WEB (OBLIGATOIRE pour iOS)
        Webpush: &messaging.WebpushConfig{
            Notification: &messaging.WebpushNotification{
                Icon:  "/icon-192x192.png",
                Badge: "/icon-192x192.png",
            },
            FCMOptions: &messaging.WebpushFCMOptions{
                // ⚠️ CETTE LIGNE EST CRITIQUE POUR iOS
                Link: fmt.Sprintf("https://mathiascoutant.github.io/premierdelan/chat?conversation=%s", conversationID),
            },
        },
    }
    
    response, err := fcmClient.Send(ctx, message)
    if err != nil {
        return fmt.Errorf("Erreur envoi FCM: %v", err)
    }
    
    log.Printf("✅ Notification envoyée: %s", response)
    return nil
}
```

## 🎯 Si vous avez déjà `FCMOptions.Link`

Si vous l'avez déjà, vérifiez que l'URL est correcte :

```go
// ❌ MAUVAIS
Link: "https://mathiascoutant.github.io/messages?conversation=123"

// ❌ MAUVAIS
Link: "https://mathiascoutant.github.io/chat?conversation=123"

// ✅ BON
Link: "https://mathiascoutant.github.io/premierdelan/chat?conversation=123"
```

**Important** : L'URL DOIT contenir `/premierdelan/` !

## 📝 Réponse attendue

Merci de répondre :

1. **OUI, on envoie `FCMOptions.Link`** avec l'URL complète → On cherche ailleurs
2. **NON, on n'envoie pas `FCMOptions.Link`** → AJOUTEZ-LE, c'est ça le problème !
3. **OUI, mais l'URL est peut-être incorrecte** → Envoyez le code pour vérification

---

## 💡 Pourquoi c'est crucial ?

Sur iOS, Firebase Messaging utilise **Apple Push Notification Service (APNs)**.

Quand l'utilisateur clique sur la notification :
- APNs ouvre Safari avec l'URL définie dans `fcm_options.link`
- Si ce champ manque ou est vide, APNs ouvre l'URL du `manifest.json` (la page d'accueil)
- Le service worker JavaScript n'intervient JAMAIS

C'est une limitation d'iOS, pas un bug.

---

## 🚀 Solution

**Ajouter `FCMOptions.Link`** dans toutes les notifications de type `chat_message`.

Ensuite, l'ouverture fonctionnera :
- ✅ iOS : Ouvre directement `/chat?conversation=...`
- ✅ Android : Service worker + localStorage (double sécurité)

---

✅ **C'est LA raison pour laquelle ça ne fonctionne pas sur iOS !**

