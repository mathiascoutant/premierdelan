'use client'

import { useState } from 'react'
import { API_ENDPOINTS } from '../config/api'

// Fonction utilitaire pour convertir base64 en Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function useNotifications() {
  const [isActivating, setIsActivating] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const checkPermission = () => {
    if (!('Notification' in window)) {
      return 'unsupported'
    }
    return Notification.permission
  }

  const activerNotifications = async (userEmail: string) => {
    setIsActivating(true)
    setNotificationStatus(null)

    try {
      // Vérifier le support
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Les notifications push ne sont pas supportées par votre navigateur')
      }

      // Enregistrer le Service Worker
      const basePath = process.env.NODE_ENV === 'production' ? '/premierdelan' : ''
      const registration = await navigator.serviceWorker.register(
        `${basePath}/service-worker.js`
      )
      console.log('✅ Service Worker enregistré', registration)

      // Attendre que le SW soit prêt
      await navigator.serviceWorker.ready

      // Demander la permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Permission refusée. Veuillez autoriser les notifications dans les paramètres de votre navigateur.')
      }

      // Récupérer la clé VAPID publique
      const vapidResponse = await fetch(API_ENDPOINTS.vapidPublicKey, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      })
      
      if (!vapidResponse.ok) {
        throw new Error('Erreur lors de la récupération de la clé VAPID')
      }

      const { publicKey } = await vapidResponse.json()

      // S'abonner aux notifications push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Envoyer l'abonnement au serveur
      const subscribeResponse = await fetch(API_ENDPOINTS.notificationSubscribe, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          user_id: userEmail,
          subscription: subscription.toJSON(),
        }),
      })

      if (!subscribeResponse.ok) {
        throw new Error('Erreur lors de l\'enregistrement de l\'abonnement')
      }

      setNotificationStatus({
        type: 'success',
        message: '✅ Notifications activées avec succès !',
      })

      // Sauvegarder l'état dans localStorage
      localStorage.setItem('notifications_enabled', 'true')

      return true
    } catch (error: any) {
      console.error('Erreur activation notifications:', error)
      setNotificationStatus({
        type: 'error',
        message: error.message || 'Erreur lors de l\'activation des notifications',
      })
      return false
    } finally {
      setIsActivating(false)
    }
  }

  const checkIfEnabled = () => {
    return localStorage.getItem('notifications_enabled') === 'true'
  }

  return {
    activerNotifications,
    isActivating,
    notificationStatus,
    setNotificationStatus,
    checkPermission,
    checkIfEnabled,
  }
}

