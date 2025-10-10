"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_ENDPOINTS, apiRequest } from "../config/api";

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

export default function EventsPreview() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const apiUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        "/api/evenements/public"
      );
      const response = await apiRequest(apiUrl, {
        method: "GET",
      });

      // Prendre seulement les 3 premiers événements ouverts
      const openEvents = (response.evenements || [])
        .filter((e: Event) => e.statut === "ouvert")
        .slice(0, 3);

      setEvents(openEvents);
    } catch (error) {
      console.error("Erreur chargement événements:", error);
      // Données de fallback en cas d'erreur
      setEvents([
        {
          id: "1",
          titre: "Réveillon 2026",
          date: "2025-12-31T20:00:00Z",
          description:
            "Célébrez la nouvelle année et partagez vos meilleurs moments.",
          capacite: 100,
          inscrits: 45,
          photos_count: 0,
          statut: "ouvert",
          lieu: "Villa Privée",
        },
        {
          id: "2",
          titre: "Summer Vibes",
          date: "2025-07-15T19:00:00Z",
          description: "Soirée d'été exclusive avec piscine et DJ.",
          capacite: 80,
          inscrits: 75,
          photos_count: 0,
          statut: "ouvert",
          lieu: "Beach Club",
        },
        {
          id: "3",
          titre: "White Party",
          date: "2025-06-20T20:00:00Z",
          description: "Soirée élégante sur le thème blanc.",
          capacite: 120,
          inscrits: 0,
          photos_count: 247,
          statut: "ouvert",
          lieu: "Club Privé",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="evenements" className="py-32 bg-gray-50">
      <div className="section-container">
        {/* Section Header */}
        <div className="max-w-3xl mb-24">
          <p className="text-sm tracking-widest uppercase text-gray-500 mb-4">
            Événements à venir
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-black">
            Rejoignez-nous
            <br />
            <span className="font-normal">et partagez</span>
          </h2>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-lg">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des événements...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">
              Aucun événement à venir pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-px bg-black">
            {events.map((event) => {
              const placesRestantes = event.capacite - event.inscrits;
              const statusText =
                placesRestantes > 10
                  ? "Places disponibles"
                  : placesRestantes > 0
                  ? "Dernières places"
                  : "Complet";

              return (
                <div
                  key={event.id}
                  className="group bg-white hover:bg-gray-50 transition-colors duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-12 px-8 md:px-12 space-y-6 lg:space-y-0">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-3xl md:text-4xl font-normal text-black">
                          {event.titre}
                        </h3>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="text-gray-600 font-light max-w-md">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-6 text-sm text-gray-500 pt-2">
                        <span>{event.capacite} personnes</span>
                        <span className="border-l border-gray-300 pl-6">
                          {statusText}
                        </span>
                        <span className="border-l border-gray-300 pl-6">
                          {event.photos_count} photos
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                      <Link
                        href="/inscription"
                        className="btn-primary whitespace-nowrap text-center"
                      >
                        S&apos;inscrire
                      </Link>
                      <button className="btn-secondary whitespace-nowrap">
                        Voir la galerie
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
