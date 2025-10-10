# 🗑️ API Backend - Suppression d'un Accompagnant

Cette documentation spécifie l'endpoint pour supprimer un accompagnant spécifique d'une inscription.

---

## 🔐 Authentification

L'endpoint nécessite :
- Header `Authorization: Bearer {auth_token}`
- L'utilisateur doit avoir `admin = 1`

---

## SUPPRIMER UN ACCOMPAGNANT

### **DELETE** `/api/admin/evenements/{event_id}/inscrits/{inscription_id}/accompagnant/{index}`

Supprime un accompagnant spécifique d'une inscription.

#### **Headers requis**

```json
{
  "Authorization": "Bearer {auth_token}"
}
```

#### **Paramètres URL**

- `event_id` : ID de l'événement
- `inscription_id` : ID de l'inscription
- `index` : Index de l'accompagnant à supprimer (0 = premier accompagnant, 1 = deuxième, etc.)

#### **Exemple**

```
DELETE /api/admin/evenements/event-456/inscrits/insc-123/accompagnant/1
```

Supprime le **2ème accompagnant** (index 1) de l'inscription `insc-123`.

#### **Actions côté backend**

```go
1. Récupérer l'inscription
2. Vérifier que l'utilisateur est admin
3. Vérifier que l'index est valide (< len(accompagnants))
4. Retirer l'accompagnant du tableau :
   accompagnants = append(accompagnants[:index], accompagnants[index+1:]...)
5. Décrémenter nombre_personnes :
   nombre_personnes = nombre_personnes - 1
6. Mettre à jour l'inscription en BDD
7. Mettre à jour le compteur dans evenements :
   UPDATE evenements 
   SET inscrits = inscrits - 1
   WHERE id = {event_id}
```

#### **Exemple de code Go**

```go
func deleteAccompagnant(w http.ResponseWriter, r *http.Request) {
    inscriptionID := chi.URLParam(r, "inscription_id")
    indexStr := chi.URLParam(r, "index")
    index, _ := strconv.Atoi(indexStr)
    
    // Récupérer l'inscription
    var inscription Inscription
    db.Where("id = ?", inscriptionID).First(&inscription)
    
    // Vérifier que l'index est valide
    if index < 0 || index >= len(inscription.Accompagnants) {
        http.Error(w, "Index invalide", http.StatusBadRequest)
        return
    }
    
    // Retirer l'accompagnant
    inscription.Accompagnants = append(
        inscription.Accompagnants[:index],
        inscription.Accompagnants[index+1:]...,
    )
    
    // Décrémenter le nombre de personnes
    inscription.NombrePersonnes--
    
    // Sauvegarder
    db.Save(&inscription)
    
    // Mettre à jour le compteur de l'événement
    db.Model(&Event{}).
      Where("id = ?", inscription.EventID).
      Update("inscrits", gorm.Expr("inscrits - ?", 1))
    
    // Réponse
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Accompagnant supprimé",
        "inscription": inscription,
    })
}
```

#### **Réponse en cas de succès (200 OK)**

```json
{
  "message": "Accompagnant supprimé avec succès",
  "inscription": {
    "id": "insc-123",
    "user_email": "mathias@example.com",
    "nombre_personnes": 2,
    "accompagnants": [
      {
        "firstname": "Sophie",
        "lastname": "Martin",
        "is_adult": true
      }
    ]
  },
  "evenement": {
    "id": "event-456",
    "inscrits": 67
  }
}
```

#### **Réponses d'erreur**

```json
// 400 Bad Request - Index invalide
{
  "error": "Index d'accompagnant invalide"
}

// 404 Not Found - Inscription inexistante
{
  "error": "Inscription non trouvée"
}

// 403 Forbidden - Pas admin
{
  "error": "Accès administrateur requis"
}
```

---

## ⚠️ CAS PARTICULIER : Dernier accompagnant

Si on supprime le **dernier accompagnant** d'une inscription :
```json
// Avant
{
  "nombre_personnes": 2,
  "accompagnants": [
    { "firstname": "Sophie", "lastname": "Martin", "is_adult": true }
  ]
}

// Après suppression de Sophie
{
  "nombre_personnes": 1,
  "accompagnants": []
}
```

L'inscription reste valide avec juste la personne principale.

---

## 🔄 WORKFLOW

```
1. Admin clique "Retirer" sur un accompagnant
2. Confirmation: "Supprimer Sophie Martin de cette inscription ?"
3. Frontend : DELETE /api/admin/evenements/{id}/inscrits/{insc_id}/accompagnant/{index}
4. Backend : Retire l'accompagnant du tableau JSON
5. Backend : nombre_personnes = nombre_personnes - 1
6. Backend : inscrits = inscrits - 1
7. Frontend : Rafraîchit la liste
8. La ligne de l'accompagnant disparaît
```

---

## 📋 RÉSUMÉ

Le backend doit implémenter **1 nouvel endpoint** :

| Action | Endpoint | Méthode | Admin requis |
|--------|----------|---------|--------------|
| Supprimer accompagnant | `/api/admin/evenements/{event_id}/inscrits/{inscription_id}/accompagnant/{index}` | DELETE | ✅ |

**Actions à faire** :
1. ✅ Retirer l'accompagnant du tableau
2. ✅ Décrémenter `nombre_personnes`
3. ✅ Décrémenter `evenements.inscrits`
4. ✅ Retourner l'inscription mise à jour

