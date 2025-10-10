'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiMail, FiPhone, FiShield, FiTrash2, FiEdit } from 'react-icons/fi'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

interface Utilisateur {
  id: string
  firstname: string
  lastname: string
  email: string
  phone: string
  admin: number
  created_at: string
  code_soiree?: string
}

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUtilisateurs()
  }, [])

  const fetchUtilisateurs = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const apiUrl = API_ENDPOINTS.connexion.replace('/api/connexion', '/api/admin/utilisateurs')
      const response = await apiRequest(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      setUtilisateurs(response.utilisateurs || [])
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      // Données de test en cas d'erreur
      setUtilisateurs([
        {
          id: '1',
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          phone: '0612345678',
          admin: 0,
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = utilisateurs.filter(user =>
    (user.firstname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.lastname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-black mb-2">
          Gestion des <span className="font-normal">Utilisateurs</span>
        </h1>
        <p className="text-gray-600 font-light">
          Liste complète des utilisateurs inscrits sur la plateforme
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
            Total Utilisateurs
          </p>
          <p className="text-3xl font-light text-black">{utilisateurs.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
            Administrateurs
          </p>
          <p className="text-3xl font-light text-black">
            {utilisateurs.filter(u => u.admin === 1).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
            Utilisateurs Standards
          </p>
          <p className="text-3xl font-light text-black">
            {utilisateurs.filter(u => u.admin !== 1).length}
          </p>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((utilisateur) => (
                  <tr key={utilisateur.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {(utilisateur.firstname?.charAt(0) || '').toUpperCase()}{(utilisateur.lastname?.charAt(0) || '').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {utilisateur.firstname} {utilisateur.lastname}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMail className="w-4 h-4 mr-2" />
                          {utilisateur.email || 'Non renseigné'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiPhone className="w-4 h-4 mr-2" />
                          {utilisateur.phone || 'Non renseigné'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {utilisateur.admin === 1 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                          <FiShield className="w-3 h-3 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Utilisateur
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(utilisateur.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-600 hover:text-black transition-colors">
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-700 transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

