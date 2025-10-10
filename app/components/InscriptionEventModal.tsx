"use client";

import { useState } from "react";
import { FiX, FiSave, FiPlus, FiMinus, FiUsers } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../config/api";

interface Event {
  id: string;
  titre: string;
  date: string;
  capacite: number;
  inscrits: number;
}

interface InscriptionEventModalProps {
  event: Event;
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Accompagnant {
  firstname: string;
  lastname: string;
  is_adult: boolean;
}

export default function InscriptionEventModal({
  event,
  userEmail,
  onClose,
  onSuccess,
}: InscriptionEventModalProps) {
  const [nombrePersonnes, setNombrePersonnes] = useState(1);
  const [accompagnants, setAccompagnants] = useState<Accompagnant[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const placesRestantes = event.capacite - event.inscrits;

  const handleNombreChange = (delta: number) => {
    const nouveau = nombrePersonnes + delta;
    if (nouveau < 1 || nouveau > placesRestantes) return;

    setNombrePersonnes(nouveau);

    // Ajuster le tableau d'accompagnants (on ne compte pas l'organisateur principal)
    const nbAccompagnants = nouveau - 1;
    const current = [...accompagnants];

    if (nbAccompagnants > current.length) {
      // Ajouter des accompagnants vides
      for (let i = current.length; i < nbAccompagnants; i++) {
        current.push({ firstname: "", lastname: "", is_adult: true });
      }
    } else {
      // Retirer des accompagnants
      current.splice(nbAccompagnants);
    }

    setAccompagnants(current);
  };

  const handleAccompagnantChange = (
    index: number,
    field: keyof Accompagnant,
    value: any
  ) => {
    const updated = [...accompagnants];
    updated[index] = { ...updated[index], [field]: value };
    setAccompagnants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    // Valider que tous les accompagnants ont un nom et prénom
    for (let i = 0; i < accompagnants.length; i++) {
      if (!accompagnants[i].firstname || !accompagnants[i].lastname) {
        setError(`Veuillez remplir le nom et prénom de la personne ${i + 2}`);
        setIsSaving(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("auth_token");
      const apiUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        `/api/evenements/${event.id}/inscription`
      );

      await apiRequest(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_email: userEmail,
          nombre_personnes: nombrePersonnes,
          accompagnants: accompagnants,
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg md:text-xl font-medium text-black">
              Inscription - {event.titre}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(event.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Alerte places restantes */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <FiUsers className="inline-block w-4 h-4 mr-2" />
              Places restantes :{" "}
              <span className="font-medium">{placesRestantes}</span>
            </p>
          </div>

          {/* Nombre de personnes */}
          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
              Nombre de personnes (vous inclus)
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleNombreChange(-1)}
                disabled={nombrePersonnes <= 1}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiMinus className="w-5 h-5" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-light text-black">
                  {nombrePersonnes}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {nombrePersonnes === 1 ? "personne" : "personnes"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNombreChange(1)}
                disabled={nombrePersonnes >= placesRestantes}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Info principale */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-1">
              Personne 1 (vous)
            </p>
            <p className="text-sm text-gray-600">
              Vos informations de compte seront utilisées
            </p>
          </div>

          {/* Accompagnants */}
          {accompagnants.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <FiUsers className="w-5 h-5 text-gray-700" />
                <h3 className="font-medium text-gray-900">
                  Accompagnants ({accompagnants.length})
                </h3>
              </div>

              {accompagnants.map((accompagnant, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
                >
                  <p className="text-sm font-medium text-gray-900">
                    Personne {index + 2}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={accompagnant.firstname}
                        onChange={(e) =>
                          handleAccompagnantChange(
                            index,
                            "firstname",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs tracking-wider uppercase text-gray-500 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={accompagnant.lastname}
                        onChange={(e) =>
                          handleAccompagnantChange(
                            index,
                            "lastname",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Majeur/Mineur */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Personne majeure
                      </p>
                      <p className="text-xs text-gray-600">+18 ans</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleAccompagnantChange(
                          index,
                          "is_adult",
                          !accompagnant.is_adult
                        )
                      }
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                        accompagnant.is_adult ? "bg-black" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                          accompagnant.is_adult
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Résumé */}
          <div className="p-4 bg-black text-white rounded-lg">
            <p className="text-sm mb-2">Récapitulatif</p>
            <div className="flex items-center justify-between">
              <span>Nombre total de personnes</span>
              <span className="text-2xl font-light">{nombrePersonnes}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary order-2 sm:order-1"
              disabled={isSaving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center order-1 sm:order-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Inscription...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  Confirmer l&apos;inscription
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
