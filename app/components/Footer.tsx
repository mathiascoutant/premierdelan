'use client'

import Link from 'next/link'
import { FiInstagram, FiFacebook, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white">
      <div className="section-container py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="text-xl font-medium tracking-tight">
              PREMIER DE L&apos;AN
            </div>
            <p className="text-gray-400 font-light leading-relaxed text-sm">
              Organisation d&apos;événements privés d&apos;excellence depuis 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <p className="text-xs tracking-widest uppercase text-gray-500">
              Navigation
            </p>
            <ul className="space-y-3">
              <li>
                <a href="#accueil" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#evenements" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Événements
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Mon compte
                </a>
              </li>
              <li>
                <Link href="/inscription" className="text-sm text-gray-400 hover:text-white transition-colors">
                  S&apos;inscrire
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-6">
            <p className="text-xs tracking-widest uppercase text-gray-500">
              Réseaux Sociaux
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all"
                aria-label="Instagram"
              >
                <FiInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all"
                aria-label="Facebook"
              >
                <FiFacebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500">
            <p>
              © {currentYear} Premier de l&apos;An. Tous droits réservés.
            </p>
            <div className="flex space-x-8">
              <a href="#" className="hover:text-white transition-colors">
                Mentions Légales
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
