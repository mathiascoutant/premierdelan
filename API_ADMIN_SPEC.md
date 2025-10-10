# 📋 API Endpoints pour l'Espace Admin

## 🔐 Authentification

Toutes les requêtes admin nécessitent le header :

```
Authorization: Bearer <token>
```

---

## 👥 Gestion des Utilisateurs

### 1. GET `/api/admin/utilisateurs`

**Récupérer la liste de tous les utilisateurs**

**Headers :**

```json
{
  "Authorization": "Bearer <token>",
  "ngrok-skip-browser-warning": "true"
}
```

**Réponse attendue (200 OK) :**

```json
{
  "utilisateurs": [
    {
      "id": "user-123",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean@email.com",
      "telephone": "0612345678",
      "admin": 0,
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": "user-456",
      "prenom": "Marie",
      "nom": "Martin",
      "email": "marie@email.com",
      "telephone": "0623456789",
      "admin": 1,
      "created_at": "2025-01-10T14:20:00Z"
    }
  ]
}
```

### 2. PUT `/api/admin/utilisateurs/{user_id}`

**Modifier un utilisateur**

**Body :**

```json
{
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean@newemail.com",
  "telephone": "0612345678",
  "admin": 1
}
```

**Réponse (200 OK) :**

```json
{
  "success": true,
  "message": "Utilisateur modifié avec succès",
  "utilisateur": { ... }
}
```

### 3. DELETE `/api/admin/utilisateurs/{user_id}`

**Supprimer un utilisateur**

**Réponse (200 OK) :**

```json
{
  "success": true,
  "message": "Utilisateur supprimé"
}
```

---

## 📅 Gestion des Événements

### 4. GET `/api/admin/evenements`

**Récupérer la liste de tous les événements**

**Headers :**

```json
{
  "Authorization": "Bearer <token>",
  "ngrok-skip-browser-warning": "true"
}
```

**Réponse attendue (200 OK) :**

```json
{
  "evenements": [
    {
      "id": "event-123",
      "titre": "Réveillon 2026",
      "date": "2025-12-31T20:00:00Z",
      "description": "Célébrez la nouvelle année...",
      "capacite": 100,
      "inscrits": 45,
      "photos_count": 247,
      "statut": "ouvert",
      "code_soiree": "PARTY2026",
      "created_at": "2025-01-01T10:00:00Z"
    },
    {
      "id": "event-456",
      "titre": "Summer Vibes",
      "date": "2025-07-15T19:00:00Z",
      "description": "Soirée d'été exclusive...",
      "capacite": 80,
      "inscrits": 75,
      "photos_count": 0,
      "statut": "complet",
      "code_soiree": "SUMMER2025",
      "created_at": "2025-06-01T10:00:00Z"
    }
  ]
}
```

### 5. POST `/api/admin/evenements`

**Créer un nouvel événement**

**Body :**

```json
{
  "titre": "Nouvel An 2026",
  "date": "2025-12-31T20:00:00Z",
  "description": "Soirée exceptionnelle...",
  "capacite": 100,
  "code_soiree": "NYE2026"
}
```

**Réponse (201 Created) :**

```json
{
  "success": true,
  "message": "Événement créé avec succès",
  "evenement": {
    "id": "event-789",
    "titre": "Nouvel An 2026",
    ...
  }
}
```

### 6. PUT `/api/admin/evenements/{event_id}`

**Modifier un événement**

**Body :**

```json
{
  "titre": "Réveillon 2026 - Édition Spéciale",
  "date": "2025-12-31T20:00:00Z",
  "description": "...",
  "capacite": 120,
  "statut": "ouvert"
}
```

**Réponse (200 OK) :**

```json
{
  "success": true,
  "message": "Événement modifié",
  "evenement": { ... }
}
```

### 7. DELETE `/api/admin/evenements/{event_id}`

**Supprimer un événement**

**Réponse (200 OK) :**

```json
{
  "success": true,
  "message": "Événement supprimé"
}
```

---

## 📊 Statistiques Admin

### 8. GET `/api/admin/stats`

**Statistiques globales de la plateforme**

**Réponse (200 OK) :**

```json
{
  "total_utilisateurs": 156,
  "total_admins": 3,
  "total_evenements": 12,
  "evenements_actifs": 5,
  "total_inscrits": 450,
  "total_photos": 1247
}
```

---

## 🔔 Notifications Admin

### 9. POST `/api/admin/notifications/send`

**Envoyer une notification à un/plusieurs utilisateurs**

**Body :**

```json
{
  "user_ids": ["user@email.com"], // ou ["all"] pour tous
  "title": "Nouvel événement !",
  "message": "Un nouveau événement vient d'être créé",
  "data": {
    "type": "new_event",
    "event_id": "event-123"
  }
}
```

**Réponse (200 OK) :**

```json
{
  "success": true,
  "message": "Notification envoyée à 45 utilisateurs"
}
```

---

## 🔑 Codes Soirée

### 10. POST `/api/admin/code-soiree/generate`

**Générer un nouveau code soirée**

**Réponse (200 OK) :**

```json
{
  "code": "PARTY2026XYZ",
  "created_at": "2025-10-10T12:00:00Z"
}
```

### 11. GET `/api/admin/code-soiree/current`

**Récupérer le code soirée actuel**

**Réponse (200 OK) :**

```json
{
  "code": "PARTY2026",
  "created_at": "2025-01-01T10:00:00Z",
  "utilisations": 45
}
```

---

## 📸 Galeries Photos

### 12. GET `/api/admin/evenements/{event_id}/photos`

**Récupérer toutes les photos d'un événement**

**Réponse (200 OK) :**

```json
{
  "photos": [
    {
      "id": "photo-123",
      "url": "https://...",
      "user_id": "user-123",
      "uploaded_at": "2025-12-31T23:00:00Z"
    }
  ]
}
```

### 13. DELETE `/api/admin/photos/{photo_id}`

**Supprimer une photo**

**Réponse (200 OK) :**

```json
{
  "success": true,
  "message": "Photo supprimée"
}
```

---

## 🚫 Gestion des Erreurs

Toutes les erreurs doivent retourner :

**401 Unauthorized** (pas de token ou token invalide) :

```json
{
  "message": "Non autorisé"
}
```

**403 Forbidden** (user n'est pas admin) :

```json
{
  "message": "Accès refusé - Admin uniquement"
}
```

**404 Not Found** :

```json
{
  "message": "Ressource non trouvée"
}
```

**500 Internal Server Error** :

```json
{
  "message": "Erreur serveur"
}
```

---

## 🔄 Résumé des Endpoints Requis

### Utilisateurs

- ✅ GET `/api/admin/utilisateurs` - Liste
- 🔜 PUT `/api/admin/utilisateurs/{id}` - Modifier
- 🔜 DELETE `/api/admin/utilisateurs/{id}` - Supprimer

### Événements

- ✅ GET `/api/admin/evenements` - Liste
- 🔜 POST `/api/admin/evenements` - Créer
- 🔜 PUT `/api/admin/evenements/{id}` - Modifier
- 🔜 DELETE `/api/admin/evenements/{id}` - Supprimer

### Notifications

- ✅ POST `/api/fcm/send` - Envoyer notification

### Autres

- 🔜 GET `/api/admin/stats` - Statistiques
- 🔜 POST `/api/admin/code-soiree/generate` - Générer code
- 🔜 GET `/api/admin/code-soiree/current` - Code actuel

---

## 💡 Note

Les endpoints marqués ✅ sont utilisés dès maintenant.  
Les endpoints marqués 🔜 seront utilisés quand vous implémenterez les fonctions de modification/suppression dans l'interface.

Pour l'instant, implémentez au minimum :

1. **GET `/api/admin/utilisateurs`**
2. **GET `/api/admin/evenements`**

Le reste peut être ajouté progressivement ! 🚀
