# 🛠️ Mode Maintenance - Documentation

## Vue d'ensemble

Le frontend détecte automatiquement les problèmes de connexion API et redirige l'utilisateur vers une page de maintenance élégante.

## Détection des erreurs

### Erreurs qui déclenchent la page de maintenance :

1. **Erreur serveur (HTTP 500+)**

   - Status codes : 500, 502, 503, 504, etc.
   - Indique un problème côté serveur

2. **Erreur réseau (Network errors)**

   - `Failed to fetch`
   - `NetworkError`
   - `Network request failed`
   - Timeout
   - DNS failure
   - Serveur inaccessible

3. **Erreur CORS non résolue**
   - Si le backend ne répond pas correctement aux requêtes CORS

### Erreurs qui NE déclenchent PAS la maintenance :

- **Erreurs HTTP 4xx (400-499)** : erreurs métier normales
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
  - Etc.

Ces erreurs sont gérées normalement par l'application avec des messages d'erreur appropriés.

## Page de maintenance

**Route** : `/maintenance`

**Design** :

- Style médiéval cohérent avec le reste du site
- Icône de bouclier 🛡
- Message clair : "Site en Maintenance"
- Bouton "Réessayer" pour retenter la connexion
- Bouton "Contacter un Admin" (mailto:admin@premierdelan.com)
- Code d'erreur affiché : `API_UNAVAILABLE`

## Fonctionnement technique

### Dans `app/config/api.ts` :

```typescript
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      // ... configuration ...
    });

    // Erreur serveur (500+) -> Alerte admin + Maintenance
    if (response.status >= 500) {
      redirectToMaintenance("SERVER_ERROR", `HTTP ${response.status}`, endpoint);
    }

    // Erreur client (400-499) -> Erreur métier normale
    if (!response.ok) {
      throw new Error(...);
    }

    return response.json();
  } catch (error) {
    // Erreur réseau -> Alerte admin + Maintenance
    if (/* détection erreur réseau */) {
      redirectToMaintenance("NETWORK_ERROR", error.message, endpoint);
    }

    throw error;
  }
}
```

### Alerte Admin Automatique

Avant de rediriger vers la page de maintenance, le système tente automatiquement d'envoyer une **notification push à l'administrateur** :

```typescript
async function sendAdminAlert(errorType, errorMessage, endpoint) {
  // Appel à POST /api/alerts/critical
  await fetch(`${API_URL}/api/alerts/critical`, {
    method: "POST",
    body: JSON.stringify({
      admin_email: "mathiascoutant@icloud.com",
      error_type: errorType,
      error_message: errorMessage,
      endpoint_failed: endpoint,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

**Types d'alertes envoyées** :

- 🚨 `SERVER_ERROR` : Erreur serveur HTTP 500+
- 🚨 `NETWORK_ERROR` : Impossible de contacter le serveur
- 🚨 `CONNECTION_ERROR` : Failed to fetch / CORS / Timeout

L'admin reçoit une notification push sur tous ses appareils enregistrés avec :

- Le type d'erreur
- L'endpoint qui a échoué
- Le timestamp
- Un lien pour consulter la page de maintenance

**Note** : Si l'API est complètement down, l'alerte ne pourra pas être envoyée, mais le frontend redirigera quand même vers `/maintenance`.

### Protection contre les boucles infinies :

La fonction `redirectToMaintenance()` vérifie si l'utilisateur est déjà sur `/maintenance` avant de rediriger.

```typescript
function redirectToMaintenance() {
  if (!window.location.pathname.includes("/maintenance")) {
    window.location.href = "/maintenance";
  }
}
```

## Recommandations Backend

### 1. Codes de statut HTTP appropriés

Assurez-vous que votre backend renvoie les bons codes HTTP :

- **200-299** : Succès
- **400-499** : Erreurs client (validation, authentification, etc.)
- **500-599** : Erreurs serveur (problèmes internes)

### 2. CORS configuré correctement

Le backend doit accepter :

- Origine : `http://localhost:3001` (dev) et `https://mathiascoutant.github.io` (prod)
- Headers : `ngrok-skip-browser-warning`, `Content-Type`, `Authorization`
- Methods : `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

### 3. Messages d'erreur cohérents

Format JSON recommandé pour les erreurs :

```json
{
  "error": true,
  "message": "Description de l'erreur",
  "code": "ERROR_CODE"
}
```

### 4. Health check endpoint (optionnel)

Créer un endpoint `/api/health` qui retourne toujours 200 OK si le serveur est opérationnel.

Le frontend pourrait l'utiliser pour vérifier périodiquement si le backend est de nouveau disponible.

```json
GET /api/health
Response: 200 OK
{
  "status": "ok",
  "timestamp": "2025-10-12T14:30:00Z"
}
```

## Testez la page de maintenance

### 1. En coupant le backend

```bash
# Arrêter votre serveur backend
# Le frontend détectera l'erreur réseau et redirigera vers /maintenance
```

### 2. En simulant une erreur 500

Créez temporairement un endpoint qui renvoie toujours 500 :

```go
// Dans votre backend (exemple Go)
app.Get("/api/test-error", func(c *fiber.Ctx) error {
    return c.Status(500).JSON(fiber.Map{
        "message": "Erreur serveur simulée",
    })
})
```

Puis appelez cet endpoint depuis le frontend.

### 3. En accédant directement

Naviguez vers `http://localhost:3001/maintenance` pour voir la page.

## Personnalisation

### Modifier l'email de contact

Dans `app/maintenance/page.tsx`, ligne 57 :

```tsx
<Link href="mailto:admin@premierdelan.com" ...>
```

Changez l'email par celui de votre administrateur.

### Modifier le design

Vous pouvez personnaliser la page de maintenance dans `app/maintenance/page.tsx` tout en conservant le thème médiéval.

## Notes importantes

- ✅ La page de maintenance est **responsive** (mobile, tablette, desktop)
- ✅ Le bouton "Réessayer" recharge simplement la page d'accueil
- ✅ Aucune boucle infinie : la redirection ne se fait pas si on est déjà sur `/maintenance`
- ✅ Les logs d'erreur restent dans la console pour le debugging

## En production

Sur GitHub Pages avec `output: 'export'`, la page `/maintenance` sera une page statique qui fonctionne même si le backend est complètement down.

---

## Système d'Alerte Admin

### Vue d'ensemble

Quand une erreur critique est détectée, le frontend envoie automatiquement une notification push à l'administrateur via FCM.

### Implémentation Backend

Le backend doit implémenter l'endpoint `POST /api/alerts/critical` pour recevoir les alertes et envoyer les notifications push.

**📄 Voir les spécifications complètes** : [API_ADMIN_ALERTS.md](./API_ADMIN_ALERTS.md)

### Ce que l'admin reçoit

**Notification push** :

```
🚨 Alerte Critique - Site
Erreur serveur HTTP 500 sur https://api.../api/connexion
```

**Détails dans la notification** :

- Type d'erreur (SERVER_ERROR, NETWORK_ERROR, CONNECTION_ERROR)
- Endpoint qui a échoué
- Timestamp de l'erreur
- User-Agent de l'utilisateur impacté
- Lien vers la page de maintenance

### Avantages

✅ L'admin est **immédiatement alerté** en cas de problème  
✅ Il peut **réagir rapidement** pour rétablir le service  
✅ **Historique des erreurs** stocké en base de données  
✅ **Rate limiting** pour éviter le spam de notifications  
✅ Fonctionne sur **tous les appareils** où l'admin a activé les notifications

### Rate Limiting

Pour éviter le spam :

- Maximum **5 alertes par minute** par IP
- Maximum **50 alertes par heure** par IP
- Les IPs abusives sont bannies temporairement (1 heure)

### Backend Requirements

Le backend doit :

1. ✅ Implémenter `POST /api/alerts/critical` (voir API_ADMIN_ALERTS.md)
2. ✅ Récupérer les tokens FCM de l'admin
3. ✅ Envoyer une notification push via Firebase Cloud Messaging
4. ✅ Logger l'alerte dans la base de données
5. ✅ Implémenter un rate limiting approprié
