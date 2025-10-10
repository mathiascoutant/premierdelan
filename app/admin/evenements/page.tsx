'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiCalendar, FiUsers, FiImage, FiEdit, FiTrash2 } from 'react-icons/fi'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

interface Evenement {
  id: string
  titre: string
  date: string
  description: string
  capacite: number
  inscrits: number
  photos_count: number
  statut: string
}

export default function EvenementsPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvenements()
  }, [])

  const fetchEvenements = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await apiRequest(`${API_ENDPOINTS.connexion.replace('/connexion', '/admin/evenements')}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      setEvenements(response.evenements || [])
    } catch (error) {
      console.error('Erreur chargement événements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black mb-2">
            Gestion des <span className="font-normal">Événements</span>
          </h1>
          <p className="text-gray-600 font-light">
            Créez et gérez vos événements privés
          </p>
        </div>
        <button className="btn-primary flex items-center">
          <FiPlus className="w-4 h-4 mr-2" />
          Créer un événement
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
            Total Événements
          </p>
          <p className="text-3xl font-light text-black">{evenements.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
            À venir
          </p>
          <p className="text-3xl font-light text-black">
            {evenements.filter(e => e.statut === 'ouvert').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
            Total Inscrits
          </p>
          <p className="text-3xl font-light text-black">
            {evenements.reduce((sum, e) => sum + (e.inscrits || 0), 0)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
            Photos Totales
          </p>
          <p className="text-3xl font-light text-black">
            {evenements.reduce((sum, e) => sum + (e.photos_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* Liste des événements */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des événements...</p>
          </div>
        ) : evenements.length === 0 ? (
          <div className="p-12 text-center">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Aucun événement créé</p>
            <button className="btn-primary">
              <FiPlus className="inline-block w-4 h-4 mr-2" />
              Créer le premier événement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-gray-200">
            {evenements.map((event) => (
              <div key={event.id} className="bg-white p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-medium text-black">
                        {event.titre}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.statut === 'ouvert' 
                          ? 'bg-green-100 text-green-700'
                          : event.statut === 'complet'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {event.statut}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 font-light">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center">
                        <FiUsers className="w-4 h-4 mr-2" />
                        {event.inscrits || 0} / {event.capacite} inscrits
                      </div>
                      <div className="flex items-center">
                        <FiImage className="w-4 h-4 mr-2" />
                        {event.photos_count || 0} photos
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-600 hover:text-black transition-colors">
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:text-red-700 transition-colors">
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

