# 🔔 Backend - Unifier les notifications (1 seul type)

## 🐛 Problème actuel

Le backend envoie **2 types de notifications différentes** :

### Type 1 : Avec URL complète ✅ FONCTIONNE
- Affichage : URL en haut, bouton partager, icône recharger
- Bandeau blanc en haut et bas
- Résultat : **Ouvre directement la conversation** ✅

### Type 2 : Notification classique ❌ NE FONCTIONNE PAS  
- Affichage : Notification simple
- Pas d'URL visible
- Résultat : **Reste sur la liste /chat** ❌

## ✅ Solution

**Envoyer TOUJOURS le Type 1** (avec URL complète dans `FCMOptions.Link`)

## 📝 Code Backend à unifier

### ❌ Ce qui cause le Type 2 (classique)

```go
// Notification SANS FCMOptions.Link ou avec Link = "/chat"
message := &messaging.Message{
    Notification: &messaging.Notification{
        Title: "Nouveau message",
        Body:  content,
    },
    Data: map[string]string{
        "type": "chat_message",
        "conversationId": conversationID,
    },
    Token: fcmToken,
    Webpush: &messaging.WebpushConfig{
        Notification: &messaging.WebpushNotification{
            Icon: "/icon-192x192.png",
        },
        FCMOptions: &messaging.WebpushFCMOptions{
            Link: "https://mathiascoutant.github.io/premierdelan/chat",  // ❌ Sans ?conversation=
        },
    },
}
```

### ✅ Ce qui donne le Type 1 (qui fonctionne)

```go
// Notification AVEC FCMOptions.Link incluant ?conversation=...
message := &messaging.Message{
    Notification: &messaging.Notification{
        Title: fmt.Sprintf("💬 %s", senderName),
        Body:  messageContent,
    },
    Data: map[string]string{
        "type":           "chat_message",
        "conversationId": conversationID,
        "messageId":      messageID,
        "senderId":       senderID,
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
            // ⚠️ CRUCIAL : Inclure ?conversation=... dans l'URL
            Link: fmt.Sprintf("https://mathiascoutant.github.io/premierdelan/chat?conversation=%s", conversationID),
        },
    },
}
```

## 🔍 Comment identifier les 2 types dans votre code

### Cherchez dans votre code :

1. **Recherchez** tous les endroits où vous envoyez des notifications de chat
2. **Vérifiez** s'il y a plusieurs fonctions/méthodes
3. **Identifiez** laquelle construit l'URL avec `?conversation=` et laquelle sans

### Exemples de cas possibles :

**Cas 1 : 2 fonctions différentes**
```go
// Fonction 1 - Utilisée parfois
func sendChatNotification(...) {
    // ... avec Link complet
}

// Fonction 2 - Utilisée ailleurs
func sendSimpleNotification(...) {
    // ... sans Link ou Link sans ?conversation=
}
```

**→ Solution :** Toujours utiliser la Fonction 1

**Cas 2 : Une fonction avec condition**
```go
func sendNotification(...) {
    link := "/chat"
    
    if someCondition {  // ← Identifier cette condition
        link = fmt.Sprintf("/chat?conversation=%s", conversationID)
    }
    
    FCMOptions: &messaging.WebpushFCMOptions{
        Link: baseURL + link,
    },
}
```

**→ Solution :** Toujours inclure `?conversation=...`

**Cas 3 : Platform-specific**
```go
if platform == "ios" {
    // Une façon
} else {
    // Une autre façon
}
```

**→ Solution :** Même logique pour tous les platforms

## 🧪 Test après correction

Après avoir unifié le code :

1. Envoyer une notification de test
2. Vérifier qu'elle affiche **URL en haut + bouton partager** (Type 1)
3. Cliquer dessus
4. ✅ Devrait ouvrir la conversation directement

## 📋 Checklist

- [ ] Identifier tous les endroits où on envoie des notifications chat
- [ ] Vérifier que `FCMOptions.Link` inclut toujours `?conversation=...`
- [ ] Tester qu'on ne reçoit plus que le Type 1
- [ ] Confirmer que ça ouvre toujours la conversation

## 💡 Note

Le Type 1 (avec URL complète) est **TOUJOURS meilleur** car :
- ✅ Fonctionne sur iOS ✅
- ✅ Fonctionne sur Android ✅  
- ✅ Plus rapide (pas de lookup) ✅
- ✅ Plus fiable ✅

Il n'y a **aucune raison** d'envoyer le Type 2.

---

## 🎯 TL;DR

**Question :** Pourquoi 2 types de notifications ?

**Réponse attendue :** Identifier la condition/fonction qui cause le Type 2 et la corriger pour envoyer toujours le Type 1.

**Fix :** `Link: baseURL + "/chat?conversation=" + conversationID` PARTOUT

---

✅ **Une fois corrigé, TOUTES les notifications ouvriront directement la conversation !**

