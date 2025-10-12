# Fix MongoDB - Événement vide

## Via Railway UI

1. Va sur Railway → MongoDB → Collection `events`
2. Clique sur l'événement vide
3. Supprime-le (icône poubelle)
4. Clique sur "+ Row" et crée un nouvel événement avec les bonnes données

---

## Via mongosh (ligne de commande)

```bash
# Connecte-toi
mongosh "mongodb://mongo:********@hopper.proxy.rlwy.net:59846"

# Utilise la base de données
use premierdelan

# Supprime l'événement vide
db.events.deleteOne({ "_id": ObjectId("68ec212a5de9f4bd014c5ec6") })

# Crée un nouvel événement valide
db.events.insertOne({
  "titre": "Réveillon 2026",
  "date": new Date("2026-01-01T00:00:00Z"),
  "description": "Soirée médiévale du Nouvel An à Chamouillac",
  "capacite": 100,
  "inscrits": 0,
  "photos_count": 0,
  "statut": "ouvert",
  "lieu": "Chamouillac",
  "code_soiree": "PREMIER2026",
  "notification_sent_opening": false,
  "date_ouverture_inscription": new Date("2025-10-13T10:00:00Z"),
  "date_fermeture_inscription": new Date("2025-12-31T23:59:00Z"),
  "created_at": new Date(),
  "updated_at": new Date()
})

# Vérifie
db.events.find().pretty()

# Quitte
exit
```

---

## Vérification

Une fois fait, teste :

```bash
curl https://believable-spontaneity-production.up.railway.app/api/evenements/public
```

Tu devrais voir l'événement avec tous les champs remplis !

Puis va sur https://mathiascoutant.github.io/premierdelan/ et le site devrait fonctionner ! 🎉
