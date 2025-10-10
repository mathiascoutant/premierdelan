'use client'

import { useState } from 'react'
import { FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

interface Event {
  id: string
  titre: string
  date: string
  inscrits?: number
}

interface DeleteEventModalProps {
  event: Event
  onClose: () => void
  onDelete: () => void
}

export default function DeleteEventModal({ event, onClose, onDelete }: DeleteEventModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')
      const apiUrl = API_ENDPOINTS.connexion.replace('/api/connexion', `/api/admin/evenements/${event.id}`)
      
      await apiRequest(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      onDelete()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-medium text-black">Supprimer l&apos;événement</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 md:p-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-2">
                Êtes-vous sûr de vouloir supprimer cet événement ?
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Cette action est irréversible. Tous les inscrits et photos seront supprimés.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {event.titre}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(event.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {event.inscrits && event.inscrits > 0 && (
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ {event.inscrits} personne(s) inscrite(s)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary order-2 sm:order-1"
              disabled={isDeleting}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 px-8 py-3.5 bg-red-600 text-white font-medium text-sm tracking-wide uppercase hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center order-1 sm:order-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

