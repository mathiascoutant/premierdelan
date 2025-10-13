"use client";

import { useState, useEffect } from "react";
import { useIsPWA } from "../hooks/usePWA";

export default function PWASplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const isPWA = useIsPWA();

  useEffect(() => {
    // Afficher le splash screen SEULEMENT si on est en PWA installée
    // Vérifications plus strictes pour éviter l'affichage sur navigateur
    const checkIfPWAMode = () => {
      // Vérifications très strictes pour éviter l'affichage sur navigateur

      // 1. Vérifier si on est vraiment en mode PWA installée
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isFullscreen = window.matchMedia(
        "(display-mode: fullscreen)"
      ).matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;

      // 2. Vérifier si on est dans un navigateur web (même sur mobile)
      const isInBrowser = !isStandalone && !isFullscreen && !isIOSStandalone;

      // 3. Vérifications supplémentaires pour Chrome sur Mac
      const isChromeOnMac = /Macintosh.*Chrome/.test(navigator.userAgent);
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      // 4. Ne JAMAIS afficher si on est sur localhost (développement)
      if (isLocalhost) {
        return false;
      }

      // 5. Ne JAMAIS afficher si on est dans un navigateur web classique
      if (isInBrowser) {
        return false;
      }

      // 6. Afficher SEULEMENT si vraiment en mode PWA installée
      return isStandalone || isFullscreen || isIOSStandalone;
    };

    if (checkIfPWAMode()) {
      setIsVisible(true);

      // Animation de la barre de progression
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Masquer le splash screen après 2 secondes
            setTimeout(() => {
              setIsVisible(false);
            }, 500);
            return 100;
          }
          return prev + Math.random() * 15 + 5; // Progression aléatoire mais fluide
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [isPWA]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-ink flex items-center justify-center">
      {/* Ornements de fond */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-10 text-9xl text-gold/30">⚜</div>
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
  );
}
