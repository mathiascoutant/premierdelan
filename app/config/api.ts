// Configuration de l'API
export const API_URL = "https://nia-preinstructive-nola.ngrok-free.dev";

// Endpoints
export const API_ENDPOINTS = {
  inscription: `${API_URL}/api/inscription`,
  connexion: `${API_URL}/api/connexion`,
  notificationTest: `${API_URL}/api/notification/test`,
  // Ajoutez d'autres endpoints selon votre API
};

// Helper pour les requêtes API
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erreur réseau" }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}
