"use client";

import { useState, useEffect } from "react";
import {
  FiX,
  FiSave,
  FiTrash2,
  FiUsers,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../config/api";

interface Event {
  id: string;
  titre: string;
  date: string;
}

interface Inscription {
  id: string;
  event_id: string;
  user_email: string;
  nombre_personnes: number;
  accompagnants: {
    firstname: string;
    lastname: string;
    is_adult: boolean;
  }[];
}

interface GererInscriptionModalProps {
  event: Event;
  userEmail: string;
  inscription: Inscription;
  onClose: () => void;
  onUpdate: () => void;
}

export default function GererInscriptionModal({
  event,
  userEmail,
  inscription,
  onClose,
  onUpdate,
}: GererInscriptionModalProps) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [nombrePersonnes, setNombrePersonnes] = useState(
    inscription.nombre_personnes
  );
  const [accompagnants, setAccompagnants] = useState(inscription.accompagnants);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNombreChange = (delta: number) => {
    const nouveau = nombrePersonnes + delta;
    if (nouveau < 1) return;

    setNombrePersonnes(nouveau);

    const nbAccompagnants = nouveau - 1;
    const current = [...accompagnants];

    if (nbAccompagnants > current.length) {
      for (let i = current.length; i < nbAccompagnants; i++) {
        current.push({ firstname: "", lastname: "", is_adult: true });
      }
    } else {
      current.splice(nbAccompagnants);
    }

    setAccompagnants(current);
  };

  const handleAccompagnantChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...accompagnants];
    updated[index] = { ...updated[index], [field]: value };
    setAccompagnants(updated);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      const apiUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        `/api/evenements/${event.id}/inscription`
      );

      await apiRequest(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_email: userEmail,
          nombre_personnes: nombrePersonnes,
          accompagnants: accompagnants,
        }),
      });

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      const apiUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        `/api/evenements/${event.id}/desinscription`
      );

      await apiRequest(apiUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_email: userEmail,
        }),
      });

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la désinscription");
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
              {mode === "delete"
                ? "Se désinscrire"
                : mode === "edit"
                ? "Modifier mon inscription"
                : "Mon inscription"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{event.titre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
              {error}
            </div>
          )}

          {mode === "view" && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium mb-1">
                  ✓ Vous êtes inscrit
                </p>
                <p className="text-sm text-green-700">
                  {nombrePersonnes} personne{nombrePersonnes > 1 ? "s" : ""}{" "}
                  inscrite{nombrePersonnes > 1 ? "s" : ""}
                </p>
              </div>

              {accompagnants.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Accompagnants
                  </h3>
                  <div className="space-y-2">
                    {accompagnants.map((acc, i) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-900">
                          {i + 2}. {acc.firstname} {acc.lastname}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600">
                          {acc.is_adult ? "Majeur" : "Mineur"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className="flex-1 btn-secondary"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => setMode("delete")}
                  className="flex-1 px-8 py-3.5 bg-red-600 text-white font-medium text-sm tracking-wide uppercase hover:bg-red-700 transition-colors duration-300"
                >
                  Se désinscrire
                </button>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="space-y-6">
              {/* Nombre de personnes */}
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                  Nombre de personnes
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleNombreChange(-1)}
                    disabled={nombrePersonnes <= 1}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30"
                  >
                    <FiMinus />
                  </button>
                  <span className="text-2xl font-light">{nombrePersonnes}</span>
                  <button
                    type="button"
                    onClick={() => handleNombreChange(1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Accompagnants */}
              {accompagnants.map((acc, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg space-y-3"
                >
                  <p className="text-sm font-medium text-gray-900">
                    Personne {index + 2}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={acc.firstname}
                      onChange={(e) =>
                        handleAccompagnantChange(
                          index,
                          "firstname",
                          e.target.value
                        )
                      }
                      placeholder="Prénom"
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      required
                    />
                    <input
                      type="text"
                      value={acc.lastname}
                      onChange={(e) =>
                        handleAccompagnantChange(
                          index,
                          "lastname",
                          e.target.value
                        )
                      }
                      placeholder="Nom"
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Majeur (+18 ans)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleAccompagnantChange(
                          index,
                          "is_adult",
                          !acc.is_adult
                        )
                      }
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                        acc.is_adult ? "bg-black" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                          acc.is_adult ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="flex-1 btn-secondary order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="flex-1 btn-primary flex items-center justify-center order-1 sm:order-2"
                  disabled={isSaving}
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          )}

          {mode === "delete" && (
            <div className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium mb-1">
                  Êtes-vous sûr de vouloir vous désinscrire ?
                </p>
                <p className="text-sm text-red-700">
                  Cette action supprimera votre inscription et celle de vos{" "}
                  {accompagnants.length} accompagnant(s).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="flex-1 btn-secondary order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 px-8 py-3.5 bg-red-600 text-white font-medium text-sm tracking-wide uppercase hover:bg-red-700 transition-colors duration-300 flex items-center justify-center order-1 sm:order-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Désinscription...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4 mr-2" />
                      Se désinscrire
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
