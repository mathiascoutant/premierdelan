# Configuration Backend pour CORS + ngrok

## 🔴 Problème
Les requêtes OPTIONS (preflight) réussissent mais les POST échouent à cause de ngrok gratuit.

## ✅ Solution Backend

### Si vous utilisez Flask (Python)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Configuration CORS COMPLÈTE
CORS(app, 
     origins=[
         "https://mathiascoutant.github.io",
         "http://localhost:3000"
     ],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=[
         "Content-Type", 
         "Authorization", 
         "ngrok-skip-browser-warning"  # ⭐ CRUCIAL
     ],
     expose_headers=["Content-Type"],
     supports_credentials=False  # Important pour éviter complexité CORS
)

@app.route('/api/connexion', methods=['POST', 'OPTIONS'])
def connexion():
    # Répondre aux requêtes OPTIONS (preflight)
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response, 204
    
    # Traiter la requête POST
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Votre logique d'authentification
    # ...
    
    return jsonify({
        'token': 'votre_token_jwt',
        'user': {
            'prenom': 'Jean',
            'nom': 'Dupont',
            'email': email
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=8090)
```

### Si vous utilisez Express (Node.js)

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Configuration CORS COMPLÈTE
app.use(cors({
  origin: [
    'https://mathiascoutant.github.io',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'ngrok-skip-browser-warning'  // ⭐ CRUCIAL
  ],
  credentials: false
}));

app.use(express.json());

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

app.post('/api/connexion', (req, res) => {
  const { email, password } = req.body;
  
  // Votre logique d'authentification
  // ...
  
  res.json({
    token: 'votre_token_jwt',
    user: {
      prenom: 'Jean',
      nom: 'Dupont',
      email: email
    }
  });
});

app.listen(8090, () => {
  console.log('✅ Serveur démarré sur le port 8090');
});
```

## 🧪 Test depuis la Console du Navigateur

Ouvrez https://mathiascoutant.github.io/premierdelan/ et testez dans la console :

```javascript
fetch('https://nia-preinstructive-nola.ngrok-free.dev/api/connexion', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'  // ⭐ CRUCIAL
  },
  body: JSON.stringify({
    email: 'test@email.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Succès:', data))
.catch(err => console.error('❌ Erreur:', err))
```

## 📋 Checklist Backend

- [ ] CORS activé avec `flask-cors` ou `cors`
- [ ] Origin autorisé : `https://mathiascoutant.github.io`
- [ ] Methods autorisés : `POST, OPTIONS`
- [ ] Headers autorisés : `Content-Type, Authorization, ngrok-skip-browser-warning`
- [ ] Route OPTIONS configurée (Flask uniquement)
- [ ] Credentials: false (simplifie CORS)
- [ ] Logs activés pour debug

## 🚀 Lancer ngrok

```bash
ngrok http 8090
```

Puis mettez à jour l'URL dans `app/config/api.ts`.

## ⚠️ Alternative à ngrok gratuit

Si les problèmes persistent, utilisez :
- **Railway** : https://railway.app (gratuit)
- **Render** : https://render.com (gratuit)
- **Fly.io** : https://fly.io (gratuit)
- **Vercel** : pour Next.js API routes

Ces services n'ont pas de page d'avertissement comme ngrok gratuit.

