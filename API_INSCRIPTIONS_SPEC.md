# 📋 API Backend - Gestion des Inscriptions aux Événements

Cette documentation spécifie les endpoints nécessaires pour gérer les inscriptions aux événements avec accompagnants.

---

## 🔐 Authentification

Tous les endpoints nécessitent un header d'authentification :

```
Authorization: Bearer {auth_token}
```

---

## 1. S'INSCRIRE À UN ÉVÉNEMENT

### **POST** `/api/evenements/{event_id}/inscription`

Permet à un utilisateur de s'inscrire à un événement avec des accompagnants.

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
  ]
}
```

#### **Explications des champs**

- `user_email` (string, requis) : Email de l'utilisateur qui s'inscrit (personne principale)
- `nombre_personnes` (number, requis) : Nombre total de personnes (utilisateur + accompagnants)
- `accompagnants` (array, optionnel) : Liste des accompagnants (vide si `nombre_personnes = 1`)
  - `firstname` (string, requis) : Prénom de l'accompagnant
  - `lastname` (string, requis) : Nom de l'accompagnant
  - `is_adult` (boolean, requis) : `true` si majeur (+18 ans), `false` sinon

#### **Validations côté backend**

- ✅ Vérifier que l'événement existe et a le statut `"ouvert"`
- ✅ Vérifier que l'utilisateur n'est pas déjà inscrit
- ✅ Vérifier que `nombre_personnes <= (capacite - inscrits)` (places disponibles)
- ✅ Vérifier que `nombre_personnes - 1 === accompagnants.length`
- ✅ Vérifier que tous les accompagnants ont un `firstname` et `lastname` non vides

#### **Réponse en cas de succès (201 Created)**

```json
{
  "message": "Inscription réussie",
  "inscription": {
    "id": "insc-123",
    "event_id": "event-456",
    "user_email": "mathias@example.com",
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
    "created_at": "2025-10-10T15:30:00Z"
  },
  "evenement": {
    "id": "event-456",
    "titre": "Réveillon 2026",
    "inscrits": 48
  }
}
```

#### **Réponses d'erreur**

```json
// 400 Bad Request - Pas assez de places
{
  "error": "Plus assez de places disponibles",
  "places_restantes": 2,
  "demande": 3
}

// 409 Conflict - Déjà inscrit
{
  "error": "Vous êtes déjà inscrit à cet événement"
}

// 404 Not Found - Événement inexistant
{
  "error": "Événement non trouvé"
}

// 400 Bad Request - Événement fermé
{
  "error": "Les inscriptions sont fermées pour cet événement",
  "statut": "complet"
}
```

---

## 2. RÉCUPÉRER SON INSCRIPTION

### **GET** `/api/evenements/{event_id}/inscription`

Récupère l'inscription de l'utilisateur connecté pour un événement donné.

#### **Headers requis**

```json
{
  "Authorization": "Bearer {auth_token}"
}
```

#### **Query Params**

```
?user_email=mathias@example.com
```

#### **Réponse en cas de succès (200 OK)**

```json
{
  "inscription": {
    "id": "insc-123",
    "event_id": "event-456",
    "user_email": "mathias@example.com",
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
    "created_at": "2025-10-10T15:30:00Z",
    "updated_at": "2025-10-10T15:30:00Z"
  }
}
```

#### **Réponse si pas inscrit (404 Not Found)**

```json
{
  "error": "Aucune inscription trouvée",
  "inscrit": false
}
```

---

## 3. MODIFIER SON INSCRIPTION

### **PUT** `/api/evenements/{event_id}/inscription`

Permet de modifier le nombre de personnes et les accompagnants d'une inscription existante.

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
  "nombre_personnes": 4,
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
    },
    {
      "firstname": "Emma",
      "lastname": "Bernard",
      "is_adult": true
    }
  ]
}
```

#### **Validations côté backend**

- ✅ Vérifier que l'inscription existe
- ✅ Vérifier que l'événement est toujours ouvert
- ✅ Si augmentation du nombre de personnes : vérifier les places disponibles
  - `(nouveau_nombre - ancien_nombre) <= places_restantes`
- ✅ Vérifier que `nombre_personnes - 1 === accompagnants.length`
- ✅ Vérifier que tous les accompagnants ont un `firstname` et `lastname` non vides

#### **Réponse en cas de succès (200 OK)**

```json
{
  "message": "Inscription modifiée",
  "inscription": {
    "id": "insc-123",
    "event_id": "event-456",
    "user_email": "mathias@example.com",
    "nombre_personnes": 4,
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
      },
      {
        "firstname": "Emma",
        "lastname": "Bernard",
        "is_adult": true
      }
    ],
    "updated_at": "2025-10-10T16:45:00Z"
  },
  "evenement": {
    "id": "event-456",
    "titre": "Réveillon 2026",
    "inscrits": 49
  }
}
```

#### **Réponses d'erreur**

```json
// 400 Bad Request - Pas assez de places pour l'augmentation
{
  "error": "Plus assez de places pour cette modification",
  "places_restantes": 1,
  "augmentation_demandee": 2
}

// 404 Not Found - Inscription inexistante
{
  "error": "Aucune inscription trouvée à modifier"
}

// 400 Bad Request - Événement fermé
{
  "error": "Les modifications sont fermées pour cet événement",
  "statut": "termine"
}
```

---

## 4. SE DÉSINSCRIRE D'UN ÉVÉNEMENT

### **DELETE** `/api/evenements/{event_id}/desinscription`

Supprime l'inscription de l'utilisateur (et tous ses accompagnants).

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
  "user_email": "mathias@example.com"
}
```

#### **Réponse en cas de succès (200 OK)**

```json
{
  "message": "Désinscription réussie",
  "nombre_personnes_liberes": 4,
  "evenement": {
    "id": "event-456",
    "titre": "Réveillon 2026",
    "inscrits": 45
  }
}
```

#### **Réponses d'erreur**

```json
// 404 Not Found - Inscription inexistante
{
  "error": "Aucune inscription à supprimer"
}

// 400 Bad Request - Désinscription fermée (optionnel)
{
  "error": "Les désinscriptions ne sont plus autorisées",
  "raison": "L'événement commence dans moins de 24h"
}
```

---

## 5. LISTE DES INSCRITS (ADMIN)

### **GET** `/api/admin/evenements/{event_id}/inscrits`

Récupère la liste complète des inscrits à un événement (réservé aux admins).

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
  "total_inscrits": 48,
  "total_personnes": 125,
  "total_adultes": 98,
  "total_mineurs": 27,
  "inscriptions": [
    {
      "id": "insc-123",
      "user_email": "mathias@example.com",
      "user_name": "Mathias Coutant",
      "user_phone": "0674213709",
      "nombre_personnes": 4,
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
        },
        {
          "firstname": "Emma",
          "lastname": "Bernard",
          "is_adult": true
        }
      ],
      "created_at": "2025-10-10T15:30:00Z",
      "updated_at": "2025-10-10T16:45:00Z"
    }
  ]
}
```

---

## 📊 BASE DE DONNÉES - Structure suggérée

### **Table: `inscriptions_evenements`**

```sql
CREATE TABLE inscriptions_evenements (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  nombre_personnes INT NOT NULL DEFAULT 1,
  accompagnants JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Index et contraintes
  UNIQUE KEY unique_user_event (event_id, user_email),
  FOREIGN KEY (event_id) REFERENCES evenements(id) ON DELETE CASCADE,
  FOREIGN KEY (user_email) REFERENCES utilisateurs(email) ON DELETE CASCADE
);
```

### **Format JSON pour `accompagnants`**

```json
[
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
]
```

---

## 🔄 MISE À JOUR DU COMPTEUR `inscrits`

**À chaque opération, mettre à jour le compteur dans la table `evenements` :**

```sql
-- Lors d'une inscription
UPDATE evenements
SET inscrits = inscrits + {nombre_personnes}
WHERE id = {event_id};

-- Lors d'une modification
UPDATE evenements
SET inscrits = inscrits + ({nouveau_nombre} - {ancien_nombre})
WHERE id = {event_id};

-- Lors d'une désinscription
UPDATE evenements
SET inscrits = inscrits - {nombre_personnes}
WHERE id = {event_id};
```

**Ou utiliser un trigger SQL :**

```sql
-- Recalculer automatiquement après chaque changement
CREATE TRIGGER update_inscrits_count AFTER INSERT OR UPDATE OR DELETE ON inscriptions_evenements
FOR EACH ROW
BEGIN
  UPDATE evenements e
  SET e.inscrits = (
    SELECT COALESCE(SUM(nombre_personnes), 0)
    FROM inscriptions_evenements
    WHERE event_id = e.id
  )
  WHERE e.id = NEW.event_id OR e.id = OLD.event_id;
END;
```

---

## ⚠️ RÈGLES MÉTIER IMPORTANTES

1. **Vérification des places** : Toujours vérifier `capacite - inscrits >= nombre_personnes_demandé`
2. **Unicité** : Un utilisateur ne peut s'inscrire qu'une seule fois par événement
3. **Cohérence** : `nombre_personnes = 1 + nombre_accompagnants`
4. **Statut** : Ne permettre les inscriptions que si `statut = "ouvert"`
5. **Validation** : Tous les accompagnants doivent avoir un prénom et nom valides
6. **Transaction** : Utiliser des transactions SQL pour garantir la cohérence des compteurs

---

## 🎯 ENDPOINTS À IMPLÉMENTER

**Frontend envoie vers :**

| Action                 | Endpoint                                                    | Méthode |
| ---------------------- | ----------------------------------------------------------- | ------- |
| S'inscrire             | `/api/evenements/{event_id}/inscription`                    | POST    |
| Voir son inscription   | `/api/evenements/{event_id}/inscription?user_email={email}` | GET     |
| Modifier inscription   | `/api/evenements/{event_id}/inscription`                    | PUT     |
| Se désinscrire         | `/api/evenements/{event_id}/desinscription`                 | DELETE  |
| Liste inscrits (admin) | `/api/admin/evenements/{event_id}/inscrits`                 | GET     |

**Toutes les requêtes incluent :**

- Header `Authorization: Bearer {auth_token}`
- Header `ngrok-skip-browser-warning: true` (déjà géré par le frontend)
- Header `Content-Type: application/json` (pour POST/PUT)

---

## 🚀 EN RÉSUMÉ

Le frontend envoie maintenant :

- ✅ Les informations du demandeur (`user_email`)
- ✅ Le nombre total de personnes
- ✅ La liste des accompagnants avec prénom, nom et statut majeur/mineur
- ✅ Gère les inscriptions, modifications et désinscriptions
- ✅ Interface 100% responsive (mobile, tablet, desktop)

Le backend doit :

- ✅ Stocker les inscriptions avec accompagnants
- ✅ Valider les places disponibles
- ✅ Mettre à jour le compteur `inscrits` en temps réel
- ✅ Empêcher les doublons (1 inscription par user/event)
- ✅ Retourner les données structurées comme spécifié
