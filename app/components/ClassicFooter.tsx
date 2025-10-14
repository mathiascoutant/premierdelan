'use client'

import Link from 'next/link'
import { FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi'

export default function ClassicFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-black text-lg font-bold">P</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Premier de l'An</h3>
                <p className="text-gray-400 text-sm">Édition 2026</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Créer des moments inoubliables depuis 2010. Chaque célébration est une œuvre d'art, 
              chaque événement une expérience unique.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <span className="text-sm font-medium">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <span className="text-sm font-medium">t</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <span className="text-sm font-medium">in</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <a href="#accueil" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FiArrowRight className="w-4 h-4 mr-2" />
                  Accueil
                </a>
              </li>
              <li>
                <a href="#evenements" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FiArrowRight className="w-4 h-4 mr-2" />
                  Événements
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FiArrowRight className="w-4 h-4 mr-2" />
                  Services
                </a>
              </li>
              <li>
                <Link href="/connexion" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FiArrowRight className="w-4 h-4 mr-2" />
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <FiMail className="w-4 h-4 mr-3" />
                <span>contact@premierdelan.fr</span>
              </li>
              <li className="flex items-center text-gray-300">
                <FiPhone className="w-4 h-4 mr-3" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center text-gray-300">
                <FiMapPin className="w-4 h-4 mr-3" />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Premier de l'An. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/mentions-legales" className="text-gray-400 hover:text-white text-sm transition-colors">
                Mentions Légales
              </Link>
              <Link href="/confidentialite" className="text-gray-400 hover:text-white text-sm transition-colors">
                Confidentialité
              </Link>
              <Link href="/cgv" className="text-gray-400 hover:text-white text-sm transition-colors">
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
