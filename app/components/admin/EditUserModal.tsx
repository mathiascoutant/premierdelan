'use client'

import { useState } from 'react'
import { FiX, FiSave, FiShield } from 'react-icons/fi'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

interface User {
  id: string
  firstname: string
  lastname: string
  email: string
  phone: string
  admin: number
}

interface EditUserModalProps {
  user: User
  onClose: () => void
  onSave: () => void
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    phone: user.phone,
    admin: user.admin,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleAdmin = () => {
    setFormData(prev => ({ ...prev, admin: prev.admin === 1 ? 0 : 1 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')
      const apiUrl = API_ENDPOINTS.connexion.replace('/api/connexion', `/api/admin/utilisateurs/${user.id}`)
      
      await apiRequest(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-black">Modifier l&apos;utilisateur</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                Prénom
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                Nom
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              required
            />
          </div>

          {/* Toggle Admin */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiShield className="w-5 h-5 text-gray-700" />
                <div>
                  <p className="font-medium text-gray-900">Rôle Administrateur</p>
                  <p className="text-sm text-gray-600">Donner les droits admin à cet utilisateur</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleAdmin}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  formData.admin === 1 ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                    formData.admin === 1 ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSaving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center"
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

