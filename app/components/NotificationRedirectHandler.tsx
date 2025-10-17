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
      console.log("📨 [App] Message SW reçu:", event.data);

      // Gérer la sauvegarde de conversation (NOUVEAU - iOS Compatible)
      if (event.data && event.data.type === "SAVE_CONVERSATION_ID") {
        const { conversationId } = event.data;
        console.log("💾 [App] Sauvegarde conversationId:", conversationId);
        localStorage.setItem("pending_conversation_id", conversationId);
        localStorage.setItem("pending_conversation_timestamp", Date.now().toString());
        return;
      }
      
      // Ancien format (compatibilité)
      if (event.data && event.data.type === "SET_PENDING_CONVERSATION") {
        const { conversationId } = event.data;
        console.log("💾 [App] Sauvegarde conversationId (ancien):", conversationId);
        localStorage.setItem("pending_conversation_id", conversationId);
        localStorage.setItem("pending_conversation_timestamp", Date.now().toString());
        return;
      }

      if (event.data && event.data.type === "NOTIFICATION_CLICK") {
        const { data } = event.data;

        console.log("🔔 Clic notification détecté:", data);

        // Sauvegarder dans localStorage AVANT la redirection
        if (data.type === "chat_message" && data.conversationId) {
          console.log("💾 Sauvegarde conversationId en localStorage:", data.conversationId);
          localStorage.setItem("pendingConversationId", data.conversationId);
        }

        // Détecter le basePath à partir de l'URL actuelle
        const currentPath = window.location.pathname;
        const basePath = currentPath.includes("/premierdelan") ? "/premierdelan" : "";
        console.log("🔧 BasePath détecté:", basePath);
        
        // Redirection selon le type
        if (data.type === "chat_message" && data.conversationId) {
          // Naviguer vers la conversation
          const url = `${basePath}/chat`;
          console.log("💬 Redirection vers:", url);
          window.location.href = url;
        } else if (data.type === "chat_invitation") {
          console.log("📨 Redirection vers invitations");
          window.location.href = `${basePath}/chat`;
        } else if (data.type === "new_inscription" && data.event_id) {
          console.log("👥 Redirection vers événements admin");
          window.location.href = `${basePath}/admin/evenements`;
        } else if (data.type === "alert") {
          console.log("⚠️ Redirection vers admin");
          window.location.href = `${basePath}/admin`;
        } else if (data.url) {
          // Fallback: utiliser l'URL directement si fournie
          console.log("🔗 Redirection vers URL:", data.url);
          window.location.href = data.url;
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

