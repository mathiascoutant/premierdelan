'use client'

import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Link from 'next/link'
import { FiUsers, FiCalendar, FiSettings, FiArrowLeft } from 'react-icons/fi'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAdmin } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAdmin()) {
      // Rediriger si pas admin
      const basePath = process.env.NODE_ENV === 'production' ? '/premierdelan' : ''
      window.location.href = `${basePath}/`
    }
  }, [isLoading, isAdmin])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin()) {
    return null
  }

  const menuItems = [
    { label: 'Utilisateurs', href: '/admin/utilisateurs', icon: FiUsers },
    { label: 'Événements', href: '/admin/evenements', icon: FiCalendar },
    { label: 'Paramètres', href: '/admin/parametres', icon: FiSettings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-black text-white border-b border-gray-800">
        <div className="section-container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
                <FiArrowLeft className="w-4 h-4" />
                <span>Retour au site</span>
              </Link>
              <div className="w-px h-6 bg-gray-700"></div>
              <h1 className="text-xl font-medium tracking-tight">
                ADMIN - Premier de l&apos;An
              </h1>
            </div>
            <div className="text-sm text-gray-400">
              {user?.prenom} {user?.nom}
            </div>
          </div>
        </div>
      </header>

      <div className="section-container py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-8">
              <div className="p-4 border-b border-gray-200">
                <p className="text-xs tracking-wider uppercase text-gray-500">
                  Navigation Admin
                </p>
              </div>
              <div className="p-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </aside>

          {/* Contenu principal */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

