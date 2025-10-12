# ✅ Validation des Headers CORS + ngrok

## 📋 Toutes les requêtes utilisent maintenant le helper `apiRequest()`

### ✅ Headers automatiquement inclus dans TOUTES les requêtes :

```javascript
{
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",  // ⭐ CRUCIAL pour ngrok
  ...options.headers  // Headers additionnels (Authorization, etc.)
}
```

### ✅ Options CORS automatiques :

```javascript
{
  mode: "cors",
  credentials: "omit"
}
```

## 📍 Localisation des requêtes API

### 1. ✅ Connexion (`app/connexion/page.tsx`)
```typescript
await apiRequest(API_ENDPOINTS.connexion, {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```
➡️ **Headers inclus** : `Content-Type`, `ngrok-skip-browser-warning`

### 2. ✅ Inscription (`app/inscription/page.tsx`)
```typescript
await apiRequest(API_ENDPOINTS.inscription, {
  method: 'POST',
  body: JSON.stringify({ ... })
})
```
➡️ **Headers inclus** : `Content-Type`, `ngrok-skip-browser-warning`

### 3. ✅ Test Notification (`app/components/UserMenu.tsx`)
```typescript
await apiRequest(API_ENDPOINTS.notificationTest, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ user_id })
})
```
➡️ **Headers inclus** : `Content-Type`, `ngrok-skip-browser-warning`, `Authorization`

### 4. ✅ Test Notification Mobile (`app/components/Header.tsx`)
```typescript
await apiRequest(API_ENDPOINTS.notificationTest, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ user_id })
})
```
➡️ **Headers inclus** : `Content-Type`, `ngrok-skip-browser-warning`, `Authorization`

### 5. ✅ Récupération clé VAPID (`app/hooks/useNotifications.ts`)
```typescript
await apiRequest(API_ENDPOINTS.vapidPublicKey, {
  method: 'GET'
})
```
➡️ **Headers inclus** : `Content-Type`, `ngrok-skip-browser-warning`

### 6. ✅ Abonnement notifications (`app/hooks/useNotifications.ts`)
```typescript
await apiRequest(API_ENDPOINTS.notificationSubscribe, {
  method: 'POST',
  body: JSON.stringify({ user_id, subscription })
})
```
➡️ **Headers inclus** : `Content-Type`, `ngrok-skip-browser-warning`

## 🎯 Résultat

**0 appels `fetch()` directs** dans le code applicatif  
**100% des requêtes** passent par `apiRequest()`  
**Tous les headers requis** sont automatiquement ajoutés

## 🧪 Test Manuel

Ouvrez https://mathiascoutant.github.io/premierdelan/ et dans la console :

```javascript
// Tester la connexion
fetch('https://believable-spontaneity-production.up.railway.app/api/connexion', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  mode: 'cors',
  credentials: 'omit',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Succès:', data))
.catch(err => console.error('❌ Erreur:', err))
```

## 📊 Vérification dans les DevTools

1. Ouvrez F12 → Onglet **Network**
2. Essayez de vous connecter
3. Cliquez sur la requête `connexion`
4. Vérifiez dans **Request Headers** :
   - ✅ `content-type: application/json`
   - ✅ `ngrok-skip-browser-warning: true`

## ✅ Si le backend est bien configuré (voir BACKEND_CORS_CONFIG.md)

Les requêtes devraient maintenant fonctionner !

