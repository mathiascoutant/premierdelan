"use client";

import { useEffect, useState } from "react";

/**
 * Composant pour forcer la mise à jour du service worker
 * Affiche une notification quand une nouvelle version est disponible
 */
export default function ServiceWorkerUpdater() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Vérifier si une mise à jour est disponible
    navigator.serviceWorker.ready.then((registration) => {
      // Forcer la vérification d'une mise à jour toutes les 60 secondes
      setInterval(() => {
        registration.update();
      }, 60000);

      // Écouter les mises à jour
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // Une nouvelle version est disponible
            console.log("🔄 Nouvelle version du service worker disponible");
            setShowUpdate(true);
          }
        });
      });
    });
  }, []);

  const handleUpdate = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      });

      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-2xl shadow-amber-500/50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔄</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm mb-1">Mise à jour disponible</p>
            <p className="text-xs text-amber-100 mb-3">
              Une nouvelle version de l'application est prête
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-white text-amber-600 rounded-xl text-sm font-bold hover:bg-amber-50 transition-all active:scale-95"
              >
                Mettre à jour
              </button>
              <button
                onClick={() => setShowUpdate(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all active:scale-95"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

