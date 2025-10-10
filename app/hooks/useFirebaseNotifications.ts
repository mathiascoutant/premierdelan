'use client'

import { useState, useEffect } from 'react'
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { firebaseConfig, vapidKey } from '../config/firebase'
import { API_ENDPOINTS, apiRequest } from '../config/api'

export function useFirebaseNotifications() {
  const [isActivating, setIsActivating] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [isSupport, setIsSupport] = useState(false)

  useEffect(() => {
    // Vérifier le support au montage du composant
    isSupported().then(setIsSupport)
  }, [])

  const checkPermission = () => {
    if (!('Notification' in window)) {
      return 'unsupported'
    }
    return Notification.permission
  }

  const checkIfEnabled = () => {
    return localStorage.getItem('fcm_enabled') === 'true'
  }

  const activerNotifications = async (userEmail: string) => {
    setIsActivating(true)
    setNotificationStatus(null)

    try {
      console.log('📱 Activation des notifications FCM...')

      // Vérifier le support
      const supported = await isSupported()
      if (!supported) {
        throw new Error('Les notifications ne sont pas supportées par votre navigateur')
      }

      if (!('serviceWorker' in navigator)) {
        throw new Error('Les Service Workers ne sont pas supportés')
      }

      // Initialiser Firebase (si pas déjà fait)
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
      const messaging = getMessaging(app)

      // Enregistrer le Service Worker
      const basePath = process.env.NODE_ENV === 'production' ? '/premierdelan' : ''
      const registration = await navigator.serviceWorker.register(
        `${basePath}/firebase-messaging-sw.js`
      )
      console.log('✅ Service Worker Firebase enregistré')

      // Attendre que le SW soit prêt
      await navigator.serviceWorker.ready

      // Demander la permission
      const permission = await Notification.requestPermission()
      console.log('Permission:', permission)

      if (permission !== 'granted') {
        throw new Error('Permission refusée. Veuillez autoriser les notifications dans les paramètres de votre navigateur.')
      }

      // Obtenir le token FCM
      const fcmToken = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration,
      })

      console.log('✅ Token FCM obtenu:', fcmToken)

      // Envoyer le token au backend
      await apiRequest(API_ENDPOINTS.fcmSubscribe, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userEmail,
          fcm_token: fcmToken,
          device: 'Web',
          user_agent: navigator.userAgent,
        }),
      })

      console.log('✅ Abonné aux notifications FCM!')

      setNotificationStatus({
        type: 'success',
        message: '✅ Notifications activées avec succès !',
      })

      // Sauvegarder l'état
      localStorage.setItem('fcm_enabled', 'true')
      localStorage.setItem('fcm_token', fcmToken)

      // Écouter les messages au premier plan (juste pour logger)
      // Note: Le Service Worker gère déjà l'affichage de la notification
      onMessage(messaging, (payload) => {
        console.log('📩 Notification reçue au premier plan:', payload)
        // Pas de new Notification() ici pour éviter les doublons
        // Le Service Worker s'en charge automatiquement
      })

      return true
    } catch (error: any) {
      console.error('❌ Erreur activation FCM:', error)
      setNotificationStatus({
        type: 'error',
        message: error.message || 'Erreur lors de l\'activation des notifications',
      })
      return false
    } finally {
      setIsActivating(false)
    }
  }

  return {
    activerNotifications,
    isActivating,
    notificationStatus,
    setNotificationStatus,
    checkPermission,
    checkIfEnabled,
    isSupport,
  }
}

