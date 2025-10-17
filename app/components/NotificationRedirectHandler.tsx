"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Écouter les messages du service worker pour les redirections
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      console.log("📨 Message reçu du service worker:", event.data);

      if (event.data && event.data.type === "NOTIFICATION_CLICK") {
        const { data } = event.data;

        console.log("🔔 Clic notification détecté:", data);

        // Redirection selon le type
        // Next.js gère automatiquement le basePath configuré dans next.config.js
        if (data.type === "chat_message" && data.conversationId) {
          // Naviguer vers la conversation
          const url = `/chat?conversation=${data.conversationId}`;
          console.log("💬 Redirection vers conversation:", data.conversationId);
          router.push(url);
        } else if (data.type === "chat_invitation") {
          router.push("/chat");
          console.log("📨 Redirection vers invitations");
        } else if (data.type === "new_inscription" && data.event_id) {
          router.push("/admin/evenements");
          console.log("👥 Redirection vers événements admin");
        } else if (data.type === "alert") {
          router.push("/admin");
          console.log("⚠️ Redirection vers admin");
        } else if (data.url) {
          // Fallback: utiliser l'URL directement si fournie
          console.log("🔗 Redirection vers URL:", data.url);
          router.push(data.url);
        }
      }
    };

    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage
    );

    // Nettoyage
    return () => {
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
    };
  }, [router]);

  // Ce composant ne rend rien visuellement
  return null;
}

