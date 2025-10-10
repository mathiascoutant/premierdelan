# 🔔 API Backend - Notifications Automatiques d'Ouverture d'Inscriptions

Cette documentation spécifie comment envoyer automatiquement des notifications push à tous les utilisateurs quand les inscriptions d'un événement s'ouvrent.

---

## 🎯 OBJECTIF

Quand la `date_ouverture_inscription` d'un événement est atteinte :
1. ✅ Envoyer une notification push à **tous les utilisateurs** (qui ont activé les notifications)
2. ✅ La notification affiche le titre de l'événement
3. ✅ Clic sur la notification → Redirection vers la page d'accueil section événements (`/#evenements`)

---

## ⏰ SYSTÈME DE VÉRIFICATION (CRON JOB)

### **Option 1 : Cron job toutes les minutes**

```go
// Vérifier chaque minute si des événements doivent ouvrir leurs inscriptions
func checkEventOpenings() {
    now := time.Now()
    
    // Trouver les événements dont l'ouverture est dans les 2 dernières minutes
    var events []Event
    db.Where("date_ouverture_inscription <= ? AND date_ouverture_inscription > ? AND notification_sent_opening = false", 
        now, 
        now.Add(-2 * time.Minute),
    ).Find(&events)
    
    for _, event := range events {
        // Envoyer la notification à tous les utilisateurs
        sendEventOpeningNotification(event)
        
        // Marquer comme envoyé pour ne pas re-envoyer
        db.Model(&event).Update("notification_sent_opening", true)
    }
}

// Lancer le cron job
func main() {
    c := cron.New()
    c.AddFunc("@every 1m", checkEventOpenings)
    c.Start()
}
```

### **Ajouter une colonne pour tracker l'envoi** :

```sql
ALTER TABLE evenements 
ADD COLUMN notification_sent_opening BOOLEAN DEFAULT false;
```

---

## 📨 ENVOI DES NOTIFICATIONS

### **Fonction d'envoi** :

```go
func sendEventOpeningNotification(event Event) {
    // Récupérer tous les utilisateurs avec un FCM token
    var users []User
    db.Where("fcm_token IS NOT NULL AND fcm_token != ''").Find(&users)
    
    if len(users) == 0 {
        log.Println("Aucun utilisateur avec notifications activées")
        return
    }
    
    // Préparer le message FCM (DATA-ONLY pour éviter "from...")
    for _, user := range users {
        message := &messaging.Message{
            Token: user.FCMToken,
            Data: map[string]string{
                "title":   "🎉 Inscriptions ouvertes !",
                "message": fmt.Sprintf("Les inscriptions pour '%s' sont maintenant ouvertes !", event.Titre),
                "action":  "event_opening",
                "url":     "/#evenements",
                "event_id": event.ID,
            },
        }
        
        // Envoyer via Firebase Admin SDK
        _, err := fcmClient.Send(context.Background(), message)
        if err != nil {
            log.Printf("Erreur envoi notification à %s: %v", user.Email, err)
        }
    }
    
    log.Printf("Notifications d'ouverture envoyées pour l'événement: %s", event.Titre)
}
```

---

## 🔧 SERVICE WORKER (FRONTEND - DÉJÀ IMPLÉMENTÉ)

Le service worker `public/firebase-messaging-sw.js` gère déjà les notifications et les clics.

Il faut juste s'assurer qu'il gère bien le champ `url` :

```javascript
// public/firebase-messaging-sw.js (déjà en place)
self.addEventListener('push', function(event) {
  const data = event.data.json().data;
  
  const notificationOptions = {
    body: data.message,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: data.url || '/'  // ← Stocke l'URL pour le clic
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.openWindow(urlToOpen)  // ← Ouvre l'URL stockée
  );
});
```

---

## 📋 STRUCTURE COMPLÈTE DU MESSAGE FCM

### **Format data-only (pour éviter "from...")** :

```json
{
  "token": "user_fcm_token",
  "data": {
    "title": "🎉 Inscriptions ouvertes !",
    "message": "Les inscriptions pour 'Réveillon 2026' sont maintenant ouvertes !",
    "action": "event_opening",
    "url": "/#evenements",
    "event_id": "event-456"
  }
}
```

### **Ce qui s'affiche sur le téléphone** :

```
┌────────────────────────────────┐
│ 🎉 Inscriptions ouvertes !     │
│                                │
│ Les inscriptions pour          │
│ 'Réveillon 2026' sont          │
│ maintenant ouvertes !          │
│                                │
│ (Clic pour voir)               │
└────────────────────────────────┘
```

### **Après clic** :
```
1. Notification se ferme
2. Ouvre/Focus le site : https://mathiascoutant.github.io/premierdelan/#evenements
3. Page scroll automatiquement vers la section événements
4. L'événement "Réveillon 2026" est visible avec "S'inscrire" actif
```

---

## 🔄 WORKFLOW COMPLET

### **Avant l'ouverture** :
```
Date actuelle : 30/09/2025 10:00
Ouverture inscription : 01/10/2025 10:00

→ Cron job tourne toutes les minutes
→ Rien à faire encore
```

### **À l'ouverture exacte** :
```
Date actuelle : 01/10/2025 10:00
Ouverture inscription : 01/10/2025 10:00

→ Cron job détecte que c'est le moment
→ Récupère tous les utilisateurs avec FCM token
→ Envoie la notification à chacun :
  "🎉 Inscriptions ouvertes !"
  "Les inscriptions pour 'Réveillon 2026' sont maintenant ouvertes !"
→ Marque l'événement : notification_sent_opening = true
```

### **Après l'ouverture** :
```
Date actuelle : 01/10/2025 10:05
Ouverture inscription : 01/10/2025 10:00
notification_sent_opening : true

→ Cron job passe (déjà envoyé)
→ Ne re-envoie pas
```

---

## 🛠️ INSTALLATION (BACKEND GO)

### **1. Installer le cron scheduler** :

```bash
go get github.com/robfig/cron/v3
```

### **2. Code complet** :

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    
    "github.com/robfig/cron/v3"
    firebase "firebase.google.com/go/v4"
    "firebase.google.com/go/v4/messaging"
)

var fcmClient *messaging.Client

func initFirebase() {
    app, err := firebase.NewApp(context.Background(), nil)
    if err != nil {
        log.Fatalf("Error initializing Firebase: %v", err)
    }
    
    fcmClient, err = app.Messaging(context.Background())
    if err != nil {
        log.Fatalf("Error getting FCM client: %v", err)
    }
}

func checkEventOpenings() {
    now := time.Now()
    
    var events []Event
    db.Where(`
        date_ouverture_inscription <= ? 
        AND date_ouverture_inscription > ? 
        AND (notification_sent_opening = false OR notification_sent_opening IS NULL)
    `, now, now.Add(-2*time.Minute)).Find(&events)
    
    for _, event := range events {
        log.Printf("Envoi notifications pour: %s", event.Titre)
        sendEventOpeningNotification(event)
        
        db.Model(&event).Update("notification_sent_opening", true)
    }
}

func sendEventOpeningNotification(event Event) {
    var users []User
    db.Where("fcm_token IS NOT NULL AND fcm_token != ''").Find(&users)
    
    if len(users) == 0 {
        return
    }
    
    for _, user := range users {
        message := &messaging.Message{
            Token: user.FCMToken,
            Data: map[string]string{
                "title":    "🎉 Inscriptions ouvertes !",
                "message":  fmt.Sprintf("Les inscriptions pour '%s' sont maintenant ouvertes !", event.Titre),
                "action":   "event_opening",
                "url":      "/#evenements",
                "event_id": event.ID,
            },
        }
        
        _, err := fcmClient.Send(context.Background(), message)
        if err != nil {
            log.Printf("Erreur FCM pour %s: %v", user.Email, err)
        }
    }
}

func main() {
    // ... init DB, etc ...
    
    initFirebase()
    
    // Lancer le cron job
    c := cron.New()
    c.AddFunc("@every 1m", checkEventOpenings) // Toutes les minutes
    c.Start()
    
    log.Println("Cron job notifications démarré (toutes les minutes)")
    
    // ... lancer le serveur HTTP ...
}
```

---

## 📊 TABLE `evenements` MODIFIÉE

```sql
CREATE TABLE evenements (
  id VARCHAR(255) PRIMARY KEY,
  titre VARCHAR(500) NOT NULL,
  date TIMESTAMP NOT NULL,
  date_ouverture_inscription TIMESTAMP,
  date_fermeture_inscription TIMESTAMP,
  notification_sent_opening BOOLEAN DEFAULT false,  -- ⭐ NOUVEAU (tracker envoi)
  capacite INT NOT NULL DEFAULT 50,
  inscrits INT NOT NULL DEFAULT 0,
  statut ENUM('ouvert', 'complet', 'termine') DEFAULT 'ouvert',
  ...
);
```

---

## ⚙️ CONFIGURATION FIREBASE ADMIN SDK

### **Créer une clé de service** :

1. Va dans [Firebase Console](https://console.firebase.google.com/)
2. **Paramètres du projet** → **Comptes de service**
3. **Générer une nouvelle clé privée**
4. Télécharge le fichier JSON

### **Initialiser dans Go** :

```go
import (
    firebase "firebase.google.com/go/v4"
    "google.golang.org/api/option"
)

func initFirebase() {
    opt := option.WithCredentialsFile("path/to/serviceAccountKey.json")
    app, err := firebase.NewApp(context.Background(), nil, opt)
    // ...
}
```

---

## 🔐 SÉCURITÉ

### **Variables d'environnement** :

```bash
FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/serviceAccountKey.json
```

**Important** : Ne JAMAIS commit le fichier `serviceAccountKey.json` dans Git !

---

## 🎯 RÉSUMÉ

### **Backend doit** :
1. ✅ Ajouter colonne `notification_sent_opening` (BOOLEAN)
2. ✅ Installer Firebase Admin SDK
3. ✅ Créer un cron job (toutes les minutes)
4. ✅ Vérifier si `date_ouverture_inscription` est atteinte
5. ✅ Envoyer notification FCM à tous les utilisateurs
6. ✅ Marquer `notification_sent_opening = true`

### **Frontend** (déjà prêt) :
- ✅ Service worker gère les notifications
- ✅ Clic → Redirection vers `/#evenements`
- ✅ Scroll automatique vers la section

### **Message envoyé** :
```
🎉 Inscriptions ouvertes !
Les inscriptions pour 'Réveillon 2026' sont maintenant ouvertes !

[Clic] → Redirection vers /#evenements
```

Tout est documenté dans `API_NOTIFICATIONS_OUVERTURE.md` ! 🚀

