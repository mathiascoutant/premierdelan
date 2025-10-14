# 🌍 Spécification Backend - Thème Global

## 📋 Vue d'ensemble

Le frontend a besoin d'un thème global pour tout le site web. Le thème est appliqué à tous les utilisateurs et peut être modifié uniquement par les administrateurs.

---

## 🗄️ Structure de la Base de Données

### Collection `site_settings`

Créer une nouvelle collection pour stocker les paramètres globaux du site :

```javascript
{
  _id: ObjectId,
  key: "global_theme",
  value: "medieval",
  updated_at: "2025-01-15T10:30:00Z",
  updated_by: ObjectId("user_id_admin")
}
```

**Valeurs possibles pour `value`** : `"medieval"` ou `"classic"`

---

## 🔗 Endpoints à Créer

### 1. GET `/api/theme`

**Récupérer le thème global du site (public)**

**Aucun header requis** (endpoint public)

**Réponse attendue (200 OK)** :

```json
{
  "success": true,
  "theme": "medieval"
}
```

**Code d'implémentation** :

```javascript
app.get("/api/theme", async (req, res) => {
  try {
    const setting = await db
      .collection("site_settings")
      .findOne({ key: "global_theme" });

    if (!setting) {
      // Créer le thème par défaut si n'existe pas
      await db.collection("site_settings").insertOne({
        key: "global_theme",
        value: "medieval",
        updated_at: new Date(),
        updated_by: null,
      });

      return res.json({
        success: true,
        theme: "medieval",
      });
    }

    res.json({
      success: true,
      theme: setting.value,
    });
  } catch (error) {
    console.error("Erreur GET theme global:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});
```

---

### 2. POST `/api/theme`

**Modifier le thème global du site (admin uniquement)**

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
  "message": "Thème global mis à jour avec succès",
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

**Réponse si pas admin (403)** :

```json
{
  "success": false,
  "message": "Accès refusé. Seuls les administrateurs peuvent modifier le thème global"
}
```

**Code d'implémentation** :

```javascript
app.post("/api/theme", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    // Vérifier que l'utilisateur est admin
    const user = await db
      .collection("users")
      .findOne({ _id: ObjectId(userId) });

    if (!user || user.admin !== 1) {
      return res.status(403).json({
        success: false,
        message:
          "Accès refusé. Seuls les administrateurs peuvent modifier le thème global",
      });
    }

    // Validation
    if (!theme || !["medieval", "classic"].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Thème invalide. Doit être "medieval" ou "classic"',
      });
    }

    // Mise à jour ou création du thème global
    const result = await db.collection("site_settings").updateOne(
      { key: "global_theme" },
      {
        $set: {
          value: theme,
          updated_at: new Date(),
          updated_by: ObjectId(userId),
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Thème global mis à jour avec succès",
      theme: theme,
    });
  } catch (error) {
    console.error("Erreur POST theme global:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});
```

---

## 🔄 Initialisation

### Script d'initialisation

Exécuter une seule fois pour créer le thème par défaut :

```javascript
// Initialisation MongoDB
db.site_settings.insertOne({
  key: "global_theme",
  value: "medieval",
  updated_at: new Date(),
  updated_by: null,
});

// Vérification
db.site_settings.find({ key: "global_theme" }).pretty();
```

---

## 🧪 Tests

### Test GET `/api/theme` (public)

```bash
curl -X GET \
  https://believable-spontaneity-production.up.railway.app/api/theme
```

**Réponse attendue** :

```json
{
  "success": true,
  "theme": "medieval"
}
```

### Test POST `/api/theme` (admin)

```bash
curl -X POST \
  https://believable-spontaneity-production.up.railway.app/api/theme \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"theme": "classic"}'
```

**Réponse attendue** :

```json
{
  "success": true,
  "message": "Thème global mis à jour avec succès",
  "theme": "classic"
}
```

---

## 📱 Comportement Frontend

### Chargement du thème

1. **Au démarrage** : Récupère le thème global depuis la DB
2. **Fallback** : Utilise localStorage si erreur DB
3. **Application** : Applique le thème à tout le site

### Modification du thème

1. **Admin uniquement** : Seuls les admins peuvent changer le thème
2. **Sauvegarde** : Thème sauvegardé en DB + localStorage
3. **Application immédiate** : Tous les utilisateurs voient le changement

---

## ✅ Checklist d'implémentation

- [ ] Créer la collection `site_settings`
- [ ] Créer l'endpoint GET `/api/theme` (public)
- [ ] Créer l'endpoint POST `/api/theme` (admin uniquement)
- [ ] Exécuter le script d'initialisation
- [ ] Tester les endpoints
- [ ] Vérifier la validation des thèmes (`medieval` ou `classic`)
- [ ] Vérifier l'authentification admin pour POST

---

## 🎯 Notes importantes

- **Thème par défaut** : `"medieval"` si non défini
- **Validation stricte** : Seuls `"medieval"` et `"classic"` sont acceptés
- **Accès public** : GET est accessible sans authentification
- **Accès admin** : POST nécessite un token admin
- **Global** : Le thème s'applique à tous les utilisateurs
- **Performance** : Requêtes légères, cache possible

---

## 🔄 Migration depuis l'ancien système

Si vous aviez déjà un système de thèmes par utilisateur, vous pouvez migrer :

```javascript
// Supprimer les anciens champs theme des utilisateurs
db.users.updateMany({}, { $unset: { theme: "" } });

// Créer le thème global
db.site_settings.insertOne({
  key: "global_theme",
  value: "medieval",
  updated_at: new Date(),
  updated_by: null,
});
```

---

**Une fois implémenté, le thème global sera appliqué à tous les utilisateurs du site !** 🌍🎨✨
