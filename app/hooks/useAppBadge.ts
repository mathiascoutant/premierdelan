'use client'

import { useEffect } from 'react'
import { apiRequest } from '../config/api'

/**
 * Hook pour gérer le badge de notification sur l'icône PWA
 * Affiche le nombre de messages non lus sur l'icône de l'écran d'accueil
 */
export function useAppBadge(userId: string | null, isAdmin: boolean) {
  useEffect(() => {
    if (!userId || !isAdmin) {
      // Si pas connecté ou pas admin, effacer le badge
      if ('setAppBadge' in navigator) {
        navigator.clearAppBadge?.()
      }
      return
    }

    const updateBadge = async () => {
      try {
        // Récupérer les conversations pour compter les messages non lus
        const data = await apiRequest(
          'https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations',
          { method: 'GET' }
        )

        if (data.success) {
          const conversations = data.conversations || data.data?.conversations || []
          
          // Calculer le total de messages non lus
          const totalUnread = conversations.reduce((total: number, conv: any) => {
            const unreadCount = conv.unread_count || conv.unreadCount || 0
            return total + unreadCount
          }, 0)

          // Mettre à jour le badge
          if ('setAppBadge' in navigator) {
            if (totalUnread > 0) {
              console.log(`🔴 Badge PWA: ${totalUnread} message(s) non lu(s)`)
              navigator.setAppBadge?.(totalUnread)
            } else {
              console.log('✅ Badge PWA effacé (aucun message non lu)')
              navigator.clearAppBadge?.()
            }
          } else {
            console.log('⚠️ Badging API non supportée sur ce navigateur')
          }
        }
      } catch (error) {
        console.error('❌ Erreur mise à jour badge:', error)
      }
    }

    // Mettre à jour immédiatement
    updateBadge()

    // Mettre à jour toutes les 30 secondes
    const interval = setInterval(updateBadge, 30000)

    // Mettre à jour quand la page devient visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateBadge()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Nettoyage
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId, isAdmin])

  // Fonction utilitaire pour effacer manuellement le badge
  const clearBadge = () => {
    if ('setAppBadge' in navigator) {
      navigator.clearAppBadge?.()
    }
  }

  return { clearBadge }
}

