"use client";

import { useState, useEffect } from "react";
import { useIsPWA } from "../hooks/usePWA";

export default function PWASplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shouldShowSplash, setShouldShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const isPWA = useIsPWA();

  // Vérifier si le splash screen a déjà été affiché dans cette session de navigation
  const hasShownSplash = () => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("pwa_splash_shown") === "true";
  };

  // Marquer que le splash screen a été affiché pour cette session
  const markSplashAsShown = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pwa_splash_shown", "true");
    }
  };

  // Réinitialiser le flag quand la PWA est complètement fermée et rouverte
  const resetSplashFlag = () => {
    if (typeof window !== "undefined") {
      // Vérifier si c'est un nouveau lancement de PWA
      const lastCloseTime = localStorage.getItem("pwa_last_close_time");
      const now = Date.now();

      // Si plus de 1 seconde depuis la dernière fermeture, c'est un nouveau lancement
      if (!lastCloseTime || now - parseInt(lastCloseTime) > 1000) {
        sessionStorage.removeItem("pwa_splash_shown");
        localStorage.setItem("pwa_last_close_time", now.toString());
      }
    }
  };

  useEffect(() => {
    // Marquer comme initialisé d'abord
    setIsInitialized(true);

    // Réinitialiser le flag au début pour détecter les nouveaux lancements
    resetSplashFlag();

    // TEST : Afficher le splash screen sur mobile (même si pas PWA)
    const checkIfPWAMode = () => {
      // Ne JAMAIS afficher sur localhost (développement)
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (isLocalhost) {
        return false;
      }

      // TEST : Détecter si on est sur mobile
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // Vérifications pour détecter PWA installée
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isFullscreen = window.matchMedia(
        "(display-mode: fullscreen)"
      ).matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;

      // TEST : Afficher sur mobile OU si vraiment en mode PWA installée OU si paramètre URL
      const urlParams = new URLSearchParams(window.location.search);
      const forceSplash = urlParams.get("splash") === "true";

      return (
        isMobile ||
        isStandalone ||
        isFullscreen ||
        isIOSStandalone ||
        forceSplash
      );
    };

    const urlParams = new URLSearchParams(window.location.search);
    const forceSplash = urlParams.get("splash") === "true";

    console.log("🔍 Vérification PWA:", {
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ),
      isStandalone: window.matchMedia("(display-mode: standalone)").matches,
      isFullscreen: window.matchMedia("(display-mode: fullscreen)").matches,
      isIOSStandalone: (window.navigator as any).standalone,
      hostname: window.location.hostname,
      hasShown: hasShownSplash(),
      userAgent: navigator.userAgent,
      forceSplash: forceSplash,
      urlParams: window.location.search,
    });

    // Démarrer l'animation immédiatement si on est en PWA ou mobile
    if (checkIfPWAMode() && !hasShownSplash()) {
      console.log("🚀 Mobile/PWA détectée - Lancement du splash screen");
      console.log("📱 État avant affichage:", {
        isVisible,
        shouldShowSplash,
        isInitialized,
      });
      setIsVisible(true);
      markSplashAsShown();

      // Animation de la barre de progression
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 20 + 10;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          // Masquer le splash screen après 1 seconde
          setTimeout(() => {
            setIsVisible(false);
          }, 1000);
        }
        console.log("📊 Progression:", Math.round(currentProgress) + "%");
        setProgress(currentProgress);
      }, 100);

      return () => clearInterval(interval);
    } else {
      console.log(
        "🌐 Pas en mobile/PWA ou déjà affiché - Pas de splash screen"
      );
      setShouldShowSplash(false);
    }
  }, []);

  // Écouter la fermeture de la PWA pour enregistrer le timestamp
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("pwa_last_close_time", Date.now().toString());
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        localStorage.setItem("pwa_last_close_time", Date.now().toString());
      }
    };

    // Écouter les événements de fermeture
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Ne pas afficher tant que l'initialisation n'est pas terminée
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 z-[9998] bg-ink flex items-center justify-center">
        <div className="text-gold text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <>
      {/* Masquer le contenu de la page pendant le splash */}
      <div className="fixed inset-0 z-[9998] bg-ink"></div>

      {/* Splash screen */}
      <div className="pwa-splash-screen flex items-center justify-center">
        {/* Ornements de fond */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/4 left-10 text-9xl text-gold/30">
            ⚜
          </div>
          <div className="absolute bottom-1/4 right-10 text-9xl text-gold/30">
            ⚜
          </div>
        </div>

        {/* Contenu centré */}
        <div className="relative z-10 text-center px-6 max-w-md mx-auto">
          {/* Logo principal */}
          <div className="mb-12">
            <div className="relative inline-block">
              {/* Effet de lueur */}
              <div className="absolute inset-0 bg-gold/20 blur-2xl scale-150 animate-pulse"></div>

              {/* Logo avec ornement */}
              <div className="relative bg-parchment-light/95 backdrop-blur-xl border-2 border-gold/40 p-8 shadow-2xl">
                {/* Ornements de coin */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/60"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/60"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/60"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/60"></div>

                {/* Logo */}
                <div className="text-6xl text-gold mb-4">⚜</div>
                <h1 className="font-cinzel text-2xl text-ink tracking-[0.3em] leading-tight">
                  PREMIER
                  <br />
                  DE L&apos;AN
                </h1>
                <p className="font-crimson text-stone text-sm mt-2">
                  Édition 2026
                </p>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-px bg-gold/30"></div>
              <span className="text-xs font-crimson text-parchment/70 tracking-wider">
                Chargement...
              </span>
              <div className="w-8 h-px bg-gold/30"></div>
            </div>

            {/* Barre de progression */}
            <div className="relative w-64 h-2 bg-stone/20 rounded-full overflow-hidden mx-auto">
              {/* Fond */}
              <div className="absolute inset-0 bg-stone/10"></div>

              {/* Progression */}
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>

            {/* Pourcentage */}
            <div className="mt-3">
              <span className="text-sm font-cinzel text-gold tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Message de chargement */}
          <div className="space-y-2">
            <p className="text-sm font-crimson text-parchment/60">
              Préparation de votre expérience médiévale...
            </p>
            <div className="flex items-center justify-center space-x-1">
              <div
                className="w-1 h-1 bg-gold rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-1 h-1 bg-gold rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-1 h-1 bg-gold rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
