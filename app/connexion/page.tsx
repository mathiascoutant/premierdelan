"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiX, FiCheck } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export default function ConnexionPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  // Validation email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Reset messages
    setSuccessMessage("");
    setApiError("");

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Envoi vers l'API
      const response = await apiRequest(API_ENDPOINTS.connexion, {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      setSuccessMessage("Connexion réussie !");

      // Sauvegarder le token et les données utilisateur
      if (response.token) {
        localStorage.setItem("auth_token", response.token);
      }

      // Sauvegarder les infos utilisateur
      if (response.user) {
        localStorage.setItem("user_data", JSON.stringify(response.user));
      }

      // Rediriger vers la page d'accueil
      setTimeout(() => {
        const basePath =
          process.env.NODE_ENV === "production" ? "/premierdelan" : "";
        window.location.href = `${basePath}/`;
      }, 1000);
    } catch (error: any) {
      setApiError(error.message || "Email ou mot de passe incorrect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Partie gauche - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brown via-ink-light to-ink">
        {/* Ornements */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-8 px-12">
            <div className="text-gold text-8xl">⚜</div>
            <h1 className="font-cinzel text-5xl text-parchment tracking-[0.3em] leading-tight">
              PREMIER
              <br />
              DE L&apos;AN
            </h1>
            <p className="font-crimson text-parchment/70 text-lg max-w-md mx-auto">
              Rejoignez une célébration médiévale exceptionnelle
            </p>
            <div className="flex items-center justify-center space-x-2 text-gold/50">
              <div className="w-8 h-px bg-gold/50"></div>
              <span className="text-xs">✦</span>
              <div className="w-8 h-px bg-gold/50"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-parchment">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-12">
            <div className="text-gold text-5xl mb-4">⚜</div>
            <h1 className="font-cinzel text-2xl text-ink tracking-[0.3em]">
              PREMIER DE L&apos;AN
            </h1>
          </div>

          {/* Bouton retour */}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-stone hover:text-ink transition-colors mb-8 group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-crimson">
              Retour à l&apos;accueil
            </span>
          </Link>

          {/* Titre */}
          <div className="mb-10">
            <h2 className="font-cinzel text-3xl text-ink mb-2">Connexion</h2>
            <p className="font-crimson text-stone">
              Bienvenue ! Connectez-vous pour continuer.
            </p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500">
              <p className="text-green-700 text-sm flex items-center font-crimson">
                <FiCheck className="w-5 h-5 mr-2" />
                {successMessage}
              </p>
            </div>
          )}

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700 text-sm flex items-center font-crimson">
                <FiX className="w-5 h-5 mr-2" />
                {apiError}
              </p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink mb-2 font-crimson"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className={`w-full px-4 py-3 bg-white border ${
                  errors.email
                    ? "border-red-500"
                    : "border-stone/30 focus:border-gold"
                } focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all text-ink placeholder:text-stone/50 font-crimson`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-crimson">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-ink font-crimson"
                >
                  Mot de passe
                </label>
                <a
                  href="#"
                  className="text-sm text-stone hover:text-gold transition-colors font-crimson"
                >
                  Oublié ?
                </a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-white border ${
                  errors.password
                    ? "border-red-500"
                    : "border-stone/30 focus:border-gold"
                } focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all text-ink placeholder:text-stone/50 font-crimson`}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 font-crimson">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-gold hover:bg-gold-dark text-ink font-cinzel tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-parchment text-stone font-crimson">
                Nouveau ici ?
              </span>
            </div>
          </div>

          {/* Lien inscription */}
          <Link
            href="/inscription"
            className="block w-full px-6 py-4 border-2 border-gold/30 hover:border-gold hover:bg-gold/5 text-center text-ink font-cinzel tracking-wider uppercase transition-all duration-300"
          >
            Créer un compte
          </Link>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-stone/70 font-crimson">
            En vous connectant, vous acceptez nos conditions d&apos;utilisation
          </p>
        </div>
      </div>
    </div>
  );
}
