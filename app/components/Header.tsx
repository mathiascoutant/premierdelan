'use client'

import { useState, useEffect } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Événements', href: '#evenements' },
    { label: 'Comment ça marche', href: '#services' },
    { label: 'Connexion', href: '#contact' },
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
          <a href="#accueil" className="group">
            <span className="text-xl font-medium tracking-tight text-black">
              PREMIER DE L'AN
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors duration-200 uppercase"
              >
                {item.label}
              </a>
            ))}
            <button className="btn-primary">
              S'inscrire
            </button>
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
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors uppercase"
                >
                  {item.label}
                </a>
              ))}
              <button className="btn-primary w-full">
                S'inscrire
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
