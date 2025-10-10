# API - Mes Événements

## Vue d'ensemble

Cette API permet à un utilisateur connecté de récupérer la liste de tous les événements auxquels il est inscrit (passés, à venir, en cours).

---

## 🔒 Authentification

Toutes les requêtes nécessitent un **token JWT** valide dans le header `Authorization`.

```http
Authorization: Bearer <token>
```

---

## 📋 Endpoints

### 1. GET /api/mes-evenements

**Description :** Récupère la liste des événements auxquels l'utilisateur est inscrit.

#### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
ngrok-skip-browser-warning: true
```

#### Réponse Succès (200 OK)

```json
{
  "evenements": [
    {
      "id": "68e8be3492b2c55a559143f6",
      "titre": "Réveillon 2026",
      "date": "2026-01-01T03:00:00Z",
      "description": "Soirée exceptionnelle pour fêter la nouvelle année",
      "lieu": "Bordeaux",
      "capacite": 100,
      "inscrits": 45,
      "photos_count": 23,
      "statut": "ouvert",
      "user_inscription": {
        "id": "inscription_123",
        "nombre_personnes": 3,
        "created_at": "2025-10-10T14:30:00Z"
      }
    },
    {
      "id": "68e8be3492b2c55a559143f7",
      "titre": "Soirée Halloween",
      "date": "2025-10-31T20:00:00Z",
      "description": "Soirée costumée terrifiante",
      "lieu": "Paris",
      "capacite": 50,
      "inscrits": 30,
      "photos_count": 0,
      "statut": "ouvert",
      "user_inscription": {
        "id": "inscription_456",
        "nombre_personnes": 2,
        "created_at": "2025-09-15T10:00:00Z"
      }
    }
  ]
}
```

#### Réponse si aucune inscription (200 OK)

```json
{
  "evenements": []
}
```

#### Réponse Erreur - Non authentifié (401 Unauthorized)

```json
{
  "error": "Token d'authentification manquant ou invalide"
}
```

---

## 📊 Détails des champs

### Objet `Event`

| Champ              | Type              | Description                                             |
| ------------------ | ----------------- | ------------------------------------------------------- |
| `id`               | string            | ID unique de l'événement                                |
| `titre`            | string            | Nom de l'événement                                      |
| `date`             | string (ISO 8601) | Date et heure de l'événement (format UTC avec Z)        |
| `description`      | string            | Description de l'événement                              |
| `lieu`             | string            | Lieu de l'événement                                     |
| `capacite`         | number            | Capacité maximale d'inscrits                            |
| `inscrits`         | number            | Nombre total de personnes inscrites                     |
| `photos_count`     | number            | Nombre de photos/vidéos dans la galerie                 |
| `statut`           | string            | Statut : `"ouvert"`, `"complet"`, `"ferme"`, `"annule"` |
| `user_inscription` | object            | Détails de l'inscription de l'utilisateur               |

### Objet `user_inscription`

| Champ              | Type              | Description                                                 |
| ------------------ | ----------------- | ----------------------------------------------------------- |
| `id`               | string            | ID unique de l'inscription                                  |
| `nombre_personnes` | number            | Nombre de personnes inscrites (utilisateur + accompagnants) |
| `created_at`       | string (ISO 8601) | Date et heure de l'inscription                              |

---

## 🔍 Logique Backend

### 1. Récupération des événements

```go
// Exemple en Go (adaptez selon votre langage)
func GetMesEvenements(c *gin.Context) {
    // 1. Récupérer le user_id depuis le token JWT
    userID := c.GetString("user_id") // Exemple avec middleware JWT

    // 2. Récupérer toutes les inscriptions de cet utilisateur
    var inscriptions []Inscription
    db.Where("user_id = ?", userID).Find(&inscriptions)

    // 3. Pour chaque inscription, récupérer les détails de l'événement
    var evenements []EventWithInscription

    for _, inscription := range inscriptions {
        var event Event
        db.First(&event, inscription.EventID)

        // 4. Compter le nombre de photos de cet événement
        var photosCount int64
        db.Model(&Media{}).Where("event_id = ?", event.ID).Count(&photosCount)

        // 5. Construire la réponse
        evenements = append(evenements, EventWithInscription{
            ID:          event.ID,
            Titre:       event.Titre,
            Date:        event.Date,
            Description: event.Description,
            Lieu:        event.Lieu,
            Capacite:    event.Capacite,
            Inscrits:    event.Inscrits,
            PhotosCount: int(photosCount),
            Statut:      event.Statut,
            UserInscription: InscriptionDetails{
                ID:              inscription.ID,
                NombrePersonnes: inscription.NombrePersonnes,
                CreatedAt:       inscription.CreatedAt,
            },
        })
    }

    c.JSON(200, gin.H{
        "evenements": evenements,
    })
}
```

### 2. Tri des événements (optionnel)

Vous pouvez trier les événements par date (les plus proches en premier) :

```go
// Trier par date (du plus proche au plus lointain)
sort.Slice(evenements, func(i, j int) bool {
    return evenements[i].Date.Before(evenements[j].Date)
})
```

---

## 🔒 Sécurité

1. **Authentification obligatoire** : Vérifier que l'utilisateur est connecté (middleware JWT).
2. **Isolation des données** : Ne renvoyer QUE les événements auxquels l'utilisateur est inscrit.
3. **Validation** : Vérifier que le token est valide et non expiré.

---

## 🧪 Exemples de tests

### Test avec cURL

```bash
curl -X GET "https://votre-backend.com/api/mes-evenements" \
  -H "Authorization: Bearer <token>" \
  -H "ngrok-skip-browser-warning: true"
```

### Réponse attendue

```json
{
  "evenements": [
    {
      "id": "68e8be3492b2c55a559143f6",
      "titre": "Réveillon 2026",
      "date": "2026-01-01T03:00:00Z",
      "description": "Soirée de test",
      "lieu": "Bordeaux",
      "capacite": 70,
      "inscrits": 3,
      "photos_count": 6,
      "statut": "ouvert",
      "user_inscription": {
        "id": "inscription_id",
        "nombre_personnes": 2,
        "created_at": "2025-10-10T12:00:00Z"
      }
    }
  ]
}
```

---

## 📝 Notes importantes

1. **Format des dates** : Toujours renvoyer les dates au format ISO 8601 avec `Z` (UTC).
2. **Photos count** : Compter TOUTES les photos/vidéos de l'événement (pas seulement celles de l'utilisateur).
3. **Inscriptions multiples** : Un utilisateur ne peut avoir qu'UNE inscription par événement (vérifier unicité).
4. **Événements passés** : Inclure aussi les événements passés auxquels l'utilisateur a participé.

---

## ✅ Checklist d'implémentation

- [ ] Créer l'endpoint `GET /api/mes-evenements`
- [ ] Ajouter le middleware d'authentification JWT
- [ ] Récupérer les inscriptions de l'utilisateur connecté
- [ ] Joindre les informations des événements
- [ ] Compter le nombre de photos pour chaque événement
- [ ] Trier par date (optionnel, recommandé)
- [ ] Tester avec Postman/cURL
- [ ] Configurer CORS pour accepter les requêtes du frontend

---

**🎯 C'est tout ce dont le backend a besoin pour implémenter "Mes Événements" !**
