'use client'

import { useEffect, useRef, useState } from 'react'

interface WebSocketMessage {
  type: string
  conversation_id?: string
  message?: any
  invitation?: any
  [key: string]: any
}

export function useChatWebSocket(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messageCallbacksRef = useRef<Set<(data: any) => void>>(new Set())
  const invitationCallbacksRef = useRef<Set<(data: any) => void>>(new Set())
  const invitationAcceptedCallbacksRef = useRef<Set<(data: any) => void>>(new Set())
  const invitationRejectedCallbacksRef = useRef<Set<(data: any) => void>>(new Set())

  useEffect(() => {
    if (!userId) return

    // Connexion au WebSocket natif
    const ws = new WebSocket('wss://believable-spontaneity-production.up.railway.app/ws/chat')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('🔌 WebSocket OUVERT')
      setIsConnected(true)
      
      // S'authentifier avec le token
      const token = localStorage.getItem('token')
      console.log('🔑 Envoi authentification WebSocket...')
      if (token) {
        ws.send(JSON.stringify({
          type: 'authenticate',
          token: token
        }))
      } else {
        console.error('❌ Aucun token disponible pour WebSocket')
      }
    }

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data)
        console.log('📨 Message WebSocket reçu:', data)
        
        // Gérer les événements selon le type
        switch(data.type) {
          case 'authenticated':
            console.log('✅ WebSocket authentifié')
            break
          case 'new_message':
            messageCallbacksRef.current.forEach(cb => cb(data))
            break
          case 'new_invitation':
            invitationCallbacksRef.current.forEach(cb => cb(data))
            break
          case 'invitation_accepted':
            invitationAcceptedCallbacksRef.current.forEach(cb => cb(data))
            break
          case 'invitation_rejected':
            invitationRejectedCallbacksRef.current.forEach(cb => cb(data))
            break
        }
      } catch (error) {
        console.error('❌ Erreur parsing message WebSocket:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('❌ WebSocket erreur:', error)
    }

    ws.onclose = (event) => {
      console.log('❌ WebSocket fermé:', event.code, event.reason)
      setIsConnected(false)
    }

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [userId])

  // Rejoindre une conversation
  const joinConversation = (conversationId: string) => {
    if (wsRef.current && isConnected) {
      console.log('👋 Rejoindre conversation:', conversationId)
      wsRef.current.send(JSON.stringify({
        type: 'join_conversation',
        conversation_id: conversationId
      }))
    }
  }

  // Quitter une conversation
  const leaveConversation = (conversationId: string) => {
    if (wsRef.current && isConnected) {
      console.log('👋 Quitter conversation:', conversationId)
      wsRef.current.send(JSON.stringify({
        type: 'leave_conversation',
        conversation_id: conversationId
      }))
    }
  }

  // Écouter les nouveaux messages
  const onNewMessage = (callback: (data: any) => void) => {
    messageCallbacksRef.current.add(callback)
    return () => {
      messageCallbacksRef.current.delete(callback)
    }
  }

  // Écouter les nouvelles invitations
  const onNewInvitation = (callback: (data: any) => void) => {
    invitationCallbacksRef.current.add(callback)
    return () => {
      invitationCallbacksRef.current.delete(callback)
    }
  }

  // Écouter les invitations acceptées
  const onInvitationAccepted = (callback: (data: any) => void) => {
    invitationAcceptedCallbacksRef.current.add(callback)
    return () => {
      invitationAcceptedCallbacksRef.current.delete(callback)
    }
  }

  // Écouter les invitations rejetées
  const onInvitationRejected = (callback: (data: any) => void) => {
    invitationRejectedCallbacksRef.current.add(callback)
    return () => {
      invitationRejectedCallbacksRef.current.delete(callback)
    }
  }

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    onNewMessage,
    onNewInvitation,
    onInvitationAccepted,
    onInvitationRejected,
  }
}

