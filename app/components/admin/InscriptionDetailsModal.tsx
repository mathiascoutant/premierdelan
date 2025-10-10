'use client';

import { FiX, FiUser, FiUsers, FiTrash2 } from 'react-icons/fi';

interface Accompagnant {
  firstname: string;
  lastname: string;
  is_adult: boolean;
}

interface Inscription {
  id: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  nombre_personnes: number;
  accompagnants: Accompagnant[];
  created_at: string;
}

interface InscriptionDetailsModalProps {
  inscription: Inscription;
  eventTitre: string;
  onClose: () => void;
  onDelete: () => void;
}

export default function InscriptionDetailsModal({ 
  inscription, 
  eventTitre, 
  onClose, 
  onDelete 
}: InscriptionDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-medium text-black">
              Détails de l&apos;inscription
            </h2>
            <p className="text-sm text-gray-600 mt-1">{eventTitre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info principale */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-lg font-medium">
                {inscription.user_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-medium text-black">{inscription.user_name}</p>
                <p className="text-sm text-gray-600">{inscription.user_email}</p>
                {inscription.user_phone && (
                  <p className="text-sm text-gray-600">{inscription.user_phone}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">Date d&apos;inscription</p>
                <p className="text-sm font-medium text-black">
                  {new Date(inscription.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Nombre total</p>
                <p className="text-sm font-medium text-black">
                  {inscription.nombre_personnes} personne{inscription.nombre_personnes > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Liste détaillée */}
          <div>
            <h3 className="font-medium text-black mb-3 flex items-center">
              <FiUsers className="w-5 h-5 mr-2" />
              Composition du groupe ({inscription.nombre_personnes} personne{inscription.nombre_personnes > 1 ? 's' : ''})
            </h3>
            
            <div className="space-y-2">
              {/* Personne principale */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{inscription.user_name}</p>
                      <p className="text-xs text-blue-700">Personne principale (Majeur)</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                    Organisateur
                  </span>
                </div>
              </div>

              {/* Accompagnants */}
              {inscription.accompagnants.map((acc, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {idx + 2}
                      </div>
                      <div>
                        <p className="font-medium text-black">
                          {acc.firstname} {acc.lastname}
                        </p>
                        <p className="text-xs text-gray-600">
                          Accompagnant - {acc.is_adult ? 'Majeur (+18 ans)' : 'Mineur (-18 ans)'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      acc.is_adult 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {acc.is_adult ? 'Majeur' : 'Mineur'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Récapitulatif</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Adultes :</span>
                <span className="ml-2 font-medium text-black">
                  {1 + inscription.accompagnants.filter(a => a.is_adult).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Mineurs :</span>
                <span className="ml-2 font-medium text-black">
                  {inscription.accompagnants.filter(a => !a.is_adult).length}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                if (confirm(`Supprimer l'inscription complète de ${inscription.user_name} (${inscription.nombre_personnes} personne(s)) ?`)) {
                  onDelete();
                }
              }}
              className="flex-1 px-8 py-3.5 bg-red-600 text-white font-medium text-sm tracking-wide uppercase hover:bg-red-700 transition-colors duration-300 flex items-center justify-center"
            >
              <FiTrash2 className="w-4 h-4 mr-2" />
              Supprimer l&apos;inscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

