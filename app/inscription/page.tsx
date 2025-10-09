'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi'
import { API_ENDPOINTS, apiRequest } from '../config/api'

export default function InscriptionPage() {
  const [formData, setFormData] = useState({
    codesoiree: '',
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')

  // Validation email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validation téléphone français
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  // Validation mot de passe (minimum 8 caractères)
  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // Reset messages
    setSuccessMessage('')
    setApiError('')

    // Validation code soirée
    if (!formData.codesoiree.trim()) {
      newErrors.codesoiree = 'Le code soirée est requis'
    }

    // Validation prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis'
    }

    // Validation nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis'
    }

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = 'L&apos;email est requis'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format d&apos;email invalide'
    }

    // Validation téléphone
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis'
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide (ex: 06 12 34 56 78)'
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Minimum 8 caractères'
    }

    // Validation confirmation mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est requise'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    
    try {
      // Envoi vers l'API
      const response = await apiRequest(API_ENDPOINTS.inscription, {
        method: 'POST',
        body: JSON.stringify({
          code_soiree: formData.codesoiree,
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          password: formData.password,
        }),
      })

      setSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.')
      
      // Réinitialiser le formulaire
      setFormData({
        codesoiree: '',
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: '',
      })

      // Rediriger vers la connexion après 2 secondes
      setTimeout(() => {
        const basePath = process.env.NODE_ENV === 'production' ? '/premierdelan' : ''
        window.location.href = `${basePath}/connexion`
      }, 2000)
      
    } catch (error: any) {
      setApiError(error.message || 'Une erreur est survenue lors de l&apos;inscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header Simple */}
      <header className="border-b border-gray-200">
        <nav className="section-container py-6">
          <Link href="/" className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </nav>
      </header>

      {/* Formulaire */}
      <section className="py-16 md:py-24">
        <div className="max-w-lg mx-auto px-6">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black mb-4">
              Inscription
            </h1>
            <p className="text-gray-600 font-light">
              Créez votre compte pour accéder aux événements
            </p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm flex items-center">
                <FiCheck className="w-5 h-5 mr-2" />
                {successMessage}
              </p>
            </div>
          )}

          {apiError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm flex items-center">
                <FiX className="w-5 h-5 mr-2" />
                {apiError}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Code Soirée */}
            <div>
              <label htmlFor="codesoiree" className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                Code soirée *
              </label>
              <input
                type="text"
                id="codesoiree"
                name="codesoiree"
                value={formData.codesoiree}
                onChange={handleChange}
                placeholder="Entrez le code fourni par l'admin"
                className={`w-full px-0 py-3 bg-transparent border-b ${
                  errors.codesoiree ? 'border-red-500' : 'border-gray-300'
                } focus:border-black focus:outline-none transition-colors text-black placeholder:text-gray-400`}
              />
              {errors.codesoiree && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FiX className="w-4 h-4 mr-1" />
                  {errors.codesoiree}
                </p>
              )}
            </div>

            {/* Prénom et Nom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="prenom" className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className={`w-full px-0 py-3 bg-transparent border-b ${
                    errors.prenom ? 'border-red-500' : 'border-gray-300'
                  } focus:border-black focus:outline-none transition-colors text-black`}
                />
                {errors.prenom && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.prenom}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="nom" className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                  Nom *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`w-full px-0 py-3 bg-transparent border-b ${
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  } focus:border-black focus:outline-none transition-colors text-black`}
                />
                {errors.nom && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.nom}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemple@email.com"
                className={`w-full px-0 py-3 bg-transparent border-b ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:border-black focus:outline-none transition-colors text-black placeholder:text-gray-400`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FiX className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                Téléphone *
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="06 12 34 56 78"
                className={`w-full px-0 py-3 bg-transparent border-b ${
                  errors.telephone ? 'border-red-500' : 'border-gray-300'
                } focus:border-black focus:outline-none transition-colors text-black placeholder:text-gray-400`}
              />
              {errors.telephone && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FiX className="w-4 h-4 mr-1" />
                  {errors.telephone}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                Mot de passe *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 caractères"
                className={`w-full px-0 py-3 bg-transparent border-b ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:border-black focus:outline-none transition-colors text-black placeholder:text-gray-400`}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FiX className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                Confirmation mot de passe *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez votre mot de passe"
                className={`w-full px-0 py-3 bg-transparent border-b ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } focus:border-black focus:outline-none transition-colors text-black placeholder:text-gray-400`}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FiX className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
              {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <FiCheck className="w-4 h-4 mr-1" />
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Inscription en cours...' : 'Créer mon compte'}
              </button>
            </div>

            {/* Link to Login */}
            <p className="text-sm text-gray-500 text-center pt-4">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="text-black hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

