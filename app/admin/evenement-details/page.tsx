"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUsers,
  FiCalendar,
  FiTrash2,
  FiDownload,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";

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
  updated_at: string;
}

interface Event {
  id: string;
  titre: string;
  date: string;
  description: string;
  capacite: number;
  inscrits: number;
  photos_count: number;
  statut: string;
  lieu?: string;
}

interface EventStats {
  total_inscrits: number;
  total_personnes: number;
  total_adultes: number;
  total_mineurs: number;
}

function EventDetailsContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/");
      return;
    }
    if (eventId) {
      fetchEventDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventDetails = async () => {
    if (!eventId) return;

    try {
      const token = localStorage.getItem("auth_token");

      // Récupérer les détails de l'événement
      const eventUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        `/api/admin/evenements/${eventId}`
      );
      const eventResponse = await apiRequest(eventUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(eventResponse.evenement);

      // Récupérer les inscrits
      const inscritsUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        `/api/admin/evenements/${eventId}/inscrits`
      );
      const inscritsResponse = await apiRequest(inscritsUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setInscriptions(inscritsResponse.inscriptions || []);
      setStats({
        total_inscrits: inscritsResponse.total_inscrits || 0,
        total_personnes: inscritsResponse.total_personnes || 0,
        total_adultes: inscritsResponse.total_adultes || 0,
        total_mineurs: inscritsResponse.total_mineurs || 0,
      });
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInscription = async (inscription: Inscription) => {
    if (!eventId) return;

    if (
      !confirm(
        `Supprimer l'inscription de ${inscription.user_name} (${inscription.nombre_personnes} personne(s)) ?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const apiUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        `/api/admin/evenements/${eventId}/inscrits/${inscription.id}`
      );

      await apiRequest(apiUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchEventDetails();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la suppression");
    }
  };

  const handleExportCSV = () => {
    if (!event || inscriptions.length === 0) return;

    // Créer le CSV
    let csv =
      "Nom,Email,Téléphone,Nombre de personnes,Accompagnants,Date inscription\n";

    inscriptions.forEach((insc) => {
      const accompagnants = insc.accompagnants
        .map(
          (acc) =>
            `${acc.firstname} ${acc.lastname} (${
              acc.is_adult ? "Majeur" : "Mineur"
            })`
        )
        .join(" | ");

      csv += `"${insc.user_name}","${insc.user_email}","${
        insc.user_phone || ""
      }",${insc.nombre_personnes},"${accompagnants}","${new Date(
        insc.created_at
      ).toLocaleString("fr-FR")}"\n`;
    });

    // Télécharger
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inscrits_${event.titre.replace(/\s/g, "_")}.csv`
    );
    link.click();
  };

  const filteredInscriptions = inscriptions.filter(
    (insc) =>
      insc.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insc.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Événement non trouvé</p>
          <Link href="/admin/evenements" className="btn-primary">
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/evenements"
          className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-4"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Retour aux événements
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-black mb-2">
              {event.titre}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <FiCalendar className="w-4 h-4 mr-2" />
                {new Date(event.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center">
                <FiUsers className="w-4 h-4 mr-2" />
                {event.inscrits} / {event.capacite}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.statut === "ouvert"
                    ? "bg-green-100 text-green-700"
                    : event.statut === "complet"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {event.statut}
              </span>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-secondary inline-flex items-center whitespace-nowrap"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
              Inscriptions
            </p>
            <p className="text-2xl font-light text-black">
              {stats.total_inscrits}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
              Total Personnes
            </p>
            <p className="text-2xl font-light text-black">
              {stats.total_personnes}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
              Adultes
            </p>
            <p className="text-2xl font-light text-black">
              {stats.total_adultes}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs tracking-wider uppercase text-gray-500 mb-2">
              Mineurs
            </p>
            <p className="text-2xl font-light text-black">
              {stats.total_mineurs}
            </p>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Liste des inscrits - Mobile: Cards, Desktop: Table */}

      {/* Version Mobile */}
      <div className="md:hidden space-y-4">
        {filteredInscriptions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Aucune inscription</p>
          </div>
        ) : (
          filteredInscriptions.map((inscription) => (
            <div
              key={inscription.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {inscription.user_name
                      .split(" ")
                      .map((n) => n.charAt(0))
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-black">
                      {inscription.user_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {inscription.nombre_personnes} personne
                      {inscription.nombre_personnes > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteInscription(inscription)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FiMail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{inscription.user_email}</span>
                </div>
                {inscription.user_phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPhone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{inscription.user_phone}</span>
                  </div>
                )}
              </div>

              {inscription.accompagnants.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Accompagnants ({inscription.accompagnants.length})
                  </p>
                  <div className="space-y-1">
                    {inscription.accompagnants.map((acc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-gray-700">
                          {acc.firstname} {acc.lastname}
                        </span>
                        <span className="text-gray-500">
                          {acc.is_adult ? "Majeur" : "Mineur"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 mt-3">
                <p className="text-xs text-gray-500">
                  Inscrit le{" "}
                  {new Date(inscription.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Version Desktop */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredInscriptions.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Aucune inscription</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personnes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accompagnants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInscriptions.map((inscription) => (
                <tr
                  key={inscription.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {inscription.user_name
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-black">
                          {inscription.user_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMail className="w-4 h-4 mr-2" />
                        <span>{inscription.user_email}</span>
                      </div>
                      {inscription.user_phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FiPhone className="w-4 h-4 mr-2" />
                          <span>{inscription.user_phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-black">
                      {inscription.nombre_personnes}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {inscription.accompagnants.length > 0 ? (
                      <div className="space-y-1">
                        {inscription.accompagnants.map((acc, idx) => (
                          <div key={idx} className="text-xs text-gray-700">
                            {acc.firstname} {acc.lastname}
                            <span className="text-gray-500 ml-2">
                              ({acc.is_adult ? "Majeur" : "Mineur"})
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(inscription.created_at).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteInscription(inscription)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      }
    >
      <EventDetailsContent />
    </Suspense>
  );
}
