// Configuration de l'API
// ✅ Railway - URL permanente
export const API_URL =
  "https://believable-spontaneity-production.up.railway.app";

// Endpoints
export const API_ENDPOINTS = {
  inscription: `${API_URL}/api/inscription`,
  connexion: `${API_URL}/api/connexion`,
  // Firebase Cloud Messaging endpoints
  fcmSubscribe: `${API_URL}/api/fcm/subscribe`,
  fcmSend: `${API_URL}/api/fcm/send`,
  // Theme endpoints (global)
  GET_GLOBAL_THEME: `${API_URL}/api/theme`,
  SAVE_GLOBAL_THEME: `${API_URL}/api/theme`,
  // Ajoutez d'autres endpoints selon votre API
};

// Helper pour envoyer une alerte admin
async function sendAdminAlert(
  errorType: string,
  errorMessage: string,
  endpoint: string
) {
  try {
    // Tentative d'envoi d'alerte à l'admin
    // Si l'API est complètement down, cette requête échouera silencieusement
    const alertEndpoint = `${API_URL}/api/alerts/critical`;

    await fetch(alertEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        admin_email: "mathiascoutant@icloud.com", // Email de l'admin à notifier
        error_type: errorType,
        error_message: errorMessage,
        endpoint_failed: endpoint,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      }),
    });

    console.log("✅ Alerte admin envoyée avec succès");
  } catch (error) {
    // Si l'alerte ne peut pas être envoyée (API complètement down), on ignore
    console.warn("⚠️ Impossible d'envoyer l'alerte admin:", error);
  }
}

// Helper pour rediriger vers la page de maintenance
function redirectToMaintenance(
  errorType: string,
  errorMessage: string,
  endpoint: string
) {
  // Éviter les boucles infinies si on est déjà sur /maintenance
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.includes("/maintenance")
  ) {
    // Tenter d'envoyer une alerte à l'admin avant de rediriger
    sendAdminAlert(errorType, errorMessage, endpoint);

    // Rediriger vers la page de maintenance après un court délai
    // pour laisser le temps à l'alerte de partir
    setTimeout(() => {
      const basePath =
        process.env.NODE_ENV === "production" ? "/premierdelan" : "";
      window.location.href = `${basePath}/maintenance`;
    }, 500);
  }
}

// Helper pour les requêtes API
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    // Récupérer le token pour l'authentification
    const token =
      localStorage.getItem("token") || localStorage.getItem("auth_token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // Header ngrok pour éviter la page d'avertissement
      "ngrok-skip-browser-warning": "true",
      ...(options.headers as Record<string, string>),
    };

    // Ajouter le token d'authentification si disponible
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Debug pour voir ce qui est envoyé
    if (options.method === "POST" || options.method === "PUT") {
      console.log("📤 API Request:", {
        endpoint,
        method: options.method,
        headers,
        body: options.body,
      });
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
      mode: "cors", // Activer CORS explicitement
      credentials: "omit", // Pas de cookies pour simplifier CORS
    });

    // Erreur serveur (500+) -> Maintenance
    if (response.status >= 500) {
      console.error(`Erreur serveur ${response.status}`);
      // TODO: Désactivé temporairement pour debug
      // redirectToMaintenance(
      //   "SERVER_ERROR",
      //   `Erreur serveur HTTP ${response.status}`,
      //   endpoint
      // );
      throw new Error(
        `Erreur serveur ${response.status} - Vérifier les logs Railway`
      );
    }

    // Erreur client (400-499) -> Erreur métier normale
    if (!response.ok) {
      let error;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        error = await response
          .json()
          .catch(() => ({ message: "Erreur réseau" }));
      } else {
        const text = await response.text();
        error = { message: text || `Erreur ${response.status}` };
      }

      // Ne pas logger les 404 sur les endpoints d'inscription (cas normal: pas inscrit)
      const isInscriptionCheck = endpoint.includes("/inscription?user_email=");
      if (!isInscriptionCheck || response.status !== 404) {
        console.error("❌ Erreur backend:", error);
        console.error("❌ Status:", response.status);
        console.error("❌ Content-Type:", contentType);
      }
      
      throw new Error(
        error.message || error.error || `Erreur ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    // Ne pas logger les erreurs 404 sur les checks d'inscription
    const isInscriptionCheck = endpoint.includes("/inscription?user_email=");
    const is404Error = error instanceof Error && error.message.includes("404");
    
    if (!isInscriptionCheck || !is404Error) {
      console.error("API Request Error:", error);
    }

    // Erreur réseau (timeout, DNS, serveur inaccessible, etc.)
    // TODO: Désactivé temporairement pour debug
    // if (error instanceof TypeError && error.message.includes("fetch")) {
    //   console.error("Erreur réseau détectée - redirection vers maintenance");
    //   redirectToMaintenance(
    //     "NETWORK_ERROR",
    //     "Impossible de contacter le serveur (TypeError fetch)",
    //     endpoint
    //   );
    //   throw new Error("Service temporairement indisponible");
    // }

    // Autres erreurs réseau (CORS, timeout, etc.)
    // TODO: Désactivé temporairement pour debug
    // if (
    //   error instanceof Error &&
    //   (error.message.includes("NetworkError") ||
    //     error.message.includes("Failed to fetch") ||
    //     error.message.includes("Network request failed"))
    // ) {
    //   console.error(
    //     "Erreur de connexion détectée - redirection vers maintenance"
    //   );
    //   redirectToMaintenance(
    //     "CONNECTION_ERROR",
    //     `Erreur de connexion: ${error.message}`,
    //     endpoint
    //   );
    //   throw new Error("Service temporairement indisponible");
    // }

    throw error;
  }
}
