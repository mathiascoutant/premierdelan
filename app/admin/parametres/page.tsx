'use client'

import { FiBell, FiMail, FiShield, FiDatabase } from 'react-icons/fi'

export default function ParametresPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-black mb-2">
          <span className="font-normal">Paramètres</span>
        </h1>
        <p className="text-gray-600 font-light">
          Configuration de la plateforme
        </p>
      </div>

      {/* Sections de paramètres */}
      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FiBell className="w-6 h-6 text-black" />
            <h2 className="text-xl font-medium text-black">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Notifications Push</p>
                <p className="text-sm text-gray-600">Activer les notifications Firebase</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Notifications Email</p>
                <p className="text-sm text-gray-600">Envoyer des emails de rappel</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FiShield className="w-6 h-6 text-black" />
            <h2 className="text-xl font-medium text-black">Sécurité</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code soirée actuel
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  defaultValue="PARTY2026"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
                <button className="btn-secondary">
                  Générer nouveau
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Base de données */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FiDatabase className="w-6 h-6 text-black" />
            <h2 className="text-xl font-medium text-black">Base de données</h2>
          </div>
          <div className="space-y-4">
            <button className="btn-secondary text-black">
              Exporter les données
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

