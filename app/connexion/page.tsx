'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiX, FiCheck } from 'react-icons/fi'
import { API_ENDPOINTS, apiRequest } from '../config/api'

export default function ConnexionPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = 'L&apos;email est requis'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format d&apos;email invalide'
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    
    try {
      // Envoi vers l'API
      const response = await apiRequest(API_ENDPOINTS.connexion, {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      setSuccessMessage('Connexion réussie ! Redirection...')
      
      // Sauvegarder le token et les données utilisateur
      if (response.token) {
        localStorage.setItem('auth_token', response.token)
      }
      
      // Sauvegarder les infos utilisateur
      if (response.user) {
        localStorage.setItem('user_data', JSON.stringify(response.user))
      }

      // Rediriger vers le dashboard ou la page d'accueil
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
      
    } catch (error: any) {
      setApiError(error.message || 'Email ou mot de passe incorrect')
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
      <section className="flex items-center justify-center py-16 md:py-24">
        <div className="max-w-md w-full mx-auto px-6">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black mb-4">
              Connexion
            </h1>
            <p className="text-gray-600 font-light">
              Accédez à votre compte
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
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                Email
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

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
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

            {/* Mot de passe oublié */}
            <div className="text-right">
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>

            {/* Link to Signup */}
            <p className="text-sm text-gray-500 text-center pt-4">
              Pas encore de compte ?{' '}
              <Link href="/inscription" className="text-black hover:underline font-medium">
                S&apos;inscrire
              </Link>
            </p>
          </form>

          {/* Info supplémentaire */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Besoin d&apos;aide ? Contactez l&apos;administrateur
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

