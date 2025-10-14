'use client'

import { useState, useEffect } from 'react'
import { useFirebaseNotifications } from './useFirebaseNotifications'

interface ChatNotification {
  id: string
  type: 'invitation' | 'message'
  from: {
    id: string
    firstname: string
    lastname: string
  }
  content: string
  conversationId?: string
  timestamp: string
}

export function useChatNotifications() {
  const [notifications, setNotifications] = useState<ChatNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { checkPermission, checkIfEnabled } = useFirebaseNotifications()

  // Écouter les notifications de chat
  useEffect(() => {
    if (checkPermission() === 'granted' && checkIfEnabled()) {
      // TODO: Écouter les notifications Firebase pour le chat
      setupChatNotifications()
    }
  }, [checkPermission, checkIfEnabled])

  const setupChatNotifications = () => {
    // TODO: Configurer les listeners Firebase pour le chat
    console.log('Configuration des notifications de chat...')
  }

  const sendChatNotification = async (notification: Omit<ChatNotification, 'id' | 'timestamp'>) => {
    try {
      // TODO: Envoyer la notification via Firebase
      console.log('Envoi de notification de chat:', notification)
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error)
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return {
    notifications,
    unreadCount,
    sendChatNotification,
    markAsRead
  }
}
