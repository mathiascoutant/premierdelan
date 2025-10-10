'use client'

import { useState } from 'react'
import { FiX, FiSave, FiCalendar } from 'react-icons/fi'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

interface Event {
  id: string
  titre: string
  date: string
  description: string
  capacite: number
  lieu?: string
  code_soiree?: string
  statut: string
}

interface EditEventModalProps {
  event: Event
  onClose: () => void
  onSave: () => void
}

export default function EditEventModal({ event, onClose, onSave }: EditEventModalProps) {
  // Convertir la date ISO en format datetime-local
  const formatDateForInput = (isoDate: string) => {
    const date = new Date(isoDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [formData, setFormData] = useState({
    titre: event.titre,
    date: formatDateForInput(event.date),
    description: event.description,
    capacite: event.capacite.toString(),
    lieu: event.lieu || '',
    code_soiree: event.code_soiree || '',
    statut: event.statut,
    date_ouverture_inscription: event.date_ouverture_inscription ? formatDateForInput(event.date_ouverture_inscription) : '',
    date_fermeture_inscription: event.date_fermeture_inscription ? formatDateForInput(event.date_fermeture_inscription) : ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')
      const apiUrl = API_ENDPOINTS.connexion.replace('/api/connexion', `/api/admin/evenements/${event.id}`)
      
      await apiRequest(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          capacite: parseInt(formData.capacite),
        }),
      })

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification')
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
            <h2 className="text-lg md:text-xl font-medium text-black">Modifier l&apos;événement</h2>
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
              Date et heure de l&apos;événement *
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                Ouverture inscriptions *
              </label>
              <input
                type="datetime-local"
                name="date_ouverture_inscription"
                value={formData.date_ouverture_inscription}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Début des inscriptions</p>
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                Fermeture inscriptions *
              </label>
              <input
                type="datetime-local"
                name="date_fermeture_inscription"
                value={formData.date_fermeture_inscription}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Fin des inscriptions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                Capacité *
              </label>
              <input
                type="number"
                name="capacite"
                value={formData.capacite}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                Lieu
              </label>
              <input
                type="text"
                name="lieu"
                value={formData.lieu}
                onChange={handleChange}
                placeholder="Ex: Villa Privée"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                Statut
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              >
                <option value="ouvert">Ouvert</option>
                <option value="complet">Complet</option>
                <option value="annule">Annulé</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
              Code soirée
            </label>
            <input
              type="text"
              name="code_soiree"
              value={formData.code_soiree}
              onChange={handleChange}
              placeholder="CODE123"
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
                  Enregistrement...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

