# 🔐 Configuration Backend - Cloudinary

Cette documentation explique comment configurer le backend Go pour supprimer les médias de Cloudinary.

---

## 📦 Installation de la librairie Cloudinary (Go)

```bash
go get github.com/cloudinary/cloudinary-go/v2
```

---

## ⚙️ Configuration

### **Variables d'environnement**

```bash
CLOUDINARY_CLOUD_NAME=dxwhngg8g
CLOUDINARY_API_KEY=ton_api_key
CLOUDINARY_API_SECRET=ton_api_secret
```

**⚠️ Important** : L'API Secret ne doit **JAMAIS** être exposé côté frontend !

### **Où trouver ces informations ?**

1. Connecte-toi à [Cloudinary Dashboard](https://cloudinary.com/console)
2. Va dans **Settings** → **Access Keys**
3. Copie :
   - **Cloud Name** : `dxwhngg8g`
   - **API Key** : (visible dans le dashboard)
   - **API Secret** : (clique sur "Reveal" pour voir)

---

## 🔧 Code Backend pour la suppression

### **Initialisation de Cloudinary**

```go
package main

import (
    "context"
    "os"
    
    "github.com/cloudinary/cloudinary-go/v2"
    "github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

func initCloudinary() error {
    var err error
    cld, err = cloudinary.NewFromParams(
        os.Getenv("CLOUDINARY_CLOUD_NAME"),
        os.Getenv("CLOUDINARY_API_KEY"),
        os.Getenv("CLOUDINARY_API_SECRET"),
    )
    return err
}
```

### **Fonction de suppression**

```go
func deleteFromCloudinary(publicID string) error {
    ctx := context.Background()
    
    _, err := cld.Upload.Destroy(ctx, uploader.DestroyParams{
        PublicID: publicID,
    })
    
    if err != nil {
        return fmt.Errorf("erreur suppression Cloudinary: %w", err)
    }
    
    return nil
}
```

### **Endpoint DELETE `/api/evenements/{event_id}/medias/{media_id}`**

```go
func deleteMediaHandler(w http.ResponseWriter, r *http.Request) {
    // 1. Récupérer media_id depuis l'URL
    mediaID := chi.URLParam(r, "media_id")
    
    // 2. Récupérer le média depuis la BDD
    var media Media
    err := db.Where("id = ?", mediaID).First(&media).Error
    if err != nil {
        http.Error(w, "Média non trouvé", http.StatusNotFound)
        return
    }
    
    // 3. Vérifier que l'utilisateur est le propriétaire
    userEmail := r.Context().Value("user_email").(string)
    if media.UserEmail != userEmail {
        http.Error(w, "Vous ne pouvez supprimer que vos propres médias", http.StatusForbidden)
        return
    }
    
    // 4. Supprimer de Cloudinary
    err = deleteFromCloudinary(media.StoragePath)
    if err != nil {
        log.Printf("Erreur suppression Cloudinary: %v", err)
        // Continue quand même pour supprimer de la BDD
    }
    
    // 5. Supprimer de la base de données
    err = db.Delete(&media).Error
    if err != nil {
        http.Error(w, "Erreur suppression BDD", http.StatusInternalServerError)
        return
    }
    
    // 6. Mettre à jour le compteur photos_count
    var event Event
    db.Model(&Event{}).Where("id = ?", media.EventID).First(&event)
    
    var count int64
    db.Model(&Media{}).Where("event_id = ?", media.EventID).Count(&count)
    db.Model(&event).Update("photos_count", count)
    
    // 7. Réponse
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Média supprimé avec succès",
        "media_id": mediaID,
    })
}
```

---

## 🔄 Workflow complet

### **Upload (Frontend → Cloudinary → Backend)**

```
1. Frontend : Sélection du fichier
2. Frontend : Upload direct vers Cloudinary (sans API Secret)
   └─> Cloudinary retourne : { url, public_id, bytes, resource_type }
3. Frontend : POST /api/evenements/{id}/medias avec les métadonnées
4. Backend : Enregistre en BDD
5. Backend : Met à jour photos_count
```

### **Suppression (Frontend → Backend → Cloudinary)**

```
1. Frontend : Clic "Supprimer"
2. Frontend : DELETE /api/evenements/{id}/medias/{media_id}
3. Backend : Vérifie propriété (user_email)
4. Backend : Supprime de Cloudinary (avec API Secret)
5. Backend : Supprime de la BDD
6. Backend : Met à jour photos_count
7. Backend : Retourne succès
8. Frontend : Rafraîchit la galerie
```

---

## 📋 Exemple de structure Media en Go

```go
type Media struct {
    ID          string    `json:"id" gorm:"primaryKey"`
    EventID     string    `json:"event_id" gorm:"not null"`
    UserEmail   string    `json:"user_email" gorm:"not null"`
    UserName    string    `json:"user_name" gorm:"not null"`
    Type        string    `json:"type" gorm:"not null"` // "image" ou "video"
    URL         string    `json:"url" gorm:"type:text;not null"`
    StoragePath string    `json:"storage_path" gorm:"type:text;not null"` // public_id Cloudinary
    Filename    string    `json:"filename" gorm:"not null"`
    Size        int64     `json:"size" gorm:"not null"`
    UploadedAt  time.Time `json:"uploaded_at" gorm:"autoCreateTime"`
}
```

---

## ⚠️ Points importants

### **Sécurité**

- ✅ L'API Secret Cloudinary doit rester **côté backend uniquement**
- ✅ L'upload depuis le frontend est **unsigned** (upload preset public)
- ✅ La suppression nécessite l'API Secret (donc backend only)
- ✅ Vérifier que l'utilisateur est le propriétaire avant suppression

### **Gestion des erreurs**

- Si la suppression Cloudinary échoue, continuer quand même la suppression BDD
- Logger l'erreur pour investigation
- Le média sera orphelin dans Cloudinary (à nettoyer manuellement ou via script)

### **Alternative : Webhooks Cloudinary**

Tu peux configurer des webhooks Cloudinary pour être notifié lors d'uploads :
```
Dashboard → Settings → Upload → Notification URL
```

---

## 🚀 Prêt à implémenter !

Le frontend envoie :
- ✅ Upload direct vers Cloudinary (pas d'API Secret)
- ✅ Métadonnées au backend

Le backend gère :
- ✅ Suppression de Cloudinary (avec API Secret)
- ✅ CRUD des métadonnées en BDD
- ✅ Mise à jour du compteur photos_count

