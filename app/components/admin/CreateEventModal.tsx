'use client'

import { useState } from 'react'
import { FiX, FiSave, FiCalendar } from 'react-icons/fi'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

interface CreateEventModalProps {
  onClose: () => void
  onCreate: () => void
}

export default function CreateEventModal({ onClose, onCreate }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    titre: '',
    date: '',
    description: '',
    capacite: '',
    lieu: '',
    code_soiree: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')
      const apiUrl = API_ENDPOINTS.connexion.replace('/api/connexion', '/api/admin/evenements')
      
      await apiRequest(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          capacite: parseInt(formData.capacite),
          statut: 'ouvert'
        }),
      })

      onCreate()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <FiCalendar className="w-5 h-5 text-black" />
            <h2 className="text-lg md:text-xl font-medium text-black">Créer un événement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
              Titre de l&apos;événement *
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Réveillon 2026"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                Date et heure *
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                Capacité (nombre de personnes) *
              </label>
              <input
                type="number"
                name="capacite"
                value={formData.capacite}
                onChange={handleChange}
                placeholder="Ex: 100"
                min="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
              Lieu
            </label>
            <input
              type="text"
              name="lieu"
              value={formData.lieu}
              onChange={handleChange}
              placeholder="Ex: Villa Privée - Côte d'Azur"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
              Code soirée (pour inscription)
            </label>
            <input
              type="text"
              name="code_soiree"
              value={formData.code_soiree}
              onChange={handleChange}
              placeholder="Ex: PARTY2026"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors uppercase"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez l'événement..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary order-2 sm:order-1"
              disabled={isSaving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center order-1 sm:order-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  Créer l&apos;événement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

