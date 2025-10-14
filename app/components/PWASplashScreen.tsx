"use client";

import { useState, useEffect } from "react";
import { useIsPWA } from "../hooks/usePWA";

export default function PWASplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shouldShowSplash, setShouldShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDeploymentInProgress, setIsDeploymentInProgress] = useState(false);
  const [deploymentCheckCount, setDeploymentCheckCount] = useState(0);
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

  // Vérifier s'il y a une action GitHub en cours
  const checkGitHubAction = async () => {
    try {
      // Faire plusieurs vérifications pour être sûr
      const checks = [];

      for (let i = 0; i < 3; i++) {
        try {
          const response = await fetch(window.location.origin, {
            method: "HEAD",
            cache: "no-cache",
          });
          checks.push(response.ok);
          await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms entre chaque check
        } catch (error) {
          checks.push(false);
        }
      }

      // Si au moins 2/3 des vérifications réussissent, pas d'action GitHub
      const successCount = checks.filter(Boolean).length;
      const hasGitHubAction = successCount < 2;

      console.log(
        `🔍 Vérification GitHub: ${successCount}/3 succès - ${
          hasGitHubAction ? "Action GitHub en cours" : "Pas d'action GitHub"
        }`
      );

      // Vérification supplémentaire : si on a au moins 1 succès, on considère qu'il n'y a pas d'action
      if (successCount >= 1) {
        console.log("✅ Au moins 1 succès - Pas d'action GitHub");
        return false;
      }

      return hasGitHubAction;
    } catch (error) {
      console.log("✅ Pas d'action GitHub en cours - Erreur de vérification");
      return false; // Si erreur, considérer qu'il n'y a pas de déploiement
    }
  };

  // Lancer l'animation normale du splash screen
  const launchNormalAnimation = () => {
    const progressSteps = [20, 33, 55, 70, 85, 99, 100];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        const newProgress = progressSteps[currentStep];
        setProgress(newProgress);
        console.log("📊 Progression:", newProgress + "%");
        currentStep++;

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            // Vérifier s'il y a une action GitHub en cours
            console.log(
              "🔍 Vérification action GitHub à la fin de l'animation"
            );
            const isGitHubActionInProgress = await checkGitHubAction();

            if (isGitHubActionInProgress) {
              // Action GitHub en cours, afficher la page de mise à jour
              console.log(
                "⏳ Action GitHub en cours - Affichage page mise à jour"
              );
              setIsDeploymentInProgress(true);
              startDeploymentMonitoring();
            } else {
              // Pas d'action GitHub, masquer le splash screen
              console.log("✅ Pas d'action GitHub - Masquage splash screen");
              setIsVisible(false);
            }
          }, 2000);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  };

  // Surveiller l'action GitHub et masquer le splash screen quand terminé
  const startDeploymentMonitoring = () => {
    const monitoringInterval = setInterval(async () => {
      const isGitHubActionInProgress = await checkGitHubAction();
      setDeploymentCheckCount((prev) => prev + 1);

      if (!isGitHubActionInProgress) {
        clearInterval(monitoringInterval);
        console.log("🎉 Action GitHub terminée - Masquage splash screen");
        setIsDeploymentInProgress(false);
        setTimeout(() => {
          setIsVisible(false);
        }, 1000); // Attendre 1 seconde puis masquer
      }
    }, 2000); // Vérifier toutes les 2 secondes

    return () => clearInterval(monitoringInterval);
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
    const initializeSplash = async () => {
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

        // Vérifications pour détecter PWA installée
        const isStandalone = window.matchMedia(
          "(display-mode: standalone)"
        ).matches;
        const isFullscreen = window.matchMedia(
          "(display-mode: fullscreen)"
        ).matches;
        const isIOSStandalone = (window.navigator as any).standalone === true;

        // Vérifications supplémentaires pour éviter les faux positifs
        const isInBrowser = !isStandalone && !isFullscreen && !isIOSStandalone;
        const isChromeOnMac = /Macintosh.*Chrome/.test(navigator.userAgent);
        const isDesktop =
          !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        // Ne JAMAIS afficher si on est dans un navigateur web classique
        if (isInBrowser) {
          return false;
        }

        // Ne JAMAIS afficher sur desktop (même en PWA)
        if (isDesktop) {
          return false;
        }

        // Afficher SEULEMENT si vraiment en mode PWA installée sur mobile
        return isStandalone || isFullscreen || isIOSStandalone;
      };

      const urlParams = new URLSearchParams(window.location.search);
      const forceSplash = urlParams.get("splash") === "true";

      console.log("🔍 Vérification PWA:", {
        isStandalone: window.matchMedia("(display-mode: standalone)").matches,
        isFullscreen: window.matchMedia("(display-mode: fullscreen)").matches,
        isIOSStandalone: (window.navigator as any).standalone,
        isInBrowser:
          !window.matchMedia("(display-mode: standalone)").matches &&
          !window.matchMedia("(display-mode: fullscreen)").matches &&
          !(window.navigator as any).standalone,
        isDesktop:
          !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ),
        isChromeOnMac: /Macintosh.*Chrome/.test(navigator.userAgent),
        hostname: window.location.hostname,
        hasShown: hasShownSplash(),
        userAgent: navigator.userAgent,
      });

      // Démarrer l'animation immédiatement si on est en PWA ou mobile
      if (checkIfPWAMode() && !hasShownSplash()) {
        console.log("🚀 PWA détectée - Lancement du splash screen");
        console.log("📱 État avant affichage:", {
          isVisible,
          shouldShowSplash,
          isInitialized,
        });
        setIsVisible(true);
        markSplashAsShown();

        // Toujours lancer l'animation normale d'abord
        console.log("🚀 Lancement animation normale");
        const cleanup = launchNormalAnimation();

        // Pas de vérification au démarrage, seulement à la fin de l'animation
        console.log(
          "🚀 Lancement animation normale - Vérification déploiement à la fin"
        );

        return cleanup;
      } else {
        console.log("🌐 Pas en PWA ou déjà affiché - Pas de splash screen");
        setShouldShowSplash(false);
      }
    };

    initializeSplash();
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
        {/* Effet de particules de fond */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold/20 rounded-full animate-pulse"></div>
          <div
            className="absolute top-1/3 right-1/4 w-1 h-1 bg-gold/30 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-gold/25 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-gold/20 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Contenu centré */}
        <div className="relative z-10 text-center px-8 max-w-sm mx-auto">
          {/* Logo moderne */}
          <div className="mb-16">
            <div className="relative">
              {/* Cercle de fond avec effet de lueur */}
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gold/20 to-gold/5 rounded-full flex items-center justify-center border border-gold/30 shadow-2xl">
                <div className="text-5xl text-gold">⚜</div>
              </div>

              {/* Effet de pulsation */}
              <div className="absolute inset-0 w-32 h-32 mx-auto bg-gold/10 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Titre moderne */}
          <div className="mb-12">
            <h1 className="font-cinzel text-3xl text-gold mb-2 tracking-wider">
              PREMIER DE L&apos;AN
            </h1>
            <div className="w-16 h-px bg-gold/50 mx-auto mb-3"></div>
            <p className="font-crimson text-parchment/80 text-sm tracking-wider">
              Édition 2026
            </p>
          </div>

          {/* Contenu conditionnel selon le statut du déploiement */}
          {isDeploymentInProgress ? (
            /* Page de mise à jour */
            <div className="space-y-6">
              <div className="mb-8">
                <div className="w-16 h-16 mx-auto bg-gold/20 rounded-full flex items-center justify-center mb-4">
                  <div className="text-2xl text-gold animate-spin">⚙</div>
                </div>
                <h2 className="font-cinzel text-xl text-gold mb-2">
                  Mise à jour en cours
                </h2>
                <p className="text-sm font-crimson text-parchment/70">
                  Déploiement de la nouvelle version...
                </p>
              </div>

              {/* Indicateur de vérification */}
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className="w-2 h-2 bg-gold rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gold rounded-full animate-bounce"
                    style={{ animationDelay: "200ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gold rounded-full animate-bounce"
                    style={{ animationDelay: "400ms" }}
                  ></div>
                </div>
                <p className="text-xs font-crimson text-parchment/60">
                  Vérification #{deploymentCheckCount}...
                </p>
              </div>
            </div>
          ) : (
            /* Animation normale */
            <div className="space-y-4">
              {/* Barre de progression moderne */}
              <div className="mb-8">
                {/* Barre de progression */}
                <div className="relative w-72 h-1.5 bg-parchment/10 rounded-full overflow-hidden mx-auto mb-4">
                  {/* Fond avec effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-parchment/5 to-transparent"></div>

                  {/* Progression */}
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    {/* Effet de brillance sur la progression */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  </div>
                </div>

                {/* Pourcentage moderne */}
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg font-cinzel text-gold tabular-nums font-bold">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>

              {/* Message de chargement moderne */}
              <div className="space-y-4">
                <p className="text-sm font-crimson text-parchment/70 tracking-wide">
                  Préparation de votre expérience médiévale...
                </p>

                {/* Indicateur de chargement moderne */}
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className="w-2 h-2 bg-gold rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gold rounded-full animate-bounce"
                    style={{ animationDelay: "200ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gold rounded-full animate-bounce"
                    style={{ animationDelay: "400ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
