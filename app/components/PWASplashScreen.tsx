"use client";

import { useState, useEffect } from "react";
import { useIsPWA } from "../hooks/usePWA";

export default function PWASplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const isPWA = useIsPWA();

  const hasShownSplash = () => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("pwa_splash_shown") === "true";
  };

  const markSplashAsShown = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pwa_splash_shown", "true");
    }
  };

  useEffect(() => {
    if (!isPWA) {
      return;
    }

    if (hasShownSplash()) {
      return;
    }

    setIsVisible(true);

    // Animation de progression
    const progressSteps = [15, 30, 50, 70, 85, 95, 100];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        setProgress(progressSteps[currentStep]);
        currentStep++;

        if (progressSteps[currentStep - 1] >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            markSplashAsShown();
          }, 500);
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isPWA]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Pattern de fond */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212,175,55,0.2) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Blurs lumineux */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#d4af37]/20 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#c9a74f]/20 rounded-full blur-[150px]"></div>

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center px-8 animate-fade-in">
        {/* Logo avec animation pulse */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] to-[#c9a74f] rounded-3xl blur-xl opacity-50 animate-pulse"></div>
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] flex items-center justify-center shadow-2xl shadow-[#d4af37]/50">
            <span className="text-5xl">⚜</span>
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-4xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f4d03f] to-[#d4af37] mb-2 tracking-wider text-center">
          PREMIER DE L'AN
        </h1>

        <p className="text-sm text-gray-400 font-crimson mb-8 tracking-widest">
          ÉDITION 2026
        </p>

        {/* Barre de progression */}
        <div className="w-64 mb-4">
          <div className="h-1.5 bg-zinc-800/60 rounded-full overflow-hidden backdrop-blur-sm border border-[#d4af37]/20">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] via-[#f4d03f] to-[#d4af37] transition-all duration-300 ease-out shadow-lg shadow-[#d4af37]/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Pourcentage */}
        <p className="text-[#d4af37] text-sm font-cinzel font-bold tracking-wider">
          {progress}%
        </p>

        {/* Message de chargement */}
        <p className="text-gray-500 text-xs font-crimson mt-4 animate-pulse">
          Chargement de l'expérience...
        </p>
      </div>

      {/* Ornement en bas */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 opacity-30">
        <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
        <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
        <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
      </div>
    </div>
  );
}
