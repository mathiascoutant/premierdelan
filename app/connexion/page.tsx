"use client";

import { useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export default function ConnexionPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    setApiError("");

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest(API_ENDPOINTS.connexion, {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.token) {
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("token", response.token);
      }

      if (response.user) {
        localStorage.setItem("user_data", JSON.stringify(response.user));
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      setTimeout(() => {
        const basePath =
          process.env.NODE_ENV === "production" ? "/premierdelan" : "";
        window.location.href = `${basePath}/`;
      }, 500);
    } catch (error: any) {
      setApiError(error.message || "Email ou mot de passe incorrect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden relative flex items-center justify-center px-4">
      {/* Fond médiéval */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 -z-10"></div>
      <div
        className="fixed inset-0 opacity-40 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212,175,55,0.2) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="fixed top-20 right-10 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-[#c9a74f]/10 rounded-full blur-[120px] -z-10"></div>

      {/* Card de connexion */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] flex items-center justify-center shadow-2xl shadow-[#d4af37]/30">
            <span className="text-4xl">⚜</span>
          </div>
          <h1 className="text-3xl font-cinzel font-bold text-white mb-2">
            Connexion
          </h1>
          <p className="text-gray-400 text-sm font-crimson">
            Accédez à votre espace membre
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 backdrop-blur-xl border border-[#d4af37]/25 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erreur API */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-xs font-crimson">{apiError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-cinzel font-bold text-[#d4af37] mb-2 tracking-wider">
                EMAIL
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className={`w-full px-4 py-3 bg-zinc-800/60 backdrop-blur-sm border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all font-crimson ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[#d4af37]/20 focus:border-[#d4af37]/50 focus:ring-[#d4af37]/20"
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-2 font-crimson">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-cinzel font-bold text-[#d4af37] mb-2 tracking-wider">
                MOT DE PASSE
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-zinc-800/60 backdrop-blur-sm border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all font-crimson ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[#d4af37]/20 focus:border-[#d4af37]/50 focus:ring-[#d4af37]/20"
                }`}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-2 font-crimson">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#c9a74f] text-black font-cinzel font-bold text-sm tracking-wider rounded-xl shadow-lg shadow-[#d4af37]/30 hover:shadow-[#d4af37]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? "CONNEXION..." : "SE CONNECTER"}
            </button>
          </form>

          {/* Liens */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm font-crimson">
              Pas encore de compte ?{" "}
              <Link
                href="/inscription"
                className="text-[#d4af37] hover:text-[#f4d03f] font-bold transition-colors"
              >
                S'inscrire
              </Link>
            </p>
          </div>

          {/* Retour accueil */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#d4af37] text-xs font-crimson transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
