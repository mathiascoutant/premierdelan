'use client'

import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Link from 'next/link'
import { FiUsers, FiCalendar, FiSettings, FiArrowLeft, FiDroplet } from 'react-icons/fi'
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
    { label: 'Thème', href: '/admin/theme', icon: FiDroplet },
    { label: 'Paramètres', href: '/admin/parametres', icon: FiSettings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-black text-white border-b border-gray-800">
        <div className="section-container py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                <FiArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour au site</span>
                <span className="sm:hidden">Retour</span>
              </Link>
              <div className="w-px h-6 bg-gray-700"></div>
              <h1 className="text-base md:text-xl font-medium tracking-tight">
                <span className="hidden sm:inline">ADMIN - Premier de l&apos;An</span>
                <span className="sm:hidden">ADMIN</span>
              </h1>
            </div>
            <div className="text-xs md:text-sm text-gray-400 hidden sm:block">
              {user?.firstname} {user?.lastname}
            </div>
          </div>
        </div>
      </header>

      <div className="section-container py-4 md:py-8">
        {/* Navigation mobile (tabs pleine largeur) */}
        <nav className="md:hidden mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-3 px-2 transition-colors border-b-2 ${
                    isActive
                      ? 'border-black text-black font-medium'
                      : 'border-transparent text-gray-600 hover:text-black'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="flex gap-8">
          {/* Sidebar Navigation - Desktop uniquement */}
          <aside className="hidden md:block w-64 flex-shrink-0">
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
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

