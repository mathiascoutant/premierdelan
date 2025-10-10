"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { apiRequest, API_URL } from "../config/api";
import { FiCalendar, FiMapPin, FiUsers, FiImage, FiClock } from "react-icons/fi";

interface Event {
  id: string;
  titre: string;
  date: string;
  description: string;
  lieu: string;
  capacite: number;
  inscrits: number;
  photos_count: number;
  statut: string;
  user_inscription: {
    id: string;
    nombre_personnes: number;
    created_at: string;
  };
}

export default function MesEvenementsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"tous" | "a_venir" | "passes">("tous");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/connexion");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const data = await apiRequest(`${API_URL}/api/mes-evenements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(data.evenements || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.date.replace("Z", ""));
      if (filter === "a_venir") return eventDate > now;
      if (filter === "passes") return eventDate <= now;
      return true;
    });
  };

  const isEventPassed = (eventDate: string) => {
    const date = new Date(eventDate.replace("Z", ""));
    return date < new Date();
  };

  const filteredEvents = getFilteredEvents();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-black transition-colors mb-2 inline-flex items-center"
              >
                ← Retour à l&apos;accueil
              </Link>
              <h1 className="text-2xl sm:text-3xl font-light text-black mt-2">
                Mes Événements
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Retrouvez tous vos événements et albums photos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("tous")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "tous"
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Tous ({events.length})
          </button>
          <button
            onClick={() => setFilter("a_venir")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "a_venir"
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            À venir ({events.filter((e) => !isEventPassed(e.date)).length})
          </button>
          <button
            onClick={() => setFilter("passes")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "passes"
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Passés ({events.filter((e) => isEventPassed(e.date)).length})
          </button>
        </div>
      </div>

      {/* Liste des événements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aucun événement
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "tous"
                ? "Vous n'êtes inscrit à aucun événement pour le moment."
                : filter === "a_venir"
                ? "Vous n'avez aucun événement à venir."
                : "Vous n'avez participé à aucun événement passé."}
            </p>
            <Link href="/#evenements" className="btn-primary inline-block">
              Découvrir les événements
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isPassed = isEventPassed(event.date);
              const eventDate = new Date(event.date.replace("Z", ""));

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Header de la carte */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-light mb-1">
                        {event.titre}
                      </h3>
                      <p className="text-sm text-gray-300 flex items-center justify-center gap-1.5">
                        <FiCalendar className="w-4 h-4" />
                        {eventDate.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {isPassed && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Terminé
                      </div>
                    )}
                    {!isPassed && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        À venir
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {event.description}
                    </p>

                    {/* Infos */}
                    <div className="space-y-2 mb-4">
                      {event.lieu && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FiMapPin className="w-4 h-4 text-gray-400" />
                          <span>{event.lieu}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiUsers className="w-4 h-4 text-gray-400" />
                        <span>
                          {event.user_inscription.nombre_personnes}{" "}
                          {event.user_inscription.nombre_personnes > 1
                            ? "personnes inscrites"
                            : "personne inscrite"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiImage className="w-4 h-4 text-gray-400" />
                        <span>
                          {event.photos_count}{" "}
                          {event.photos_count > 1 ? "photos" : "photo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiClock className="w-4 h-4 text-gray-400" />
                        <span>
                          Inscrit le{" "}
                          {new Date(
                            event.user_inscription.created_at
                          ).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Album photo */}
                    <div className="pt-4 border-t border-gray-200">
                      {!isPassed && event.photos_count === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                          <FiImage className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Aucune photo disponible
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Les photos seront disponibles après l&apos;événement
                          </p>
                        </div>
                      ) : (
                        <Link
                          href={`/galerie?event=${event.id}`}
                          className="block w-full text-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                          <FiImage className="w-5 h-5 inline-block mr-2" />
                          Voir l&apos;album photo
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

