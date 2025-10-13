# 📱 Détection PWA - Guide Complet

## Vue d'ensemble

Le hook `usePWA` permet de détecter si l'utilisateur navigue dans une PWA installée ou dans un navigateur web classique.

## Utilisation

### Hook complet `usePWA`

```typescript
import { usePWA } from "../hooks/usePWA";

function MonComposant() {
  const { isPWA, isInstallable, installPWA, displayMode, isMobile } = usePWA();

  return (
    <div>
      {isPWA ? (
        <p>🎉 Vous utilisez l'app installée !</p>
      ) : (
        <p>🌐 Vous êtes dans le navigateur</p>
      )}

      {isInstallable && (
        <button onClick={installPWA}>📱 Installer l'app</button>
      )}

      <p>Mode d'affichage: {displayMode}</p>
      <p>Mobile: {isMobile ? "Oui" : "Non"}</p>
    </div>
  );
}
```

### Hook simple `useIsPWA`

```typescript
import { useIsPWA } from "../hooks/usePWA";

function MonComposant() {
  const isPWA = useIsPWA();

  return <div>{isPWA ? "PWA" : "Navigateur"}</div>;
}
```

## Méthodes de détection

### 1. **Display Mode** (le plus fiable)

```typescript
// PWA installée
window.matchMedia("(display-mode: standalone)").matches;

// PWA en plein écran
window.matchMedia("(display-mode: fullscreen)").matches;
```

### 2. **iOS Safari** (mode standalone)

```typescript
(window.navigator as any).standalone === true;
```

### 3. **User Agent** (détection navigateur)

```typescript
// Android WebView
window.navigator.userAgent.includes("wv");

// iOS Safari
window.navigator.userAgent.includes("Version/") &&
  window.navigator.userAgent.includes("Mobile/");
```

## Cas d'usage

### 1. **Adapter l'interface**

```typescript
const { isPWA } = usePWA();

// Cacher le bouton "Installer" si déjà installé
{!isPWA && isInstallable && (
  <button onClick={installPWA}>Installer l'app</button>
)}

// Adapter le style pour PWA
<div className={isPWA ? 'pwa-layout' : 'browser-layout'}>
```

### 2. **Notifications push**

```typescript
const { isPWA, isMobile } = usePWA();

// Les notifications push marchent mieux en PWA
if (isPWA || isMobile) {
  // Activer les notifications
  enablePushNotifications();
}
```

### 3. **Analytics**

```typescript
const { isPWA, displayMode } = usePWA();

// Envoyer des métriques
analytics.track("app_usage", {
  platform: isPWA ? "pwa" : "web",
  display_mode: displayMode,
  user_agent: navigator.userAgent,
});
```

### 4. **Fonctionnalités spécifiques**

```typescript
const { isPWA } = usePWA();

// Certaines fonctionnalités ne marchent qu'en PWA
if (isPWA) {
  // Accès au système de fichiers
  // Notifications natives
  // Mode hors ligne
}
```

## États possibles

| État           | Description              | `isPWA` |
| -------------- | ------------------------ | ------- |
| **Browser**    | Navigateur web classique | `false` |
| **Standalone** | PWA installée (mode app) | `true`  |
| **Fullscreen** | PWA en plein écran       | `true`  |
| **iOS Safari** | Mode standalone iOS      | `true`  |

## Installation PWA

### Détecter si installable

```typescript
const { isInstallable, installPWA } = usePWA();

// L'app peut être installée si :
// - Pas déjà installée
// - Critères PWA respectés (manifest, service worker, HTTPS)
// - Événement 'beforeinstallprompt' déclenché
```

### Installer programmatiquement

```typescript
const handleInstall = async () => {
  try {
    await installPWA();
    console.log("PWA installée !");
  } catch (error) {
    console.error("Erreur installation:", error);
  }
};
```

## Exemple complet

```typescript
"use client";

import { usePWA } from "../hooks/usePWA";

export default function PWAStatus() {
  const { isPWA, isInstallable, installPWA, displayMode, isMobile } = usePWA();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-4">État de l'application</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Type:</span>
          <span className={isPWA ? "text-green-600" : "text-blue-600"}>
            {isPWA ? "📱 PWA Installée" : "🌐 Navigateur Web"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Mode d'affichage:</span>
          <span>{displayMode}</span>
        </div>

        <div className="flex justify-between">
          <span>Appareil:</span>
          <span>{isMobile ? "📱 Mobile" : "💻 Desktop"}</span>
        </div>

        <div className="flex justify-between">
          <span>Installable:</span>
          <span className={isInstallable ? "text-green-600" : "text-gray-500"}>
            {isInstallable ? "✅ Oui" : "❌ Non"}
          </span>
        </div>
      </div>

      {isInstallable && (
        <button
          onClick={installPWA}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          📱 Installer l'application
        </button>
      )}
    </div>
  );
}
```

## Avantages de la détection PWA

### 1. **UX adaptée**

- Interface optimisée pour l'app installée
- Cacher les éléments spécifiques au navigateur
- Adapter les interactions

### 2. **Fonctionnalités natives**

- Notifications push plus fiables
- Accès aux APIs natives
- Mode hors ligne

### 3. **Analytics**

- Mesurer l'adoption PWA
- Comprendre l'usage
- Optimiser l'expérience

### 4. **Performance**

- Cache plus efficace en PWA
- Chargement plus rapide
- Expérience fluide

## Limitations

- **iOS Safari** : Détection moins fiable
- **Navigateurs anciens** : Support limité
- **Mode privé** : Certaines APIs désactivées

## Test

Pour tester la détection PWA :

1. **En développement** : `npm run dev`
2. **Ouvrir DevTools** → Application → Manifest
3. **Simuler PWA** : DevTools → More tools → Rendering → Emulate CSS media feature `display-mode: standalone`
4. **Tester l'installation** : DevTools → Application → Service Workers

## Résumé

✅ **Hook `usePWA`** : Détection complète + installation  
✅ **Hook `useIsPWA`** : Détection simple  
✅ **Support multi-plateforme** : iOS, Android, Desktop  
✅ **Installation programmatique** : Bouton d'installation  
✅ **Analytics** : Métriques d'usage PWA

**Parfait pour adapter l'interface selon le contexte d'utilisation !** 📱✨
