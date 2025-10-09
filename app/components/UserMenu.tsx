'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FiUser, FiSettings, FiLogOut, FiChevronDown, FiBell } from 'react-icons/fi'
import { User } from '../hooks/useAuth'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import NotificationButton from './NotificationButton'

interface UserMenuProps {
  user: User
  onLogout: () => void
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTestingNotification, setIsTestingNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Initiales pour l'avatar
  const initials = `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase()

  // Envoyer une notification de test
  const handleTestNotification = async () => {
    setIsTestingNotification(true)
    setNotificationMessage(null)

    try {
      const token = localStorage.getItem('auth_token')
      
      await apiRequest(API_ENDPOINTS.notificationTest, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.email, // ou un autre identifiant
        }),
      })

      setNotificationMessage({ type: 'success', text: 'Notification envoyée !' })
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        setNotificationMessage(null)
      }, 3000)
      
    } catch (error: any) {
      setNotificationMessage({ type: 'error', text: error.message || 'Erreur lors de l\'envoi' })
      
      setTimeout(() => {
        setNotificationMessage(null)
      }, 3000)
    } finally {
      setIsTestingNotification(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton Profil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      >
        {/* Photo de profil ou initiales */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-medium text-sm">
          {user.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={user.photo} 
              alt={user.prenom} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        
        {/* Prénom (caché sur mobile) */}
        <div className="hidden md:flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-900">
            {user.prenom}
          </span>
          <FiChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
          {/* Info utilisateur */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user.prenom} {user.nom}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {user.email}
            </p>
          </div>

          {/* Options du menu */}
          <div className="py-2">
            <Link
              href="/profil"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FiUser className="w-4 h-4 mr-3" />
              Mon profil
            </Link>

            {/* Activer les notifications push */}
            <NotificationButton userEmail={user.email} />

            <div className="border-t border-gray-100 my-2"></div>

            {/* Bouton notification de test */}
            <button
              onClick={handleTestNotification}
              disabled={isTestingNotification}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiBell className={`w-4 h-4 mr-3 ${isTestingNotification ? 'animate-pulse' : ''}`} />
              {isTestingNotification ? 'Envoi...' : 'Tester notification'}
            </button>

            {/* Message de feedback */}
            {notificationMessage && (
              <div className={`mx-4 my-2 px-3 py-2 rounded text-xs ${
                notificationMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {notificationMessage.text}
              </div>
            )}
            
            <Link
              href="/mes-evenements"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FiSettings className="w-4 h-4 mr-3" />
              Mes événements
            </Link>
          </div>

          {/* Déconnexion */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                setIsOpen(false)
                onLogout()
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

