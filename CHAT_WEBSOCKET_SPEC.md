# 🔌 Spécification - WebSocket pour le Chat en Temps Réel

## 📋 Vue d'ensemble

Système de WebSocket pour la communication en temps réel entre admins, évitant le polling et réduisant drastiquement le nombre de requêtes.

---

## 🎯 Avantages du WebSocket

- ✅ **Temps réel** : Messages instantanés sans délai
- ✅ **Efficacité** : Pas de polling toutes les secondes
- ✅ **Scalabilité** : Réduit la charge serveur de 99%
- ✅ **UX améliorée** : Expérience fluide comme WhatsApp

---

## 🔧 Configuration Backend (Python Flask/FastAPI)

### Installation des dépendances

```bash
pip install websockets
```

### Code Backend (WebSocket Natif avec FastAPI)

**Note** : Le backend utilise WebSocket natif (pas Socket.IO) à l'URL `/ws/chat`

```python
from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import jwt

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'https://mathiascoutant.github.io'])
socketio = SocketIO(app, cors_allowed_origins=['http://localhost:3000', 'https://mathiascoutant.github.io'])

# Stockage des connexions actives
active_connections = {}  # {user_id: socket_id}

@socketio.on('connect')
def handle_connect():
    """Connexion d'un client WebSocket"""
    print(f"✅ Client connecté: {request.sid}")

@socketio.on('authenticate')
def handle_authenticate(data):
    """Authentification via JWT"""
    try:
        token = data.get('token')
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded['user_id']

        # Enregistrer la connexion
        active_connections[user_id] = request.sid

        # Joindre une room personnelle pour cet utilisateur
        join_room(f"user_{user_id}")

        print(f"✅ Utilisateur {user_id} authentifié")
        emit('authenticated', {'success': True})

    except Exception as e:
        print(f"❌ Erreur d'authentification: {str(e)}")
        emit('error', {'message': 'Authentification échouée'})

@socketio.on('disconnect')
def handle_disconnect():
    """Déconnexion d'un client"""
    # Retirer de active_connections
    for user_id, sid in list(active_connections.items()):
        if sid == request.sid:
            del active_connections[user_id]
            print(f"❌ Utilisateur {user_id} déconnecté")
            break

@socketio.on('join_conversation')
def handle_join_conversation(data):
    """Rejoindre une conversation spécifique"""
    conversation_id = data.get('conversation_id')
    join_room(f"conversation_{conversation_id}")
    print(f"👤 Client a rejoint la conversation {conversation_id}")

@socketio.on('leave_conversation')
def handle_leave_conversation(data):
    """Quitter une conversation"""
    conversation_id = data.get('conversation_id')
    leave_room(f"conversation_{conversation_id}")
    print(f"👋 Client a quitté la conversation {conversation_id}")

@socketio.on('send_message')
def handle_send_message(data):
    """Recevoir un message du client et le diffuser"""
    conversation_id = data.get('conversation_id')
    message = data.get('message')
    sender_id = data.get('sender_id')

    # Diffuser le message à tous les participants de la conversation
    emit('new_message', {
        'conversation_id': conversation_id,
        'message': message
    }, room=f"conversation_{conversation_id}", include_self=False)

    print(f"💬 Message diffusé dans la conversation {conversation_id}")

# Fonction helper pour notifier un utilisateur spécifique
def notify_user(user_id, event_name, data):
    """Envoie un événement à un utilisateur spécifique"""
    if user_id in active_connections:
        socketio.emit(event_name, data, room=f"user_{user_id}")
        return True
    return False

# Exemple d'utilisation après avoir sauvegardé un message en DB
def after_save_message(conversation_id, message_data, recipient_id):
    """Après avoir sauvegardé un message, notifier via WebSocket"""
    # Notifier le destinataire du nouveau message
    notify_user(recipient_id, 'new_message', {
        'conversation_id': str(conversation_id),
        'message': message_data
    })

# Exemple d'utilisation après une invitation
def after_create_invitation(invitation_data, recipient_id):
    """Après avoir créé une invitation, notifier via WebSocket"""
    # Notifier le destinataire de la nouvelle invitation
    notify_user(recipient_id, 'new_invitation', {
        'invitation': invitation_data
    })
```

---

## 🌐 URL WebSocket

**URL de connexion** : `wss://believable-spontaneity-production.up.railway.app`

**Namespace** : `/chat` (optionnel)

**URL complète** : `wss://believable-spontaneity-production.up.railway.app/socket.io/`

---

## 📡 Événements WebSocket

### Événements Client → Serveur

| Événement            | Description                | Données                                                         |
| -------------------- | -------------------------- | --------------------------------------------------------------- |
| `connect`            | Connexion initiale         | -                                                               |
| `authenticate`       | Authentification JWT       | `{token: string}`                                               |
| `join_conversation`  | Rejoindre une conversation | `{conversation_id: string}`                                     |
| `leave_conversation` | Quitter une conversation   | `{conversation_id: string}`                                     |
| `send_message`       | Envoyer un message         | `{conversation_id: string, message: object, sender_id: string}` |

### Événements Serveur → Client

| Événement             | Description               | Données                                      |
| --------------------- | ------------------------- | -------------------------------------------- |
| `authenticated`       | Authentification réussie  | `{success: true}`                            |
| `new_message`         | Nouveau message reçu      | `{conversation_id: string, message: object}` |
| `new_invitation`      | Nouvelle invitation reçue | `{invitation: object}`                       |
| `invitation_accepted` | Invitation acceptée       | `{conversation: object}`                     |
| `error`               | Erreur                    | `{message: string}`                          |

---

## 💻 Intégration dans les Endpoints

### POST `/api/admin/chat/conversations/:id/messages`

```python
@app.route('/api/admin/chat/conversations/<conversation_id>/messages', methods=['POST'])
@require_admin
def send_chat_message(conversation_id):
    data = request.get_json()
    content = data.get('content')

    # Sauvegarder le message
    message = {
        "conversation_id": ObjectId(conversation_id),
        "sender_id": ObjectId(current_user_id),
        "content": content,
        "created_at": datetime.utcnow(),
        "is_read": False
    }

    result = db.messages.insert_one(message)
    message['id'] = str(result.inserted_id)
    message['sender_id'] = str(message['sender_id'])
    message['conversation_id'] = str(message['conversation_id'])

    # Récupérer l'autre participant
    conversation = db.conversations.find_one({"_id": ObjectId(conversation_id)})
    recipient_id = None
    for participant in conversation['participants']:
        if str(participant['userId']) != str(current_user_id):
            recipient_id = str(participant['userId'])
            break

    # 🔌 NOTIFIER VIA WEBSOCKET
    if recipient_id:
        notify_user(recipient_id, 'new_message', {
            'conversation_id': str(conversation_id),
            'message': message
        })

    return jsonify({"success": True, "data": {"message": message}})
```

### POST `/api/admin/chat/invitations`

```python
@app.route('/api/admin/chat/invitations', methods=['POST'])
@require_admin
def create_chat_invitation():
    data = request.get_json()
    to_user_id = data.get('to_user_id')
    message = data.get('message', '')

    # Créer l'invitation
    invitation = {
        "from_user_id": ObjectId(current_user_id),
        "to_user_id": ObjectId(to_user_id),
        "message": message,
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    result = db.chat_invitations.insert_one(invitation)

    # Récupérer les infos du demandeur
    from_user = db.users.find_one({"_id": ObjectId(current_user_id)})

    invitation_data = {
        "id": str(result.inserted_id),
        "from_user": {
            "id": str(current_user_id),
            "firstname": from_user['firstname'],
            "lastname": from_user['lastname'],
            "email": from_user['email']
        },
        "message": message,
        "status": "pending"
    }

    # 🔌 NOTIFIER VIA WEBSOCKET
    notify_user(to_user_id, 'new_invitation', {
        'invitation': invitation_data
    })

    return jsonify({"success": True, "data": {"invitation_id": str(result.inserted_id)}})
```

### PUT `/api/admin/chat/invitations/:id/respond`

```python
@app.route('/api/admin/chat/invitations/<invitation_id>/respond', methods=['PUT'])
@require_admin
def respond_to_invitation(invitation_id):
    data = request.get_json()
    action = data.get('action')  # 'accept' or 'reject'

    invitation = db.chat_invitations.find_one({"_id": ObjectId(invitation_id)})

    if action == 'accept':
        # Créer la conversation
        conversation = {
            "participants": [
                {"userId": invitation['from_user_id'], "role": "admin", "status": "active"},
                {"userId": invitation['to_user_id'], "role": "admin", "status": "active"}
            ],
            "status": "accepted",
            "created_at": datetime.utcnow()
        }

        conv_result = db.conversations.insert_one(conversation)

        # Mettre à jour l'invitation
        db.chat_invitations.update_one(
            {"_id": ObjectId(invitation_id)},
            {"$set": {"status": "accepted"}}
        )

        # 🔌 NOTIFIER LE DEMANDEUR VIA WEBSOCKET
        notify_user(str(invitation['from_user_id']), 'invitation_accepted', {
            'conversation_id': str(conv_result.inserted_id),
            'participant_id': str(current_user_id)
        })

        return jsonify({"success": True, "data": {"conversation_id": str(conv_result.inserted_id)}})

    else:  # reject
        db.chat_invitations.update_one(
            {"_id": ObjectId(invitation_id)},
            {"$set": {"status": "rejected"}}
        )

        # 🔌 NOTIFIER LE DEMANDEUR VIA WEBSOCKET
        notify_user(str(invitation['from_user_id']), 'invitation_rejected', {
            'invitation_id': str(invitation_id)
        })

        return jsonify({"success": True})
```

---

## 🧪 Test WebSocket

### Test avec Python

```python
import socketio

# Créer un client
sio = socketio.Client()

@sio.on('connect')
def on_connect():
    print('✅ Connecté au serveur WebSocket')
    # S'authentifier
    sio.emit('authenticate', {'token': 'YOUR_JWT_TOKEN'})

@sio.on('authenticated')
def on_authenticated(data):
    print('🔑 Authentifié:', data)
    # Rejoindre une conversation
    sio.emit('join_conversation', {'conversation_id': 'conv_123'})

@sio.on('new_message')
def on_new_message(data):
    print('💬 Nouveau message:', data)

@sio.on('new_invitation')
def on_new_invitation(data):
    print('📨 Nouvelle invitation:', data)

# Se connecter
sio.connect('http://localhost:5000')
sio.wait()
```

---

## ✅ Checklist d'implémentation

- [ ] Installer `flask-socketio` et `python-socketio`
- [ ] Créer le serveur WebSocket avec CORS
- [ ] Implémenter l'événement `authenticate`
- [ ] Implémenter l'événement `join_conversation`
- [ ] Implémenter l'événement `send_message`
- [ ] Intégrer WebSocket dans POST `/api/admin/chat/conversations/:id/messages`
- [ ] Intégrer WebSocket dans POST `/api/admin/chat/invitations`
- [ ] Intégrer WebSocket dans PUT `/api/admin/chat/invitations/:id/respond`
- [ ] Tester la connexion WebSocket
- [ ] Tester l'envoi/réception de messages en temps réel

---

## 🔗 URLs

**Development** : `ws://localhost:5000/socket.io/`

**Production** : `wss://believable-spontaneity-production.up.railway.app/socket.io/`

---

## 💡 Notes importantes

- **Authentification** : Le token JWT doit être envoyé via l'événement `authenticate`
- **Rooms** : Chaque utilisateur a une room personnelle `user_{id}`
- **Conversations** : Chaque conversation a une room `conversation_{id}`
- **Fallback** : Si WebSocket échoue, le frontend peut utiliser le polling
- **Reconnexion** : Implémenter la reconnexion automatique côté client

---

**Une fois implémenté, les messages seront instantanés comme WhatsApp !** 🚀💬⚡
