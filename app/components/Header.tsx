'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import UserMenu from './UserMenu'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isLoading, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { label: 'Accueil', href: '#accueil', isHash: true },
    { label: 'Événements', href: '#evenements', isHash: true },
    { label: 'Comment ça marche', href: '#services', isHash: true },
    { label: 'Connexion', href: '/connexion', isHash: false },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white border-b border-gray-200'
          : 'bg-white'
      }`}
    >
      <nav className="section-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="group">
            <span className="text-xl font-medium tracking-tight text-black">
              PREMIER DE L&apos;AN
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            {menuItems.filter(item => !user || item.label !== 'Connexion').map((item) => (
              item.isHash ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors duration-200 uppercase"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors duration-200 uppercase"
                >
                  {item.label}
                </Link>
              )
            ))}
            
            {!isLoading && (
              <>
                {user ? (
                  <UserMenu user={user} onLogout={logout} />
                ) : (
                  <Link href="/inscription" className="btn-primary">
                    S&apos;inscrire
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-black"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-6 pt-2">
            <div className="flex flex-col space-y-6">
              {/* Profil utilisateur en haut du menu mobile */}
              {user && (
                <div className="pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-medium">
                      {user.photo ? (
                        <img 
                          src={user.photo} 
                          alt={user.prenom} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/profil"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm text-gray-700 hover:text-black transition-colors mb-2"
                  >
                    Mon profil
                  </Link>
                  <Link
                    href="/mes-evenements"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm text-gray-700 hover:text-black transition-colors"
                  >
                    Mes événements
                  </Link>
                </div>
              )}

              {menuItems.filter(item => !user || item.label !== 'Connexion').map((item) => (
                item.isHash ? (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors uppercase"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors uppercase"
                  >
                    {item.label}
                  </Link>
                )
              ))}
              
              {!isLoading && (
                <>
                  {user ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        logout()
                      }}
                      className="btn-secondary w-full text-center text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      Déconnexion
                    </button>
                  ) : (
                    <Link href="/inscription" className="btn-primary w-full block text-center">
                      S&apos;inscrire
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
