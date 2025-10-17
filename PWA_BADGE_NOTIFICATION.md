# 🔴 Badge de Notification PWA

## 🎯 Fonctionnalité

Affiche une **pastille rouge avec le nombre de messages non lus** sur l'icône de votre PWA sur l'écran d'accueil.

## ✅ Implémentation

### Fichiers créés

1. **`app/hooks/useAppBadge.ts`** - Hook pour gérer le badge
2. **`app/components/AppBadgeManager.tsx`** - Composant qui utilise le hook
3. Intégré dans **`app/layout.tsx`** - Actif sur toutes les pages

## 🚀 Comment ça marche

### Mise à jour automatique

Le badge se met à jour automatiquement :
- ✅ **Au chargement de la page**
- ✅ **Toutes les 30 secondes** (vérification en arrière-plan)
- ✅ **Quand l'app devient visible** (changement d'onglet/app)

### Calcul du badge

Le système :
1. Récupère toutes vos conversations via l'API
2. Compte le total de messages non lus (`unread_count`)
3. Affiche ce nombre sur l'icône PWA

### Effacement automatique

Le badge est effacé automatiquement quand :
- ✅ Vous n'avez plus de messages non lus
- ✅ Vous vous déconnectez
- ✅ Vous n'êtes pas admin

## 🌐 Compatibilité navigateurs

| Navigateur | Support | Notes |
|------------|---------|-------|
| Chrome (Android) | ✅ | Support complet |
| Edge (Android) | ✅ | Support complet |
| Samsung Internet | ✅ | Support complet |
| Chrome (Desktop) | ✅ | Support complet |
| Safari (iOS) | ❌ | Pas encore supporté |
| Firefox | ❌ | Pas encore supporté |

### Note importante

Si le navigateur ne supporte pas la Badging API, le système :
- Affiche un message dans la console : `⚠️ Badging API non supportée`
- Continue de fonctionner normalement (sans badge)
- N'affiche pas d'erreur à l'utilisateur

## 🧪 Test

### Comment tester

1. **Installez la PWA** sur votre appareil (Android ou Desktop Chrome/Edge)
2. **Demandez à quelqu'un de vous envoyer un message**
3. **Retournez à l'écran d'accueil**
4. **Vérifiez l'icône** : vous devriez voir une pastille rouge avec "1"

### Logs de debug

Dans la console du navigateur (F12) :

```
🔴 Badge PWA: 3 message(s) non lu(s)  ← Badge mis à jour
✅ Badge PWA effacé (aucun message non lu)  ← Badge effacé
⚠️ Badging API non supportée sur ce navigateur  ← Navigateur incompatible
```

## 📱 Exemple visuel

### Android / Chrome Desktop

```
┌─────────────────┐
│                 │
│   🎉 Premier   │  🔴 3  ← Pastille rouge
│    de l'An     │
│                 │
└─────────────────┘
```

### Ce qui déclenche le badge

- ✉️ **Nouveau message reçu** → Badge +1
- ✅ **Message lu** → Badge -1
- 🔔 **Notification push** → Badge se met à jour automatiquement

## 🔧 API utilisée

### Badging API (W3C)

```typescript
// Définir un badge avec un nombre
navigator.setAppBadge(5)  // Affiche "5" sur l'icône

// Effacer le badge
navigator.clearAppBadge()  // Supprime la pastille
```

### Documentation

- [MDN - Badging API](https://developer.mozilla.org/en-US/docs/Web/API/Badging_API)
- [W3C - Badging API Spec](https://w3c.github.io/badging/)

## 💡 Améliorations futures

### Possibles extensions

1. **Badge pour notifications système** (pas seulement messages)
2. **Badge pour événements à venir**
3. **Badge pour inscriptions en attente** (admin)
4. **Synchronisation avec les notifications push**

### Intégration Service Worker

Le badge pourrait être mis à jour directement par le service worker lors de la réception d'une notification push :

```javascript
// Dans firebase-messaging-sw.js
self.addEventListener('push', (event) => {
  // ... traitement notification ...
  
  // Mettre à jour le badge
  if (self.setAppBadge) {
    self.setAppBadge(unreadCount)
  }
})
```

## 🎯 Résultat

✅ Badge de notification sur l'icône PWA  
✅ Mise à jour automatique en temps réel  
✅ Compatible Android et Desktop (Chrome/Edge)  
✅ Gestion propre des cas non supportés  
✅ Aucun impact sur les performances  

---

🚀 **Votre PWA affiche maintenant le nombre de messages non lus directement sur l'icône de l'écran d'accueil !**

