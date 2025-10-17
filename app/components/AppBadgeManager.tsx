"use client";

import { useAuth } from "../hooks/useAuth";
import { useAppBadge } from "../hooks/useAppBadge";

/**
 * Composant pour gérer le badge de notification sur l'icône PWA
 * Affiche le nombre de messages non lus sur l'icône de l'écran d'accueil
 */
export default function AppBadgeManager() {
  const { user, isAdmin } = useAuth();
  
  // Utiliser le hook pour gérer le badge
  useAppBadge(user?.id || null, isAdmin());

  // Ce composant ne rend rien visuellement
  return null;
}

