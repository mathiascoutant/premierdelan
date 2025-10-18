"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export default function InscriptionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    codesoiree: "",
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
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

    setSuccessMessage("");
    setApiError("");

    if (!formData.codesoiree.trim()) {
      newErrors.codesoiree = "Le code soirée est requis";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = "Format de téléphone invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Minimum 8 caractères";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation est requise";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest(API_ENDPOINTS.inscription, {
        method: "POST",
        body: JSON.stringify({
          code_soiree: formData.codesoiree,
          firstname: formData.prenom,
          lastname: formData.nom,
          email: formData.email,
          phone: formData.telephone,
          password: formData.password,
        }),
      });

      setSuccessMessage("Inscription réussie ! Redirection...");

      setTimeout(() => {
        router.push("/connexion");
      }, 2000);
    } catch (error: any) {
      setApiError(
        error.message || "Une erreur est survenue lors de l'inscription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden relative flex items-center justify-center px-4 pb-20">
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

      {/* Card d'inscription */}
      <div className="w-full max-w-4xl h-[calc(100vh-6rem)] flex flex-col">
        {/* Header compact */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] flex items-center justify-center shadow-xl shadow-[#d4af37]/30">
              <span className="text-xl">⚜</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-cinzel font-bold text-white leading-tight">
                Inscription
              </h1>
              <p className="text-gray-400 text-[10px] font-crimson">
                Rejoignez nos célébrations
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 backdrop-blur-xl border border-[#d4af37]/25 rounded-3xl p-4 shadow-2xl flex-1 flex flex-col overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="space-y-2 flex-1 flex flex-col"
          >
            {/* Messages de succès/erreur */}
            {(successMessage || apiError) && (
              <div
                className={`${
                  successMessage
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                } border rounded-lg p-2`}
              >
                <p
                  className={`${
                    successMessage ? "text-green-400" : "text-red-400"
                  } text-[10px] font-crimson`}
                >
                  {successMessage || apiError}
                </p>
              </div>
            )}

            {/* Grid 3 colonnes pour optimiser l'espace */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
              {/* Prénom */}
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#d4af37] mb-1 tracking-wider">
                  PRÉNOM
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  className={`w-full px-3 py-2 bg-zinc-800/60 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-all font-crimson ${
                    errors.prenom
                      ? "border-red-500"
                      : "border-[#d4af37]/20 focus:border-[#d4af37]/50"
                  }`}
                />
                {errors.prenom && (
                  <p className="text-red-400 text-[10px] mt-0.5 font-crimson">
                    {errors.prenom}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#d4af37] mb-1 tracking-wider">
                  NOM
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className={`w-full px-3 py-2 bg-zinc-800/60 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-all font-crimson ${
                    errors.nom
                      ? "border-red-500"
                      : "border-[#d4af37]/20 focus:border-[#d4af37]/50"
                  }`}
                />
                {errors.nom && (
                  <p className="text-red-400 text-[10px] mt-0.5 font-crimson">
                    {errors.nom}
                  </p>
                )}
              </div>

              {/* Code soirée */}
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#d4af37] mb-1 tracking-wider">
                  CODE
                </label>
                <input
                  type="text"
                  name="codesoiree"
                  value={formData.codesoiree}
                  onChange={handleChange}
                  placeholder="PREMIER2026"
                  className={`w-full px-3 py-2 bg-zinc-800/60 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-all font-crimson uppercase ${
                    errors.codesoiree
                      ? "border-red-500"
                      : "border-[#d4af37]/20 focus:border-[#d4af37]/50"
                  }`}
                />
                {errors.codesoiree && (
                  <p className="text-red-400 text-[10px] mt-0.5 font-crimson">
                    {errors.codesoiree}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#d4af37] mb-1 tracking-wider">
                  EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className={`w-full px-3 py-2 bg-zinc-800/60 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-all font-crimson ${
                    errors.email
                      ? "border-red-500"
                      : "border-[#d4af37]/20 focus:border-[#d4af37]/50"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-[10px] mt-0.5 font-crimson">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#d4af37] mb-1 tracking-wider">
                  TÉLÉPHONE
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className={`w-full px-3 py-2 bg-zinc-800/60 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-all font-crimson ${
                    errors.telephone
                      ? "border-red-500"
                      : "border-[#d4af37]/20 focus:border-[#d4af37]/50"
                  }`}
                />
                {errors.telephone && (
                  <p className="text-red-400 text-[10px] mt-0.5 font-crimson">
                    {errors.telephone}
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#d4af37] mb-1 tracking-wider">
                  MOT DE PASSE
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 bg-zinc-800/60 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-all font-crimson ${
                    errors.password
                      ? "border-red-500"
                      : "border-[#d4af37]/20 focus:border-[#d4af37]/50"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-400 text-[10px] mt-0.5 font-crimson">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#d4af37] mb-1 tracking-wider">
                  CONFIRMATION
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 bg-zinc-800/60 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-all font-crimson ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-[#d4af37]/20 focus:border-[#d4af37]/50"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-[10px] mt-0.5 font-crimson">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Bouton submit + lien */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#c9a74f] text-black font-cinzel font-bold text-sm tracking-wider rounded-xl shadow-lg shadow-[#d4af37]/30 hover:shadow-[#d4af37]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isSubmitting ? "INSCRIPTION..." : "S'INSCRIRE"}
              </button>

              <div className="text-center">
                <p className="text-gray-400 text-xs font-crimson">
                  Déjà un compte ?{" "}
                  <Link
                    href="/connexion"
                    className="text-[#d4af37] hover:text-[#f4d03f] font-bold transition-colors"
                  >
                    Se connecter
                  </Link>
                  {" · "}
                  <Link
                    href="/"
                    className="text-gray-500 hover:text-[#d4af37] transition-colors"
                  >
                    Accueil
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
