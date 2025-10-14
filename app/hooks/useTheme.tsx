"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export type Theme = "medieval" | "classic";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isMedieval: boolean;
  isClassic: boolean;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("medieval");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Charger le thème global depuis la DB
  useEffect(() => {
    loadGlobalTheme();
  }, []);

  const loadGlobalTheme = async () => {
    try {
      // Utiliser l'endpoint existant pour récupérer le thème
      const response = await apiRequest(`${API_ENDPOINTS.GET_GLOBAL_THEME}`, {
        method: "GET",
      });

      if (response.success && response.theme) {
        setThemeState(response.theme);
        localStorage.setItem("premierdelan-theme", response.theme);
      } else {
        // Fallback sur localStorage
        const savedTheme = localStorage.getItem("premierdelan-theme") as Theme;
        if (
          savedTheme &&
          (savedTheme === "medieval" || savedTheme === "classic")
        ) {
          setThemeState(savedTheme);
        }
      }
    } catch (error) {
      console.log("Erreur lors du chargement du thème global:", error);
      // Fallback sur localStorage
      const savedTheme = localStorage.getItem("premierdelan-theme") as Theme;
      if (
        savedTheme &&
        (savedTheme === "medieval" || savedTheme === "classic")
      ) {
        setThemeState(savedTheme);
      } else {
        // Thème par défaut si rien en localStorage
        setThemeState("medieval");
        localStorage.setItem("premierdelan-theme", "medieval");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Appliquer le thème au body
  useEffect(() => {
    if (!isLoading) {
      document.body.className = document.body.className.replace(
        /theme-\w+/g,
        ""
      );
      document.body.classList.add(`theme-${theme}`);
      localStorage.setItem("premierdelan-theme", theme);
    }
  }, [theme, isLoading]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    // Sauvegarder immédiatement en localStorage
    localStorage.setItem("premierdelan-theme", newTheme);

    // Sauvegarder le thème global en DB (seuls les admins peuvent le faire)
    if (user?.admin === 1) {
      try {
        await apiRequest(API_ENDPOINTS.SAVE_GLOBAL_THEME, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ theme: newTheme }),
        });
        console.log("Thème sauvegardé en base de données");
      } catch (error) {
        console.log("Erreur lors de la sauvegarde du thème global:", error);
        console.log("Thème sauvegardé en localStorage uniquement");
      }
    } else {
      console.log("Thème sauvegardé en localStorage (utilisateur non admin)");
    }
  };

  const value = {
    theme,
    setTheme,
    isMedieval: theme === "medieval",
    isClassic: theme === "classic",
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
