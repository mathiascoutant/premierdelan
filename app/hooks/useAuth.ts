"use client";

import { useState, useEffect } from "react";

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  photo?: string;
  admin?: number; // 1 = admin, 0 ou undefined = user normal
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Erreur parsing user data:", error);
        localStorage.removeItem("user_data");
        localStorage.removeItem("auth_token");
      }
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
    const basePath =
      process.env.NODE_ENV === "production" ? "/premierdelan" : "";
    window.location.href = `${basePath}/`;
  };

  const isAdmin = () => {
    return user?.admin === 1;
  };

  return { user, isLoading, logout, isAdmin };
}
