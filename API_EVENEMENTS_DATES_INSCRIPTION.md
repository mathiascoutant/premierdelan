# 📅 API Backend - Dates d'Ouverture/Fermeture des Inscriptions

Cette documentation spécifie les nouveaux champs pour gérer les périodes d'inscription aux événements.

---

## 🆕 NOUVEAUX CHAMPS DANS LA TABLE `evenements`

```sql
ALTER TABLE evenements 
ADD COLUMN date_ouverture_inscription TIMESTAMP,
ADD COLUMN date_fermeture_inscription TIMESTAMP;
```

### **Explications** :

- `date_ouverture_inscription` : Date et heure d'ouverture des inscriptions
- `date_fermeture_inscription` : Date et heure de fermeture des inscriptions

---

## 📋 STRUCTURE COMPLÈTE DE LA TABLE `evenements`

```sql
CREATE TABLE evenements (
  id VARCHAR(255) PRIMARY KEY,
  titre VARCHAR(500) NOT NULL,
  date TIMESTAMP NOT NULL,
  description TEXT,
  lieu VARCHAR(500),
  capacite INT NOT NULL DEFAULT 50,
  inscrits INT NOT NULL DEFAULT 0,
  photos_count INT NOT NULL DEFAULT 0,
  statut ENUM('ouvert', 'complet', 'termine', 'annule') DEFAULT 'ouvert',
  code_soiree VARCHAR(100),
  date_ouverture_inscription TIMESTAMP,      -- ⭐ NOUVEAU
  date_fermeture_inscription TIMESTAMP,      -- ⭐ NOUVEAU
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔄 ENDPOINTS MODIFIÉS

### **1. POST `/api/admin/evenements` (Créer événement)**

**Corps de la requête** (ajout de 2 champs) :

```json
{
  "titre": "Réveillon 2026",
  "date": "2025-12-31T20:00:00Z",
  "description": "Célébrez la nouvelle année...",
  "lieu": "Villa Privée",
  "capacite": 100,
  "statut": "ouvert",
  "code_soiree": "REVE2026",
  "date_ouverture_inscription": "2025-10-01T10:00:00Z",     // ⭐ NOUVEAU
  "date_fermeture_inscription": "2025-12-30T23:59:59Z"      // ⭐ NOUVEAU
}
```

### **2. PUT `/api/admin/evenements/{event_id}` (Modifier événement)**

**Corps de la requête** (avec les nouveaux champs) :

```json
{
  "titre": "Réveillon 2026",
  "date": "2025-12-31T20:00:00Z",
  "description": "...",
  "lieu": "Villa Privée",
  "capacite": 120,
  "statut": "ouvert",
  "code_soiree": "REVE2026",
  "date_ouverture_inscription": "2025-10-01T10:00:00Z",     // ⭐ NOUVEAU
  "date_fermeture_inscription": "2025-12-30T23:59:59Z"      // ⭐ NOUVEAU
}
```

### **3. GET `/api/evenements/public` (Liste événements)**

**Réponse** (inclut les nouvelles dates) :

```json
{
  "evenements": [
    {
      "id": "event-456",
      "titre": "Réveillon 2026",
      "date": "2025-12-31T20:00:00Z",
      "description": "...",
      "capacite": 100,
      "inscrits": 45,
      "photos_count": 0,
      "statut": "ouvert",
      "lieu": "Villa Privée",
      "date_ouverture_inscription": "2025-10-01T10:00:00Z",     // ⭐ NOUVEAU
      "date_fermeture_inscription": "2025-12-30T23:59:59Z"      // ⭐ NOUVEAU
    }
  ]
}
```

---

## 🎯 LOGIQUE FRONTEND (DÉJÀ IMPLÉMENTÉE)

### **Calcul du statut d'inscription** :

```typescript
const now = new Date();
const dateOuverture = new Date(event.date_ouverture_inscription);
const dateFermeture = new Date(event.date_fermeture_inscription);

const isBeforeOpening = now < dateOuverture;       // Avant ouverture
const isAfterClosing = now > dateFermeture;        // Après fermeture
const isOpen = !isBeforeOpening && !isAfterClosing; // Ouvert
```

### **Affichage selon l'état** :

```typescript
if (isBeforeOpening) {
  // Afficher "Prochainement" + Countdown vers ouverture
  return <Countdown targetDate={date_ouverture} type="opening" />
  // Exemple : "Ouvre dans : 5j 3h"
}

if (isOpen) {
  // Afficher bouton "S'inscrire" + Countdown vers fermeture
  return <Countdown targetDate={date_fermeture} type="closing" />
  // Exemple : "Ferme dans : 2j 15h"
}

if (isAfterClosing) {
  // Afficher "Inscriptions fermées"
  // Bouton désactivé
}
```

---

## ⏱️ FORMAT DU COMPTEUR À REBOURS

### **Plus d'1 jour** :
```
Ouvre dans : 5j 12h
Ferme dans : 2j 8h
```

### **Moins d'1 jour** :
```
Ouvre dans : 18h 45m
Ferme dans : 5h 30m
```

### **Moins d'1 heure** :
```
Ouvre dans : 45m 12s
Ferme dans : 15m 30s
```

Le compteur se **met à jour en temps réel** (chaque seconde).

---

## 📊 EXEMPLES DE SCÉNARIOS

### **Scénario 1 : Inscription pas encore ouverte**
```
Événement : Réveillon 2026
Date événement : 31/12/2025 20:00
Ouverture inscription : 01/10/2025 10:00  ← On est le 15/09/2025
Fermeture inscription : 30/12/2025 23:59

→ Statut : "Prochainement"
→ Compteur : "Ouvre dans : 15j 10h"
→ Bouton : Désactivé
```

### **Scénario 2 : Inscription ouverte**
```
Événement : Réveillon 2026
Date événement : 31/12/2025 20:00
Ouverture inscription : 01/10/2025 10:00  ← On est le 15/12/2025
Fermeture inscription : 30/12/2025 23:59

→ Statut : "45 places restantes"
→ Compteur : "Ferme dans : 15j 10h"
→ Bouton : "S'inscrire" (actif)
```

### **Scénario 3 : Inscription fermée**
```
Événement : Réveillon 2026
Date événement : 31/12/2025 20:00
Ouverture inscription : 01/10/2025 10:00
Fermeture inscription : 30/12/2025 23:59  ← On est le 31/12/2025

→ Statut : "Inscriptions fermées"
→ Compteur : Aucun
→ Bouton : Désactivé
```

---

## 🔄 VALIDATIONS BACKEND

Lors de la création/modification d'un événement :

```go
// Vérifier la cohérence des dates
if dateOuverture >= dateFermeture {
  return error("La date d'ouverture doit être avant la date de fermeture")
}

if dateFermeture >= dateEvenement {
  return error("Les inscriptions doivent fermer avant l'événement")
}

// Optionnel : vérifier que l'ouverture n'est pas dans le passé
if dateOuverture < time.Now() {
  return error("La date d'ouverture ne peut pas être dans le passé")
}
```

---

## ✅ RÉSUMÉ BACKEND

**Ajouter 2 champs à la table `evenements`** :
- `date_ouverture_inscription` (TIMESTAMP)
- `date_fermeture_inscription` (TIMESTAMP)

**Inclure ces champs dans tous les endpoints** :
- POST/PUT `/api/admin/evenements`
- GET `/api/evenements/public`
- GET `/api/admin/evenements`

**Frontend gère automatiquement** :
- Affichage "Prochainement" / "Ouvert" / "Fermé"
- Compteurs à rebours en temps réel
- Désactivation des boutons selon les dates

