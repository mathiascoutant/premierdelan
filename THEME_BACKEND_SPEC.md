# 🎨 Spécification Backend - Système de Thèmes

## 📋 Vue d'ensemble

Le frontend a besoin de sauvegarder le thème choisi par chaque utilisateur (médiéval ou classique) en base de données pour une persistance entre les sessions.

---

## 🗄️ Modification de la Base de Données

### Collection `users`

Ajouter le champ `theme` à la collection `users` :

```javascript
{
  _id: ObjectId,
  firstname: "Jean",
  lastname: "Dupont",
  email: "jean@email.com",
  phone: "0612345678",
  admin: 0,
  theme: "medieval", // ✅ NOUVEAU CHAMP
  created_at: "2025-01-15T10:30:00Z"
}
```

**Valeurs possibles** : `"medieval"` ou `"classic"`

---

## 🔗 Endpoints à Créer

### 1. GET `/api/user/theme`

**Récupérer le thème de l'utilisateur connecté**

**Headers requis** :

```
Authorization: Bearer <token>
```

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "theme": "medieval"
}
```

**Réponse si utilisateur non trouvé (404)** :

```json
{
  "success": false,
  "message": "Utilisateur non trouvé"
}
```

**Code d'implémentation** :

```javascript
app.get("/api/user/theme", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db
      .collection("users")
      .findOne({ _id: ObjectId(userId) });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    res.json({
      success: true,
      theme: user.theme || "medieval", // Par défaut médiéval
    });
  } catch (error) {
    console.error("Erreur GET theme:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});
```

---

### 2. POST `/api/user/theme`

**Sauvegarder le thème de l'utilisateur connecté**

**Headers requis** :

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body requis** :

```json
{
  "theme": "classic"
}
```

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "message": "Thème sauvegardé avec succès",
  "theme": "classic"
}
```

**Réponse si thème invalide (400)** :

```json
{
  "success": false,
  "message": "Thème invalide. Doit être \"medieval\" ou \"classic\""
}
```

**Code d'implémentation** :

```javascript
app.post("/api/user/theme", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    // Validation
    if (!theme || !["medieval", "classic"].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Thème invalide. Doit être "medieval" ou "classic"',
      });
    }

    // Mise à jour en base
    const result = await db
      .collection("users")
      .updateOne({ _id: ObjectId(userId) }, { $set: { theme: theme } });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    res.json({
      success: true,
      message: "Thème sauvegardé avec succès",
      theme: theme,
    });
  } catch (error) {
    console.error("Erreur POST theme:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});
```

---

## 🔄 Migration des Données

### Script de migration pour les utilisateurs existants

Exécuter une seule fois pour ajouter le thème par défaut aux utilisateurs existants :

```javascript
// Migration MongoDB
db.users.updateMany(
  { theme: { $exists: false } }, // Utilisateurs sans thème
  { $set: { theme: "medieval" } } // Thème par défaut
);

// Vérification
db.users.find({}, { firstname: 1, email: 1, theme: 1 }).pretty();
```

---

## 🧪 Tests

### Test GET `/api/user/theme`

```bash
curl -X GET \
  https://believable-spontaneity-production.up.railway.app/api/user/theme \
  -H "Authorization: Bearer <token>"
```

**Réponse attendue** :

```json
{
  "success": true,
  "theme": "medieval"
}
```

### Test POST `/api/user/theme`

```bash
curl -X POST \
  https://believable-spontaneity-production.up.railway.app/api/user/theme \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"theme": "classic"}'
```

**Réponse attendue** :

```json
{
  "success": true,
  "message": "Thème sauvegardé avec succès",
  "theme": "classic"
}
```

---

## 📱 Comportement Frontend

### Utilisateur connecté

1. **Chargement** : Récupère le thème depuis la DB
2. **Changement** : Sauvegarde en DB + localStorage
3. **Erreur DB** : Fallback sur localStorage

### Utilisateur non connecté

1. **Chargement** : Utilise localStorage uniquement
2. **Changement** : Sauvegarde en localStorage uniquement

---

## ✅ Checklist d'implémentation

- [ ] Ajouter le champ `theme` à la collection `users`
- [ ] Créer l'endpoint GET `/api/user/theme`
- [ ] Créer l'endpoint POST `/api/user/theme`
- [ ] Exécuter la migration des utilisateurs existants
- [ ] Tester les endpoints avec un utilisateur connecté
- [ ] Vérifier la validation des thèmes (`medieval` ou `classic`)

---

## 🎯 Notes importantes

- **Thème par défaut** : `"medieval"` si non défini
- **Validation stricte** : Seuls `"medieval"` et `"classic"` sont acceptés
- **Authentification** : Les deux endpoints nécessitent un token valide
- **Fallback** : Le frontend gère les erreurs avec localStorage
- **Performance** : Les requêtes sont légères (un seul champ)

---

**Une fois implémenté, le système de thèmes sera entièrement fonctionnel avec persistance en base de données !** 🎨✨
