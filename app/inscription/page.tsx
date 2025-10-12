"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export default function InscriptionPage() {
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

  // Validation email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validation téléphone français
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Validation mot de passe (minimum 8 caractères)
  const validatePassword = (password: string) => {
    return password.length >= 8;
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

    // Validation code soirée
    if (!formData.codesoiree.trim()) {
      newErrors.codesoiree = "Le code soirée est requis";
    }

    // Validation prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    // Validation nom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation téléphone
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = "Format invalide";
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Minimum 8 caractères";
    }

    // Validation confirmation mot de passe
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
      // Envoi vers l'API
      const response = await apiRequest(API_ENDPOINTS.inscription, {
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

      setSuccessMessage("Inscription réussie !");

      // Réinitialiser le formulaire
      setFormData({
        codesoiree: "",
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        password: "",
        confirmPassword: "",
      });

      // Rediriger vers la connexion après 2 secondes
      setTimeout(() => {
        const basePath =
          process.env.NODE_ENV === "production" ? "/premierdelan" : "";
        window.location.href = `${basePath}/connexion`;
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
    <div className="h-screen bg-ink flex overflow-hidden">
      {/* Partie gauche - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-parchment h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-gold text-4xl mb-3">⚜</div>
            <h1 className="font-cinzel text-xl text-ink tracking-[0.3em]">
              PREMIER DE L&apos;AN
            </h1>
          </div>

          {/* Bouton retour */}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-stone hover:text-ink transition-colors mb-6 group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-crimson">Retour</span>
          </Link>

          {/* Titre */}
          <div className="mb-6">
            <h2 className="font-cinzel text-2xl md:text-3xl text-ink mb-1">
              Inscription
            </h2>
            <p className="font-crimson text-stone text-sm">
              Créez votre compte pour rejoindre nos célébrations.
            </p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500">
              <p className="text-green-700 text-sm flex items-center font-crimson">
                <FiCheck className="w-4 h-4 mr-2" />
                {successMessage}
              </p>
            </div>
          )}

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700 text-sm flex items-center font-crimson">
                <FiX className="w-4 h-4 mr-2" />
                {apiError}
              </p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code Soirée */}
            <div>
              <label
                htmlFor="codesoiree"
                className="block text-xs font-medium text-ink mb-1.5 font-crimson"
              >
                Code soirée *
              </label>
              <input
                type="text"
                id="codesoiree"
                name="codesoiree"
                value={formData.codesoiree}
                onChange={handleChange}
                placeholder="Code fourni"
                className={`w-full px-3 py-2.5 bg-white border ${
                  errors.codesoiree
                    ? "border-red-500"
                    : "border-stone/30 focus:border-gold"
                } focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all text-ink text-sm placeholder:text-stone/50 font-crimson`}
              />
              {errors.codesoiree && (
                <p className="mt-1 text-xs text-red-600 font-crimson">
                  {errors.codesoiree}
                </p>
              )}
            </div>

            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="prenom"
                  className="block text-xs font-medium text-ink mb-1.5 font-crimson"
                >
                  Prénom *
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  className={`w-full px-3 py-2.5 bg-white border ${
                    errors.prenom
                      ? "border-red-500"
                      : "border-stone/30 focus:border-gold"
                  } focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all text-ink text-sm placeholder:text-stone/50 font-crimson`}
                />
                {errors.prenom && (
                  <p className="mt-1 text-xs text-red-600 font-crimson">
                    {errors.prenom}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="nom"
                  className="block text-xs font-medium text-ink mb-1.5 font-crimson"
                >
                  Nom *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className={`w-full px-3 py-2.5 bg-white border ${
                    errors.nom
                      ? "border-red-500"
                      : "border-stone/30 focus:border-gold"
                  } focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all text-ink text-sm placeholder:text-stone/50 font-crimson`}
                />
                {errors.nom && (
                  <p className="mt-1 text-xs text-red-600 font-crimson">
                    {errors.nom}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-ink mb-1.5 font-crimson"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className={`w-full px-3 py-2.5 bg-white border ${
                  errors.email
                    ? "border-red-500"
                    : "border-stone/30 focus:border-gold"
                } focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all text-ink text-sm placeholder:text-stone/50 font-crimson`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-crimson">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label
                htmlFor="telephone"
                className="block text-xs font-medium text-ink mb-1.5 font-crimson"
              >
                Téléphone *
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="06 12 34 56 78"
                className={`w-full px-3 py-2.5 bg-white border ${
                  errors.telephone
                    ? "border-red-500"
                    : "border-stone/30 focus:border-gold"
                } focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all text-ink text-sm placeholder:text-stone/50 font-crimson`}
              />
              {errors.telephone && (
                <p className="mt-1 text-xs text-red-600 font-crimson">
                  {errors.telephone}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-ink mb-1.5 font-crimson"
              >
                Mot de passe *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 caractères"
                className={`w-full px-3 py-2.5 bg-white border ${
                  errors.password
                    ? "border-red-500"
                    : "border-stone/30 focus:border-gold"
                } focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all text-ink text-sm placeholder:text-stone/50 font-crimson`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-crimson">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-ink mb-1.5 font-crimson"
              >
                Confirmer *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez le mot de passe"
                className={`w-full px-3 py-2.5 bg-white border ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-stone/30 focus:border-gold"
                } focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all text-ink text-sm placeholder:text-stone/50 font-crimson`}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-600 font-crimson">
                  {errors.confirmPassword}
                </p>
              ) : (
                formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-xs text-green-600 flex items-center font-crimson">
                    <FiCheck className="w-3 h-3 mr-1" />
                    Mots de passe identiques
                  </p>
                )
              )}
            </div>

            {/* Bouton de soumission */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3.5 bg-gold hover:bg-gold-dark text-ink font-cinzel tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm"
              >
                {isSubmitting ? "Création..." : "Créer mon compte"}
              </button>
            </div>

            {/* Lien connexion */}
            <p className="text-center text-sm text-stone font-crimson pt-2">
              Déjà inscrit ?{" "}
              <Link
                href="/connexion"
                className="text-ink hover:text-gold transition-colors font-medium"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Partie droite - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brown via-ink-light to-ink h-screen">
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
              Rejoignez-nous pour une célébration médiévale inoubliable
            </p>
            <div className="flex items-center justify-center space-x-2 text-gold/50">
              <div className="w-8 h-px bg-gold/50"></div>
              <span className="text-xs">✦</span>
              <div className="w-8 h-px bg-gold/50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
