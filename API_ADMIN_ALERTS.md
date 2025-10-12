# 🚨 API Admin Alerts - Spécifications Backend

## Vue d'ensemble

Lorsque le frontend détecte une erreur critique (erreur serveur 500+, erreur réseau, timeout, etc.), il envoie automatiquement une alerte à l'administrateur via une notification push FCM.

## Endpoint : POST /api/alerts/critical

### Description

Reçoit une alerte d'erreur critique du frontend et envoie une notification push à l'administrateur spécifié.

### Authentification

❌ **Aucune authentification requise**

Cet endpoint doit être accessible sans authentification car il est appelé lorsque l'API rencontre des problèmes. Si l'authentification échoue, l'alerte ne pourrait pas être envoyée.

⚠️ **Important** : Limiter le taux de requêtes (rate limiting) pour éviter le spam. Maximum 5 alertes par minute par IP.

---

## Request

### Headers

```
Content-Type: application/json
ngrok-skip-browser-warning: true
```

### Body

```json
{
  "admin_email": "mathiascoutant@icloud.com",
  "error_type": "SERVER_ERROR" | "NETWORK_ERROR" | "CONNECTION_ERROR",
  "error_message": "Description de l'erreur",
  "endpoint_failed": "https://api.example.com/api/connexion",
  "timestamp": "2025-10-12T14:35:00.000Z",
  "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7...)"
}
```

### Champs détaillés

| Champ             | Type   | Description                                                         |
| ----------------- | ------ | ------------------------------------------------------------------- |
| `admin_email`     | string | Email de l'admin à notifier                                         |
| `error_type`      | string | Type d'erreur : `SERVER_ERROR`, `NETWORK_ERROR`, `CONNECTION_ERROR` |
| `error_message`   | string | Message détaillé de l'erreur                                        |
| `endpoint_failed` | string | URL de l'endpoint qui a échoué                                      |
| `timestamp`       | string | Date/heure ISO 8601 de l'erreur                                     |
| `user_agent`      | string | User-Agent du navigateur de l'utilisateur                           |

---

## Response

### Succès (200 OK)

```json
{
  "success": true,
  "message": "Alerte envoyée à l'administrateur",
  "notification_sent": true
}
```

### Erreur - Rate limit dépassé (429 Too Many Requests)

```json
{
  "error": true,
  "message": "Trop d'alertes envoyées. Veuillez patienter.",
  "retry_after": 60
}
```

### Erreur - Admin non trouvé (404 Not Found)

```json
{
  "error": true,
  "message": "Administrateur non trouvé ou aucun token FCM enregistré"
}
```

### Erreur - Validation échouée (400 Bad Request)

```json
{
  "error": true,
  "message": "Champs manquants ou invalides",
  "missing_fields": ["admin_email", "error_type"]
}
```

---

## Logique Backend

### 1. Valider les champs requis

```go
// Vérifier que tous les champs requis sont présents
required := []string{"admin_email", "error_type", "error_message", "endpoint_failed"}
for _, field := range required {
    if request[field] == "" {
        return 400, "Champ manquant: " + field
    }
}
```

### 2. Rate limiting

```go
// Limiter à 5 alertes par minute par IP
clientIP := c.IP()
key := "alert_rate_limit:" + clientIP

count := redis.Get(key)
if count >= 5 {
    return 429, "Trop d'alertes envoyées"
}

redis.Incr(key)
redis.Expire(key, 60) // Expire après 60 secondes
```

### 3. Récupérer le token FCM de l'admin

```go
// Récupérer tous les tokens FCM de l'admin
tokens := db.FindFCMTokensByEmail("mathiascoutant@icloud.com")

if len(tokens) == 0 {
    return 404, "Aucun token FCM trouvé pour cet admin"
}
```

### 4. Construire et envoyer la notification FCM

#### Format de la notification

```go
notification := map[string]interface{}{
    "data": map[string]string{
        "type": "critical_error",
        "title": "🚨 Alerte Critique - Site",
        "body": fmt.Sprintf("%s: %s", errorType, errorMessage),
        "error_type": errorType,
        "endpoint": endpointFailed,
        "timestamp": timestamp,
        "click_action": "https://mathiascoutant.github.io/premierdelan/maintenance",
    },
}
```

⚠️ **Important** : Utiliser uniquement `data`, PAS `notification`, pour éviter le "from ..." automatique de Firebase.

#### Types d'erreurs et messages

| error_type         | Titre               | Description                        |
| ------------------ | ------------------- | ---------------------------------- |
| `SERVER_ERROR`     | 🚨 Erreur Serveur   | Erreur HTTP 500+                   |
| `NETWORK_ERROR`    | 🚨 Erreur Réseau    | Impossible de contacter le serveur |
| `CONNECTION_ERROR` | 🚨 Erreur Connexion | Failed to fetch / CORS / Timeout   |

#### Code Go complet

```go
package handlers

import (
    "context"
    "encoding/json"
    "fmt"
    "time"

    firebase "firebase.google.com/go/v4"
    "firebase.google.com/go/v4/messaging"
    "github.com/gofiber/fiber/v2"
)

type CriticalAlertRequest struct {
    AdminEmail     string `json:"admin_email"`
    ErrorType      string `json:"error_type"`
    ErrorMessage   string `json:"error_message"`
    EndpointFailed string `json:"endpoint_failed"`
    Timestamp      string `json:"timestamp"`
    UserAgent      string `json:"user_agent"`
}

func SendCriticalAlert(c *fiber.Ctx) error {
    var req CriticalAlertRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{
            "error":   true,
            "message": "Données invalides",
        })
    }

    // Validation
    if req.AdminEmail == "" || req.ErrorType == "" || req.ErrorMessage == "" {
        return c.Status(400).JSON(fiber.Map{
            "error":   true,
            "message": "Champs manquants",
        })
    }

    // Rate limiting (exemple simple, utilisez Redis en production)
    clientIP := c.IP()
    // TODO: Implémenter rate limiting avec Redis

    // Récupérer les tokens FCM de l'admin
    tokens, err := db.GetFCMTokensByEmail(req.AdminEmail)
    if err != nil || len(tokens) == 0 {
        return c.Status(404).JSON(fiber.Map{
            "error":   true,
            "message": "Admin non trouvé ou aucun token FCM",
        })
    }

    // Construire la notification
    title := "🚨 Alerte Critique - Site"
    body := fmt.Sprintf("%s sur %s", req.ErrorMessage, req.EndpointFailed)

    // Message FCM (data-only pour éviter "from ...")
    message := &messaging.MulticastMessage{
        Data: map[string]string{
            "type":        "critical_error",
            "title":       title,
            "body":        body,
            "error_type":  req.ErrorType,
            "endpoint":    req.EndpointFailed,
            "timestamp":   req.Timestamp,
            "user_agent":  req.UserAgent,
            "click_action": "https://mathiascoutant.github.io/premierdelan/maintenance",
        },
        Tokens: tokens,
    }

    // Envoyer via FCM
    ctx := context.Background()
    response, err := firebaseApp.Messaging(ctx).SendMulticast(ctx, message)

    if err != nil {
        fmt.Println("Erreur FCM:", err)
        return c.Status(500).JSON(fiber.Map{
            "error":   true,
            "message": "Erreur lors de l'envoi de la notification",
        })
    }

    fmt.Printf("✅ Alerte envoyée: %d/%d succès\n", response.SuccessCount, len(tokens))

    return c.JSON(fiber.Map{
        "success":          true,
        "message":          "Alerte envoyée à l'administrateur",
        "notification_sent": true,
        "tokens_sent":      len(tokens),
        "success_count":    response.SuccessCount,
    })
}
```

---

## Service Worker - Gestion de la notification

Le Service Worker côté frontend doit gérer l'affichage de cette notification.

### Dans `public/firebase-messaging-sw.js`

```javascript
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json().data;

  // Si c'est une alerte critique
  if (data.type === "critical_error") {
    const notificationOptions = {
      body: data.body,
      icon: "/premierdelan/icon-192x192.png",
      badge: "/premierdelan/icon-192x192.png",
      tag: "critical-error",
      requireInteraction: true, // La notification reste jusqu'à ce qu'on clique
      vibrate: [200, 100, 200, 100, 200], // Pattern de vibration
      data: {
        url: data.click_action,
        type: data.type,
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title, notificationOptions)
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
```

---

## Logging et Monitoring

### Base de données - Table `admin_alerts`

Enregistrez chaque alerte envoyée pour un historique :

```sql
CREATE TABLE admin_alerts (
  id VARCHAR(255) PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  error_type VARCHAR(50) NOT NULL,
  error_message TEXT NOT NULL,
  endpoint_failed TEXT NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMP NOT NULL,
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_email (admin_email),
  INDEX idx_timestamp (timestamp)
);
```

### Monitoring

- Compter le nombre d'alertes par type d'erreur
- Détecter les pics d'erreurs (plus de 10 alertes en 5 minutes = problème grave)
- Envoyer une alerte EMAIL si trop d'alertes push échouent

---

## Exemple de Test

### Test avec curl

```bash
curl -X POST https://believable-spontaneity-production.up.railway.app/api/alerts/critical \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "admin_email": "mathiascoutant@icloud.com",
    "error_type": "SERVER_ERROR",
    "error_message": "Erreur serveur HTTP 500",
    "endpoint_failed": "https://api.example.com/api/connexion",
    "timestamp": "2025-10-12T14:35:00.000Z",
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7...)"
  }'
```

### Réponse attendue

```json
{
  "success": true,
  "message": "Alerte envoyée à l'administrateur",
  "notification_sent": true,
  "tokens_sent": 1,
  "success_count": 1
}
```

---

## Sécurité

### Rate Limiting

- ✅ Maximum 5 alertes par minute par IP
- ✅ Maximum 50 alertes par heure par IP
- ✅ Bannir temporairement les IPs abusives (1 heure)

### Validation

- ✅ Vérifier que `admin_email` est dans une liste d'admins autorisés
- ✅ Valider le format de `timestamp` (ISO 8601)
- ✅ Limiter la longueur des champs (ex: `error_message` max 500 caractères)

### CORS

Autoriser uniquement vos domaines :

```go
app.Use(cors.New(cors.Config{
    AllowOrigins: "http://localhost:3001, https://mathiascoutant.github.io",
}))
```

---

## Résumé

✅ **Endpoint** : `POST /api/alerts/critical`  
✅ **Auth** : Aucune (avec rate limiting)  
✅ **Notification** : FCM data-only pour éviter "from ..."  
✅ **Logging** : Table `admin_alerts` pour historique  
✅ **Sécurité** : Rate limiting + validation stricte
