"use client";

import { useState, useEffect } from "react";

export function usePWA() {
  const [isPWA, setIsPWA] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Détecter si on est dans une PWA
    const checkPWA = () => {
      // Méthode 1: Vérifier si on est en mode standalone (PWA installée)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;

      // Méthode 2: Vérifier si on est dans un navigateur mobile (iOS Safari)
      const isInWebAppiOS = (window.navigator as any).standalone === true;

      // Méthode 3: Vérifier si on est dans un navigateur mobile (Android Chrome)
      const isInWebAppAndroid = window.matchMedia(
        "(display-mode: fullscreen)"
      ).matches;

      // Méthode 4: Vérifier les headers de la PWA
      const isPWAUserAgent =
        window.navigator.userAgent.includes("wv") ||
        (window.navigator.userAgent.includes("Version/") &&
          window.navigator.userAgent.includes("Mobile/"));

      return (
        isStandalone || isInWebAppiOS || isInWebAppAndroid || isPWAUserAgent
      );
    };

    setIsPWA(checkPWA());

    // Écouter les changements de display-mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsPWA(e.matches || checkPWA());
    };

    mediaQuery.addEventListener("change", handleChange);

    // Détecter si l'app peut être installée
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Fonction pour installer la PWA
  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("PWA installée avec succès");
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    }
  };

  return {
    isPWA,
    isInstallable,
    installPWA,
    // Informations détaillées
    displayMode: window.matchMedia("(display-mode: standalone)").matches
      ? "standalone"
      : window.matchMedia("(display-mode: fullscreen)").matches
      ? "fullscreen"
      : "browser",
    userAgent: window.navigator.userAgent,
    isMobile:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        window.navigator.userAgent
      ),
  };
}

// Hook simple pour juste détecter si on est en PWA
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        (window.navigator as any).standalone === true
      );
    };

    setIsPWA(checkPWA());
  }, []);

  return isPWA;
}
