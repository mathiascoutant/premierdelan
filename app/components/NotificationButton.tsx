'use client'

import { FiBell, FiBellOff, FiCheck, FiX } from 'react-icons/fi'
import { useFirebaseNotifications } from '../hooks/useFirebaseNotifications'

interface NotificationButtonProps {
  userEmail: string
  className?: string
}

export default function NotificationButton({ userEmail, className = '' }: NotificationButtonProps) {
  const {
    activerNotifications,
    isActivating,
    notificationStatus,
    setNotificationStatus,
    checkPermission,
    checkIfEnabled,
  } = useFirebaseNotifications()

  const permission = checkPermission()
  const isEnabled = checkIfEnabled()

  const handleClick = async () => {
    await activerNotifications(userEmail)
  }

  // Auto-hide notification après 5 secondes
  if (notificationStatus) {
    setTimeout(() => {
      setNotificationStatus(null)
    }, 5000)
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={isActivating || permission === 'granted' && isEnabled}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {permission === 'granted' && isEnabled ? (
          <>
            <FiBell className="w-4 h-4 mr-3 text-green-600" />
            <span>Notifications activées</span>
          </>
        ) : (
          <>
            <FiBellOff className={`w-4 h-4 mr-3 ${isActivating ? 'animate-pulse' : ''}`} />
            <span>{isActivating ? 'Activation...' : 'Activer les notifications'}</span>
          </>
        )}
      </button>

      {notificationStatus && (
        <div
          className={`mx-4 my-2 px-3 py-2 rounded text-xs flex items-center ${
            notificationStatus.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : notificationStatus.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {notificationStatus.type === 'success' ? (
            <FiCheck className="w-4 h-4 mr-2 flex-shrink-0" />
          ) : (
            <FiX className="w-4 h-4 mr-2 flex-shrink-0" />
          )}
          <span className="text-xs">{notificationStatus.message}</span>
        </div>
      )}
    </div>
  )
}

