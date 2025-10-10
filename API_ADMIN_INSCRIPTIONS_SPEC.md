# 📋 API Backend - Admin - Gestion des Inscriptions

Cette documentation spécifie les endpoints admin pour gérer les inscriptions aux événements.

---

## 🔐 Authentification

Tous les endpoints nécessitent :

- Header `Authorization: Bearer {auth_token}`
- L'utilisateur doit avoir `admin = 1`

---

## 1. LISTE DES INSCRITS À UN ÉVÉNEMENT

### **GET** `/api/admin/evenements/{event_id}/inscrits`

Récupère la liste complète des inscrits avec accompagnants et statistiques.

#### **Headers requis**

```json
{
  "Authorization": "Bearer {auth_token}"
}
```

#### **Réponse en cas de succès (200 OK)**

```json
{
  "event_id": "event-456",
  "titre": "Réveillon 2026",
  "total_inscrits": 25,
  "total_personnes": 68,
  "total_adultes": 55,
  "total_mineurs": 13,
  "inscriptions": [
    {
      "id": "insc-123",
      "user_email": "mathias@example.com",
      "user_name": "Mathias Coutant",
      "user_phone": "0674213709",
      "nombre_personnes": 3,
      "accompagnants": [
        {
          "firstname": "Sophie",
          "lastname": "Martin",
          "is_adult": true
        },
        {
          "firstname": "Lucas",
          "lastname": "Dupont",
          "is_adult": false
        }
      ],
      "created_at": "2025-10-09T15:30:00Z",
      "updated_at": "2025-10-09T16:45:00Z"
    },
    {
      "id": "insc-124",
      "user_email": "sophie@example.com",
      "user_name": "Sophie Bernard",
      "user_phone": "0612345678",
      "nombre_personnes": 1,
      "accompagnants": [],
      "created_at": "2025-10-09T18:00:00Z",
      "updated_at": "2025-10-09T18:00:00Z"
    }
  ]
}
```

#### **Explications des champs**

**Statistiques globales :**

- `total_inscrits` : Nombre d'inscriptions (nombre de personnes principales)
- `total_personnes` : Nombre total de personnes (inscrits + accompagnants)
- `total_adultes` : Nombre de personnes majeures (inscrits + accompagnants majeurs)
- `total_mineurs` : Nombre de personnes mineures (accompagnants mineurs uniquement)

**Détails par inscription :**

- `user_name` : Récupéré depuis la table `utilisateurs` (firstname + lastname)
- `user_phone` : Récupéré depuis la table `utilisateurs`
- `nombre_personnes` : Total pour cette inscription (1 + accompagnants.length)
- `accompagnants` : Liste des accompagnants avec statut majeur/mineur

#### **Calcul des statistiques**

```sql
-- Total inscrits (nombre d'inscriptions)
SELECT COUNT(*) FROM inscriptions_evenements WHERE event_id = ?

-- Total personnes
SELECT SUM(nombre_personnes) FROM inscriptions_evenements WHERE event_id = ?

-- Total adultes
SELECT
  COUNT(*) + SUM(
    JSON_LENGTH(
      JSON_EXTRACT(accompagnants, '$[*].is_adult[0]')
    )
  ) as total_adultes
FROM inscriptions_evenements
WHERE event_id = ?

-- Ou en Go (plus simple)
totalAdultes := len(inscriptions) // Tous les inscrits sont majeurs
for _, insc := range inscriptions {
  for _, acc := range insc.Accompagnants {
    if acc.IsAdult {
      totalAdultes++
    }
  }
}

totalMineurs := totalPersonnes - totalAdultes
```

#### **Réponses d'erreur**

```json
// 404 Not Found - Événement inexistant
{
  "error": "Événement non trouvé"
}

// 403 Forbidden - Pas admin
{
  "error": "Accès administrateur requis"
}

// 401 Unauthorized
{
  "error": "Authentification requise"
}
```

---

## 2. SUPPRIMER UNE INSCRIPTION (ADMIN)

### **DELETE** `/api/admin/evenements/{event_id}/inscrits/{inscription_id}`

Permet à un admin de supprimer l'inscription d'un participant.

#### **Headers requis**

```json
{
  "Authorization": "Bearer {auth_token}"
}
```

#### **Réponse en cas de succès (200 OK)**

```json
{
  "message": "Inscription supprimée avec succès",
  "inscription_id": "insc-123",
  "nombre_personnes_liberes": 3,
  "evenement": {
    "id": "event-456",
    "titre": "Réveillon 2026",
    "inscrits": 65
  }
}
```

#### **Actions côté backend**

1. Vérifier que l'événement et l'inscription existent
2. Récupérer `nombre_personnes` avant suppression
3. Supprimer l'inscription de la table `inscriptions_evenements`
4. Mettre à jour le compteur dans la table `evenements` :
   ```sql
   UPDATE evenements
   SET inscrits = inscrits - {nombre_personnes}
   WHERE id = {event_id}
   ```
5. Retourner le nouveau total d'inscrits

#### **Réponses d'erreur**

```json
// 404 Not Found - Inscription inexistante
{
  "error": "Inscription non trouvée"
}

// 403 Forbidden - Pas admin
{
  "error": "Accès administrateur requis"
}

// 400 Bad Request - Événement terminé (optionnel)
{
  "error": "Impossible de supprimer, l'événement est terminé"
}
```

---

## 3. RÉCUPÉRER UN ÉVÉNEMENT (ADMIN)

### **GET** `/api/admin/evenements/{event_id}`

Récupère les détails complets d'un événement (pour l'admin).

#### **Headers requis**

```json
{
  "Authorization": "Bearer {auth_token}"
}
```

#### **Réponse en cas de succès (200 OK)**

```json
{
  "evenement": {
    "id": "event-456",
    "titre": "Réveillon 2026",
    "date": "2025-12-31T20:00:00Z",
    "description": "Célébrez la nouvelle année...",
    "capacite": 100,
    "inscrits": 68,
    "photos_count": 247,
    "statut": "ouvert",
    "lieu": "Villa Privée - Côte d'Azur",
    "code_soiree": "REVE2026",
    "created_at": "2025-09-01T10:00:00Z",
    "updated_at": "2025-10-10T12:00:00Z"
  }
}
```

---

## 📊 ENDPOINTS RÉSUMÉ

| Action                | Endpoint                                                     | Méthode | Admin requis |
| --------------------- | ------------------------------------------------------------ | ------- | ------------ |
| Liste des inscrits    | `/api/admin/evenements/{event_id}/inscrits`                  | GET     | ✅           |
| Détails événement     | `/api/admin/evenements/{event_id}`                           | GET     | ✅           |
| Supprimer inscription | `/api/admin/evenements/{event_id}/inscrits/{inscription_id}` | DELETE  | ✅           |

---

## 💾 EXPORT CSV (FRONTEND)

Le frontend génère automatiquement un fichier CSV avec :

- Nom, Email, Téléphone
- Nombre de personnes
- Liste des accompagnants (avec statut majeur/mineur)
- Date d'inscription

**Exemple de CSV généré :**

```csv
Nom,Email,Téléphone,Nombre de personnes,Accompagnants,Date inscription
"Mathias Coutant","mathias@example.com","0674213709",3,"Sophie Martin (Majeur) | Lucas Dupont (Mineur)","09/10/2025 15:30:00"
"Sophie Bernard","sophie@example.com","0612345678",1,"","09/10/2025 18:00:00"
```

---

## 🔄 WORKFLOW COMPLET

### **Affichage de la liste**

```
1. Admin clique sur un événement
2. Frontend : GET /api/admin/evenements/{id}
3. Frontend : GET /api/admin/evenements/{id}/inscrits
4. Backend : Récupère toutes les inscriptions
5. Backend : Calcule les statistiques (total personnes, adultes, mineurs)
6. Backend : Joint avec la table users pour récupérer nom + téléphone
7. Frontend : Affiche la liste + statistiques
```

### **Suppression d'une inscription**

```
1. Admin clique sur "Supprimer" pour un participant
2. Confirmation "Supprimer l'inscription de X (3 personnes) ?"
3. Frontend : DELETE /api/admin/evenements/{id}/inscrits/{insc_id}
4. Backend : Supprime l'inscription
5. Backend : Met à jour inscrits = inscrits - 3
6. Frontend : Rafraîchit la liste
```

### **Export CSV**

```
1. Admin clique sur "Exporter CSV"
2. Frontend : Génère le CSV localement (pas d'appel backend)
3. Téléchargement automatique du fichier
   └─> Nom : inscrits_Reveillon_2026.csv
```

---

## ⚠️ RÈGLES MÉTIER

1. **Vérification admin** : Vérifier `user.admin === 1` pour tous ces endpoints
2. **Calcul cohérent** :
   - `total_personnes = SUM(nombre_personnes)`
   - `total_adultes = COUNT(inscrits) + COUNT(accompagnants WHERE is_adult = true)`
   - `total_mineurs = COUNT(accompagnants WHERE is_adult = false)`
3. **Jointure users** : Récupérer `user_name` et `user_phone` depuis la table `utilisateurs`
4. **Mise à jour compteur** : Toujours mettre à jour `evenements.inscrits` après suppression

---

## 🚀 PRÊT À IMPLÉMENTER !

Le frontend admin permet maintenant :

- ✅ Voir la liste complète des inscrits
- ✅ Statistiques détaillées (personnes, adultes, mineurs)
- ✅ Détails des accompagnants
- ✅ Suppression d'inscriptions
- ✅ Export CSV
- ✅ 100% responsive

Le backend doit :

- ✅ Retourner la liste des inscrits avec statistiques
- ✅ Joindre les données utilisateurs (nom, téléphone)
- ✅ Permettre la suppression d'inscriptions
- ✅ Mettre à jour le compteur `inscrits`
