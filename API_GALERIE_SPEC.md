# 📸 API Backend - Gestion de la Galerie (Photos & Vidéos)

Cette documentation spécifie les endpoints nécessaires pour gérer les médias (photos/vidéos) des événements.

---

## 🎯 ARCHITECTURE : Frontend (Firebase Storage) + Backend (Base de données)

### **Stockage des fichiers** : Firebase Storage
- Le frontend upload directement les fichiers vers Firebase Storage
- Firebase retourne une URL publique du fichier uploadé
- Pas besoin de gérer l'upload côté backend

### **Base de données** : Backend MongoDB/PostgreSQL
- Le backend stocke uniquement les **métadonnées** (URL, user, date, etc.)
- Le backend ne gère PAS les fichiers eux-mêmes

---

## 🔐 Authentification

Les endpoints d'upload et de suppression nécessitent un header d'authentification :

```
Authorization: Bearer {auth_token}
```

La consultation de la galerie est publique (pas d'authentification requise).

---

## 1. RÉCUPÉRER LES MÉDIAS D'UN ÉVÉNEMENT

### **GET** `/api/evenements/{event_id}/medias`

Récupère la liste de tous les médias (photos + vidéos) d'un événement.

#### **Headers requis**

Aucun (endpoint public, accessible à tous)

#### **Réponse en cas de succès (200 OK)**

```json
{
  "event_id": "event-456",
  "total_medias": 324,
  "total_images": 247,
  "total_videos": 77,
  "medias": [
    {
      "id": "media-123",
      "event_id": "event-456",
      "user_email": "mathias@example.com",
      "user_name": "Mathias Coutant",
      "type": "image",
      "url": "https://firebasestorage.googleapis.com/v0/b/premierdelan.appspot.com/o/events%2Fevent-456%2Fmedia%2Fmathias%40example.com%2F1696234567890_photo.jpg?alt=media&token=...",
      "storage_path": "events/event-456/media/mathias@example.com/1696234567890_photo.jpg",
      "filename": "photo.jpg",
      "size": 2456789,
      "uploaded_at": "2025-10-10T18:30:00Z"
    },
    {
      "id": "media-124",
      "event_id": "event-456",
      "user_email": "sophie@example.com",
      "user_name": "Sophie Martin",
      "type": "video",
      "url": "https://firebasestorage.googleapis.com/.../video.mp4?alt=media&token=...",
      "storage_path": "events/event-456/media/sophie@example.com/1696234600000_video.mp4",
      "filename": "video.mp4",
      "size": 15678900,
      "uploaded_at": "2025-10-10T19:00:00Z"
    }
  ]
}
```

#### **Réponse si aucun média (200 OK)**

```json
{
  "event_id": "event-456",
  "total_medias": 0,
  "total_images": 0,
  "total_videos": 0,
  "medias": []
}
```

---

## 2. AJOUTER UN MÉDIA (APRÈS UPLOAD FIREBASE)

### **POST** `/api/evenements/{event_id}/medias`

Enregistre les métadonnées d'un média APRÈS que le frontend l'ait uploadé sur Firebase Storage.

#### **Headers requis**

```json
{
  "Authorization": "Bearer {auth_token}",
  "Content-Type": "application/json"
}
```

#### **Corps de la requête**

```json
{
  "user_email": "mathias@example.com",
  "type": "image",
  "url": "https://firebasestorage.googleapis.com/v0/b/premierdelan.appspot.com/o/events%2Fevent-456%2Fmedia%2Fmathias%40example.com%2F1696234567890_photo.jpg?alt=media&token=abc123",
  "storage_path": "events/event-456/media/mathias@example.com/1696234567890_photo.jpg",
  "filename": "photo.jpg",
  "size": 2456789
}
```

#### **Explications des champs**

- `user_email` (string, requis) : Email de l'utilisateur qui a uploadé
- `type` (string, requis) : Type de média - `"image"` ou `"video"`
- `url` (string, requis) : URL publique Firebase du fichier
- `storage_path` (string, requis) : Chemin Firebase pour suppression ultérieure
- `filename` (string, requis) : Nom original du fichier
- `size` (number, requis) : Taille du fichier en octets

#### **Validations côté backend**

- ✅ Vérifier que l'événement existe
- ✅ Vérifier que l'utilisateur est authentifié
- ✅ Vérifier que `type` est soit `"image"` soit `"video"`
- ✅ Vérifier que l'URL Firebase est valide (commence par `https://firebasestorage.googleapis.com`)

#### **Réponse en cas de succès (201 Created)**

```json
{
  "message": "Média ajouté avec succès",
  "media": {
    "id": "media-125",
    "event_id": "event-456",
    "user_email": "mathias@example.com",
    "user_name": "Mathias Coutant",
    "type": "image",
    "url": "https://firebasestorage.googleapis.com/.../photo.jpg?alt=media&token=...",
    "storage_path": "events/event-456/media/mathias@example.com/1696234567890_photo.jpg",
    "filename": "photo.jpg",
    "size": 2456789,
    "uploaded_at": "2025-10-10T18:30:00Z"
  }
}
```

#### **Actions supplémentaires côté backend**

Après l'ajout d'un média, **mettre à jour le compteur `photos_count`** dans la table `evenements` :

```sql
-- Recalculer le nombre total de médias
UPDATE evenements 
SET photos_count = (
  SELECT COUNT(*) 
  FROM medias 
  WHERE event_id = {event_id}
)
WHERE id = {event_id};
```

#### **Réponses d'erreur**

```json
// 404 Not Found - Événement inexistant
{
  "error": "Événement non trouvé"
}

// 401 Unauthorized - Token invalide
{
  "error": "Authentification requise"
}

// 400 Bad Request - Type invalide
{
  "error": "Type de média invalide. Utilisez 'image' ou 'video'."
}
```

---

## 3. SUPPRIMER UN MÉDIA

### **DELETE** `/api/evenements/{event_id}/medias/{media_id}`

Supprime les métadonnées d'un média de la base de données.

⚠️ **Note** : Le frontend supprime le fichier de Firebase Storage **AVANT** d'appeler cet endpoint.

#### **Headers requis**

```json
{
  "Authorization": "Bearer {auth_token}"
}
```

#### **Validations côté backend**

- ✅ Vérifier que le média existe
- ✅ Vérifier que l'utilisateur authentifié est le propriétaire du média
  - `media.user_email === authenticated_user.email`
- ✅ Si pas propriétaire → **403 Forbidden**

#### **Réponse en cas de succès (200 OK)**

```json
{
  "message": "Média supprimé avec succès",
  "media_id": "media-125"
}
```

#### **Actions supplémentaires côté backend**

Après la suppression, **mettre à jour le compteur `photos_count`** :

```sql
-- Recalculer le nombre total de médias
UPDATE evenements 
SET photos_count = (
  SELECT COUNT(*) 
  FROM medias 
  WHERE event_id = {event_id}
)
WHERE id = {event_id};
```

#### **Réponses d'erreur**

```json
// 404 Not Found - Média inexistant
{
  "error": "Média non trouvé"
}

// 403 Forbidden - Pas le propriétaire
{
  "error": "Vous ne pouvez supprimer que vos propres médias"
}

// 401 Unauthorized - Token invalide
{
  "error": "Authentification requise"
}
```

---

## 4. RÉCUPÉRER UN ÉVÉNEMENT (AVEC COMPTEUR PHOTOS)

### **GET** `/api/evenements/{event_id}`

Récupère les détails d'un événement (déjà documenté dans `API_BACKEND_EVENEMENTS.md`).

**S'assurer que la réponse inclut bien** :

```json
{
  "evenement": {
    "id": "event-456",
    "titre": "Réveillon 2026",
    "date": "2025-12-31T20:00:00Z",
    "description": "...",
    "capacite": 100,
    "inscrits": 45,
    "photos_count": 324,  // ← COMPTEUR DE MÉDIAS
    "statut": "ouvert",
    "lieu": "Villa Privée"
  }
}
```

---

## 📊 BASE DE DONNÉES - Structure suggérée

### **Table: `medias`**

```sql
CREATE TABLE medias (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  type ENUM('image', 'video') NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  filename VARCHAR(500) NOT NULL,
  size BIGINT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Index et contraintes
  INDEX idx_event_id (event_id),
  INDEX idx_user_email (user_email),
  INDEX idx_type (type),
  INDEX idx_uploaded_at (uploaded_at),
  FOREIGN KEY (event_id) REFERENCES evenements(id) ON DELETE CASCADE,
  FOREIGN KEY (user_email) REFERENCES utilisateurs(email) ON DELETE CASCADE
);
```

### **Exemple de données**

```json
{
  "id": "media-123",
  "event_id": "event-456",
  "user_email": "mathias@example.com",
  "user_name": "Mathias Coutant",
  "type": "image",
  "url": "https://firebasestorage.googleapis.com/v0/b/premierdelan.appspot.com/o/events%2Fevent-456%2Fmedia%2Fmathias%40example.com%2F1696234567890_photo.jpg?alt=media&token=abc123",
  "storage_path": "events/event-456/media/mathias@example.com/1696234567890_photo.jpg",
  "filename": "photo.jpg",
  "size": 2456789,
  "uploaded_at": "2025-10-10T18:30:00Z"
}
```

---

## 🔄 WORKFLOW COMPLET

### **1. Upload d'un média (Frontend → Firebase → Backend)**

```
1. Utilisateur sélectionne un fichier
2. Frontend : Validation (taille, format)
3. Frontend : Upload vers Firebase Storage
   └─> Firebase retourne l'URL publique
4. Frontend : Appel POST /api/evenements/{id}/medias avec l'URL
5. Backend : Enregistre les métadonnées en base
6. Backend : Met à jour photos_count dans evenements
7. Frontend : Rafraîchit la galerie
```

### **2. Suppression d'un média (Frontend → Firebase → Backend)**

```
1. Utilisateur clique "Supprimer"
2. Frontend : Vérification (est-ce son média ?)
3. Frontend : Supprime le fichier de Firebase Storage
4. Frontend : Appel DELETE /api/evenements/{id}/medias/{media_id}
5. Backend : Vérifie propriété du média
6. Backend : Supprime les métadonnées de la base
7. Backend : Met à jour photos_count dans evenements
8. Frontend : Rafraîchit la galerie
```

### **3. Téléchargement d'un média**

```
1. Utilisateur clique "Télécharger"
2. Frontend : Récupère le fichier depuis l'URL Firebase
3. Frontend : Déclenche le téléchargement dans le navigateur
(Pas d'appel backend nécessaire)
```

---

## 🎯 ENDPOINTS À IMPLÉMENTER

| Action | Endpoint | Méthode | Auth |
|--------|----------|---------|------|
| Liste des médias | `/api/evenements/{event_id}/medias` | GET | Non |
| Ajouter un média | `/api/evenements/{event_id}/medias` | POST | Oui |
| Supprimer un média | `/api/evenements/{event_id}/medias/{media_id}` | DELETE | Oui |
| Détails événement | `/api/evenements/{event_id}` | GET | Non |

---

## ⚙️ CONFIGURATION FIREBASE (FRONTEND)

Le frontend utilise Firebase Storage avec cette configuration :

```typescript
// Limites
- Images : Max 10 MB
- Vidéos : Max 100 MB

// Formats acceptés
- Images : JPEG, PNG, GIF, WebP
- Vidéos : MP4, MOV, AVI, WebM

// Chemin de stockage
events/{event_id}/media/{user_email}/{timestamp}_{filename}

// Exemple
events/event-456/media/mathias@example.com/1696234567890_photo.jpg
```

---

## 🔒 RÈGLES DE SÉCURITÉ FIREBASE STORAGE

Ajouter ces règles dans la console Firebase :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permettre à tout le monde de lire les médias d'événements
    match /events/{eventId}/media/{allPaths=**} {
      allow read: if true;
      
      // Permettre l'upload seulement aux utilisateurs authentifiés
      allow write: if request.auth != null
                   && request.resource.size < 100 * 1024 * 1024  // 100 MB max
                   && (request.resource.contentType.matches('image/.*') 
                       || request.resource.contentType.matches('video/.*'));
      
      // Permettre la suppression seulement au propriétaire
      allow delete: if request.auth != null 
                    && request.auth.token.email == resource.metadata.userEmail;
    }
  }
}
```

---

## 📋 RÉSUMÉ POUR LE BACKEND

### **Ce que le backend DOIT faire :**
1. ✅ Stocker les métadonnées des médias (URL, user, date, etc.)
2. ✅ Vérifier que seul le propriétaire peut supprimer son média
3. ✅ Mettre à jour le compteur `photos_count` après ajout/suppression
4. ✅ Retourner la liste des médias avec les infos utilisateur

### **Ce que le backend NE fait PAS :**
1. ❌ Gérer l'upload des fichiers (fait par Firebase)
2. ❌ Stocker les fichiers eux-mêmes (fait par Firebase)
3. ❌ Redimensionner/compresser les images (peut être ajouté plus tard avec Firebase Functions)

### **Triggers SQL recommandés :**

```sql
-- Mettre à jour automatiquement photos_count après insertion
CREATE TRIGGER update_photos_count_insert AFTER INSERT ON medias
FOR EACH ROW
BEGIN
  UPDATE evenements 
  SET photos_count = (SELECT COUNT(*) FROM medias WHERE event_id = NEW.event_id)
  WHERE id = NEW.event_id;
END;

-- Mettre à jour automatiquement photos_count après suppression
CREATE TRIGGER update_photos_count_delete AFTER DELETE ON medias
FOR EACH ROW
BEGIN
  UPDATE evenements 
  SET photos_count = (SELECT COUNT(*) FROM medias WHERE event_id = OLD.event_id)
  WHERE id = OLD.event_id;
END;
```

---

## 🚀 PRÊT À IMPLÉMENTER !

Le frontend envoie :
- ✅ Les URLs Firebase des médias
- ✅ Les métadonnées (type, taille, nom de fichier)
- ✅ L'email de l'utilisateur uploadeur

Le backend stocke :
- ✅ Les métadonnées en base de données
- ✅ Le compteur de médias par événement
- ✅ Les permissions de suppression (vérification propriétaire)

