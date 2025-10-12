# 🚀 Configuration Frontend - Backend Railway

## 📡 URL de l'API

**URL Permanente Railway** :
```
https://believable-spontaneity-production.up.railway.app
```

---

## 🔧 Configuration Frontend

### Dans `app/config/api.ts` :

```typescript
// ✅ Railway - URL permanente
export const API_URL = "https://believable-spontaneity-production.up.railway.app";
```

---

## 📋 Tous les Endpoints Disponibles

### Public (sans authentification)

```javascript
// Health check
GET /api/health

// Événements
GET /api/evenements/public
GET /api/evenements/{event_id}

// Médias (galerie)
GET /api/evenements/{event_id}/medias

// Inscription / Connexion
POST /api/inscription
POST /api/connexion

// Alertes critiques (pour le système de maintenance)
POST /api/alerts/critical
```

### Authentifié (header Authorization requis)

```javascript
// Mes événements
GET /api/mes-evenements

// Inscriptions
POST /api/evenements/{event_id}/inscription
GET /api/evenements/{event_id}/inscription
PUT /api/evenements/{event_id}/inscription
DELETE /api/evenements/{event_id}/desinscription

// Médias
POST /api/evenements/{event_id}/medias
DELETE /api/evenements/{event_id}/medias/{media_id}

// FCM (notifications)
POST /api/fcm/subscribe
GET /api/fcm/vapid-key
```

### Admin (admin=1 requis)

```javascript
// Utilisateurs
GET /api/admin/utilisateurs
PUT /api/admin/utilisateurs/{id}
DELETE /api/admin/utilisateurs/{id}

// Événements
GET /api/admin/evenements
POST /api/admin/evenements
GET /api/admin/evenements/{id}
PUT /api/admin/evenements/{id}
DELETE /api/admin/evenements/{id}

// Inscrits
GET /api/admin/evenements/{id}/inscrits
DELETE /api/admin/evenements/{id}/inscrits/{inscription_id}
DELETE /api/admin/evenements/{id}/inscrits/{inscription_id}/accompagnant/{index}

// Stats et notifications
GET /api/admin/stats
POST /api/admin/notifications/send

// Codes soirée
GET /api/admin/codes-soiree
POST /api/admin/code-soiree/generate
GET /api/admin/code-soiree/current
```

---

## 🔑 Headers Requis

### Pour toutes les requêtes

```javascript
headers: {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true' // Garde-le pour compatibilité
}
```

### Pour routes authentifiées

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Token JWT reçu à la connexion
}
```

---

## 📊 Format des Données

### Inscription

```javascript
POST /api/inscription

Body:
{
  "code_soiree": "PREMIER2026",
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean@email.com",
  "phone": "0612345678",
  "password": "password123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "jean@email.com",
    "firstname": "Jean",
    "lastname": "Dupont",
    "phone": "0612345678",
    "admin": 0
  }
}
```

### Connexion

```javascript
POST /api/connexion

Body:
{
  "email": "jean@email.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "jean@email.com",
    "firstname": "Jean",
    "lastname": "Dupont",
    "admin": 0
  }
}
```

### Créer Événement (Admin)

```javascript
POST /api/admin/evenements
Authorization: Bearer <token>

Body:
{
  "titre": "Soirée 2026",
  "date": "2026-01-20T20:00:00", // Format: YYYY-MM-DDTHH:MM:SS (heure française)
  "description": "Description de l'événement",
  "capacite": 100,
  "lieu": "Paris",
  "code_soiree": "CODE2026",
  "statut": "ouvert",
  "date_ouverture_inscription": "2025-12-01T10:00:00", // Optionnel
  "date_fermeture_inscription": "2026-01-19T23:59:00"  // Optionnel
}

Response: 201 Created
{
  "id": "...",
  "titre": "Soirée 2026",
  "date": "2026-01-20T20:00:00Z",
  ...
}
```

### Inscription à un Événement

```javascript
POST /api/evenements/{event_id}/inscription
Authorization: Bearer <token>

Body:
{
  "user_email": "jean@email.com",
  "nb_personnes": 3,
  "accompagnants": [
    {
      "firstname": "Marie",
      "lastname": "Dupont",
      "is_adult": true
    },
    {
      "firstname": "Pierre",
      "lastname": "Dupont",
      "is_adult": false
    }
  ]
}

Response: 201 Created
{
  "id": "...",
  "event_id": "...",
  "user_email": "jean@email.com",
  "nb_personnes": 3,
  "accompagnants": [...],
  "created_at": "..."
}
```

---

## ⚠️ Important : Timezone

**Toutes les dates sont en HEURE FRANÇAISE (Europe/Paris)** :
- ✅ Frontend envoie : `"2025-12-31T20:00:00"` (SANS le Z)
- ✅ Backend stocke en heure française
- ✅ Backend retourne en heure française avec Z : `"2025-12-31T20:00:00Z"`
- ✅ Frontend retire le Z avant de créer un `Date` object : `date.replace('Z', '')`

**Ne fais AUCUNE conversion UTC** côté frontend !

---

## 🔐 Compte Admin Initial

Pour tester en tant qu'admin :

```
Email : mathiascoutant@icloud.com
Password : test1234
Code soirée : PREMIER2026
```

**Après inscription, passe-toi en admin** :
1. Va sur Railway → MongoDB
2. Collection `users`
3. Trouve ton user et mets `admin: 1`

---

## 📱 Notifications Push (Firebase)

### Statut : ⚠️ En cours de configuration

Le backend a besoin du `project_id` dans les credentials Firebase pour activer FCM.

**À faire** :
1. Télécharge le fichier de credentials complet depuis Firebase Console
2. Assure-toi qu'il contient `"project_id": "premier-de-lan"`
3. Met à jour `FIREBASE_CREDENTIALS_JSON` sur Railway
4. Redéploie

**Endpoints FCM** :
```javascript
// S'abonner aux notifications
POST /api/fcm/subscribe
Body: {
  "user_id": "email@example.com",
  "token": "fcm_token_...",
  "device": "Web"
}

// Obtenir la clé VAPID publique
GET /api/fcm/vapid-key
```

---

## 🎯 Résumé pour le Frontend

### Ce qui a changé :
```diff
- const API_URL = "https://nia-preinstructive-nola.ngrok-free.dev";
+ const API_URL = "https://believable-spontaneity-production.up.railway.app";
```

### Ce qui reste identique :
- ✅ Mêmes endpoints
- ✅ Mêmes headers
- ✅ Même format de données
- ✅ Même système d'authentification JWT
- ✅ Même gestion des erreurs

---

## ✅ Backend Railway : Statut

| Fonctionnalité | Statut |
|----------------|--------|
| API REST | ✅ Opérationnel |
| MongoDB | ✅ Connecté |
| JWT Authentication | ✅ Fonctionnel |
| CORS | ✅ Configuré |
| Tous les endpoints | ✅ Opérationnels |
| Firebase FCM | ⚠️ En configuration |
| URL permanente | ✅ Active 24/7 |

---

## 🔧 Variables d'environnement Railway

Pour référence, le backend utilise :

```env
# MongoDB
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=...

# Firebase (en cours)
FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"premier-de-lan",...}

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# CORS
CORS_ORIGINS=https://mathiascoutant.github.io,http://localhost:3001
```

---

## 🧪 Tester l'API

### Test rapide - Health check

```bash
curl https://believable-spontaneity-production.up.railway.app/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2025-10-12T..."
}
```

### Test connexion

```bash
curl -X POST https://believable-spontaneity-production.up.railway.app/api/connexion \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test depuis le frontend

Ouvre https://mathiascoutant.github.io/premierdelan/ et dans la console :

```javascript
fetch('https://believable-spontaneity-production.up.railway.app/api/health')
  .then(r => r.json())
  .then(data => console.log('✅', data))
  .catch(err => console.error('❌', err));
```

---

## 🚀 Avantages de Railway

- ✅ **URL permanente** : Pas besoin de redémarrer comme ngrok
- ✅ **Gratuit** : 500h/mois (largement suffisant)
- ✅ **HTTPS automatique** : Certificat SSL inclus
- ✅ **Pas de page d'avertissement** : Contrairement à ngrok gratuit
- ✅ **MongoDB intégré** : Plugin officiel
- ✅ **Logs en temps réel** : Pour debugging
- ✅ **Redéploiement automatique** : Sur Git push
- ✅ **Environnement de production** : Stable et fiable

---

## 📞 Support

Si tu as des questions ou des problèmes :
1. Vérifie les logs sur Railway
2. Teste les endpoints avec curl
3. Vérifie la console du navigateur (Network tab)
4. Assure-toi que `API_URL` est bien mis à jour dans `app/config/api.ts`

**Ton backend est maintenant en production 24/7 ! 🎉**

