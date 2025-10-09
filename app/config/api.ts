// Configuration de l'API
export const API_URL = "https://nia-preinstructive-nola.ngrok-free.dev";

// Endpoints
export const API_ENDPOINTS = {
  inscription: `${API_URL}/api/inscription`,
  connexion: `${API_URL}/api/connexion`,
  notificationTest: `${API_URL}/api/notification/test`,
  vapidPublicKey: `${API_URL}/api/notifications/vapid-public-key`,
  notificationSubscribe: `${API_URL}/api/notifications/subscribe`,
  // Ajoutez d'autres endpoints selon votre API
};

// Helper pour les requêtes API
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        // Header ngrok pour éviter la page d'avertissement (toujours en dernier pour ne pas être écrasé)
        "ngrok-skip-browser-warning": "true",
      },
      mode: "cors", // Activer CORS explicitement
      credentials: "omit", // Pas de cookies pour simplifier CORS
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Erreur réseau" }));
      throw new Error(error.message || `Erreur ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}
