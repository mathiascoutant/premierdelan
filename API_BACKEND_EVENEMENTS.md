# 📋 API Backend - Gestion des Événements

## 🔐 Authentification

Toutes les requêtes admin nécessitent :
```
Authorization: Bearer <token>
ngrok-skip-browser-warning: true
```

---

## 📅 ENDPOINTS ÉVÉNEMENTS

### 1. GET `/api/admin/evenements`

**Récupérer tous les événements**

**Réponse attendue (200 OK) :**
```json
{
  "evenements": [
    {
      "id": "event-123",
      "titre": "Réveillon 2026",
      "date": "2025-12-31T20:00:00Z",
      "description": "Célébrez la nouvelle année dans un cadre d'exception",
      "capacite": 100,
      "inscrits": 45,
      "photos_count": 247,
      "statut": "ouvert",
      "lieu": "Villa Privée - Côte d'Azur",
      "code_soiree": "PARTY2026",
      "created_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

**Champs obligatoires :**
- `id` (string)
- `titre` (string)
- `date` (ISO 8601 : "2025-12-31T20:00:00Z")
- `description` (string)
- `capacite` (number)
- `inscrits` (number) - Nombre actuel d'inscrits
- `photos_count` (number) - Nombre de photos uploadées
- `statut` (string) : "ouvert", "complet", "annule", "termine"

**Champs optionnels :**
- `lieu` (string)
- `code_soiree` (string)
- `created_at` (ISO 8601)

---

### 2. POST `/api/admin/evenements`

**Créer un nouvel événement**

**Body envoyé par le frontend :**
```json
{
  "titre": "Summer Vibes 2025",
  "date": "2025-07-15T19:00:00",
  "description": "Soirée d'été exclusive avec piscine et DJ",
  "capacite": 80,
  "lieu": "Villa Privée",
  "code_soiree": "SUMMER25",
  "statut": "ouvert"
}
```

**Réponse attendue (201 Created) :**
```json
{
  "success": true,
  "message": "Événement créé avec succès",
  "evenement": {
    "id": "event-456",
    "titre": "Summer Vibes 2025",
    "date": "2025-07-15T19:00:00Z",
    "description": "Soirée d'été exclusive avec piscine et DJ",
    "capacite": 80,
    "inscrits": 0,
    "photos_count": 0,
    "statut": "ouvert",
    "lieu": "Villa Privée",
    "code_soiree": "SUMMER25",
    "created_at": "2025-10-10T08:00:00Z"
  }
}
```

---

### 3. PUT `/api/admin/evenements/{event_id}`

**Modifier un événement existant**

**Body envoyé par le frontend :**
```json
{
  "titre": "Réveillon 2026 - Édition Spéciale",
  "date": "2025-12-31T20:00:00",
  "description": "Célébrez la nouvelle année...",
  "capacite": 120,
  "lieu": "Château Privé",
  "code_soiree": "NYE2026",
  "statut": "ouvert"
}
```

**Réponse attendue (200 OK) :**
```json
{
  "success": true,
  "message": "Événement modifié avec succès",
  "evenement": {
    "id": "event-123",
    "titre": "Réveillon 2026 - Édition Spéciale",
    ...
  }
}
```

---

### 4. DELETE `/api/admin/evenements/{event_id}`

**Supprimer un événement**

**Réponse attendue (200 OK) :**
```json
{
  "success": true,
  "message": "Événement supprimé avec succès"
}
```

**Note :** Le backend doit aussi :
- Supprimer toutes les inscriptions liées
- Supprimer toutes les photos liées
- Notifier les participants (optionnel)

---

## 🎯 FLUX COMPLET FRONTEND

### Créer un événement :
```
1. Admin clique "Créer un événement"
2. Modale s'ouvre avec formulaire
3. Admin remplit :
   - Titre
   - Date/heure
   - Capacité
   - Lieu (optionnel)
   - Code soirée (optionnel)
   - Description
4. Clic "Créer l'événement"
5. POST /api/admin/evenements
6. Liste se recharge automatiquement
7. Nouvel événement apparaît
```

### Modifier un événement :
```
1. Admin clique sur crayon ✏️
2. Modale s'ouvre pré-remplie
3. Admin modifie les champs voulus
4. Peut changer le statut (ouvert/complet/annulé/terminé)
5. Clic "Enregistrer"
6. PUT /api/admin/evenements/{id}
7. Liste se recharge
8. Modifications visibles
```

### Supprimer un événement :
```
1. Admin clique sur poubelle 🗑️
2. Modale de confirmation avec :
   - Nom de l'événement
   - Date
   - Nombre d'inscrits (si > 0, warning rouge)
3. Clic "Supprimer"
4. DELETE /api/admin/evenements/{id}
5. Liste se recharge
6. Événement supprimé
```

---

## 📱 RESPONSIVE

Toutes les modales sont 100% responsive :
- ✅ **Mobile** : Plein écran avec scroll
- ✅ **Tablette** : Modale centrée, formulaire adapté
- ✅ **Desktop** : Modale large (max-w-2xl)

Formulaires :
- ✅ Grid 1 colonne (mobile) → 2 colonnes (desktop)
- ✅ Boutons empilés (mobile) → côte à côte (desktop)
- ✅ Sticky header dans les modales

---

## 🔄 GESTION DES ERREURS

Le backend doit retourner les erreurs ainsi :

**400 Bad Request :**
```json
{
  "message": "Champs manquants ou invalides"
}
```

**401 Unauthorized :**
```json
{
  "message": "Token invalide ou expiré"
}
```

**403 Forbidden :**
```json
{
  "message": "Accès refusé - Admin uniquement"
}
```

**404 Not Found :**
```json
{
  "message": "Événement non trouvé"
}
```

**500 Internal Server Error :**
```json
{
  "message": "Erreur serveur"
}
```

---

## ✅ RÉSUMÉ POUR LE BACKEND

### Endpoints à implémenter :

1. ✅ **GET** `/api/admin/evenements` - Liste tous les événements
2. ✅ **POST** `/api/admin/evenements` - Créer un événement
3. ✅ **PUT** `/api/admin/evenements/{id}` - Modifier un événement
4. ✅ **DELETE** `/api/admin/evenements/{id}` - Supprimer un événement

### Format de date :

**Frontend envoie :**
```
"2025-12-31T20:00:00"  (datetime-local format)
```

**Backend retourne :**
```
"2025-12-31T20:00:00Z"  (ISO 8601 avec timezone)
```

### Validation backend requise :

- Vérifier que l'utilisateur est admin (`admin === 1`)
- Vérifier token d'authentification
- Valider les champs obligatoires
- Empêcher la suppression si des inscrits (ou demander confirmation)
- Générer automatiquement `inscrits: 0` et `photos_count: 0` lors de la création

---

## 🎨 DONNÉES DE TEST

Si vous voulez tester sans backend complet, voici des événements de test :

```json
{
  "evenements": [
    {
      "id": "1",
      "titre": "Réveillon 2026",
      "date": "2025-12-31T20:00:00Z",
      "description": "Célébrez la nouvelle année",
      "capacite": 100,
      "inscrits": 45,
      "photos_count": 247,
      "statut": "ouvert",
      "lieu": "Villa Privée",
      "code_soiree": "NYE2026",
      "created_at": "2025-01-01T10:00:00Z"
    },
    {
      "id": "2",
      "titre": "Summer Vibes",
      "date": "2025-07-15T19:00:00Z",
      "description": "Soirée d'été exclusive",
      "capacite": 80,
      "inscrits": 75,
      "photos_count": 0,
      "statut": "complet",
      "lieu": "Beach Club",
      "code_soiree": "SUMMER25",
      "created_at": "2025-06-01T10:00:00Z"
    }
  ]
}
```

Le frontend est prêt à recevoir ces données ! 🚀

