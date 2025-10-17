# 🎯 Solution iOS - URL Fragment (hash)

## 🐛 Problème

Avec `?conversation=...` (query parameter), iOS ouvre en mode Safari Preview (barres blanches permanentes).

## ✅ Solution

Utiliser **`#conversation=...`** (URL fragment/hash) au lieu de `?`.

## 🔑 Pourquoi ça marche

- `?conversation=...` → iOS considère ça comme une navigation vers une nouvelle URL → Safari Preview
- `#conversation=...` → iOS considère ça comme la même URL → Reste dans la PWA

## 📝 Code Backend

```go
Webpush: &messaging.WebpushConfig{
    FCMOptions: &messaging.WebpushFCMOptions{
        // ✅ Utiliser # au lieu de ?
        Link: fmt.Sprintf("https://mathiascoutant.github.io/premierdelan/chat#conversation=%s", conversationID),
    },
}
```

## 📝 Code Frontend (page chat)

Lire le hash au lieu de searchParams :

```typescript
useEffect(() => {
  // Lire depuis l'URL hash
  const hash = window.location.hash;
  
  if (hash.startsWith('#conversation=')) {
    const conversationId = hash.replace('#conversation=', '');
    debugLog(`🔗 [Chat] Hash conversation: ${conversationId}`);
    
    setPendingConversationId(conversationId);
    
    // Nettoyer le hash
    window.history.replaceState({}, '', '/chat');
  }
}, []);
```

## 🎯 Avantages

✅ PWA s'ouvre proprement (pas de Safari Preview)  
✅ Pas de barres blanches  
✅ Conversation s'ouvre automatiquement  
✅ Simple à implémenter  

## 🚀 Test

1. Backend change `?` en `#`
2. Frontend lit le hash
3. Notification → Clic → PWA propre → Conversation ouverte ✅

---

**C'est LA solution pour iOS !** 🍎

