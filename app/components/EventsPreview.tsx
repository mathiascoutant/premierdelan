"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_ENDPOINTS, apiRequest } from "../config/api";
import { useAuth } from "../hooks/useAuth";
import InscriptionEventModal from "./InscriptionEventModal";
import GererInscriptionModal from "./GererInscriptionModal";
import Countdown from "./Countdown";

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
  date_ouverture_inscription?: string;
  date_fermeture_inscription?: string;
  user_inscription?: any; // Données d'inscription si l'utilisateur est inscrit
}

export default function EventsPreview() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inscriptionEvent, setInscriptionEvent] = useState<Event | null>(null);
  const [gererInscription, setGererInscription] = useState<{
    event: Event;
    inscription: any;
  } | null>(null);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Re-fetch quand l'utilisateur change

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
      let openEvents = (response.evenements || [])
        .filter((e: Event) => e.statut === "ouvert")
        .slice(0, 3);

      // Si utilisateur connecté, vérifier ses inscriptions
      if (user) {
        const token = localStorage.getItem("auth_token");
        openEvents = await Promise.all(
          openEvents.map(async (event: Event) => {
            try {
              const inscriptionUrl = API_ENDPOINTS.connexion.replace(
                "/api/connexion",
                `/api/evenements/${event.id}/inscription?user_email=${user.email}`
              );
              const inscriptionResponse = await apiRequest(inscriptionUrl, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return {
                ...event,
                user_inscription: inscriptionResponse.inscription,
              };
            } catch (error) {
              // Pas inscrit ou erreur
              return event;
            }
          })
        );
      }

      setEvents(openEvents);
    } catch (error) {
      console.error("Erreur chargement événements:", error);
      setEvents([]);
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
              const now = new Date();
              const dateOuverture = event.date_ouverture_inscription
                ? new Date(event.date_ouverture_inscription)
                : null;
              const dateFermeture = event.date_fermeture_inscription
                ? new Date(event.date_fermeture_inscription)
                : null;

              const isBeforeOpening = dateOuverture && now < dateOuverture;
              const isAfterClosing = dateFermeture && now > dateFermeture;
              const isOpen =
                !isBeforeOpening &&
                !isAfterClosing &&
                event.statut === "ouvert";

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
                        <span>
                          {event.inscrits} / {event.capacite} inscrits
                        </span>
                        <span className="border-l border-gray-300 pl-6">
                          {placesRestantes > 0 ? (
                            <span
                              className={
                                placesRestantes <= 10
                                  ? "text-orange-600 font-medium"
                                  : "text-green-600"
                              }
                            >
                              {placesRestantes} place
                              {placesRestantes > 1 ? "s" : ""} restante
                              {placesRestantes > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium">
                              Complet
                            </span>
                          )}
                        </span>
                        <span className="border-l border-gray-300 pl-6">
                          {event.photos_count} photo
                          {event.photos_count > 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Compteur à rebours */}
                      {isBeforeOpening && dateOuverture && (
                        <div className="pt-3">
                          <Countdown
                            targetDate={event.date_ouverture_inscription!}
                            type="opening"
                          />
                        </div>
                      )}
                      {isOpen && dateFermeture && (
                        <div className="pt-3">
                          <Countdown
                            targetDate={event.date_fermeture_inscription!}
                            type="closing"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                      {isBeforeOpening ? (
                        <button
                          disabled
                          className="btn-primary whitespace-nowrap text-center opacity-50 cursor-not-allowed"
                        >
                          Prochainement
                        </button>
                      ) : isAfterClosing ? (
                        <button
                          disabled
                          className="btn-primary whitespace-nowrap text-center opacity-50 cursor-not-allowed"
                        >
                          Inscriptions fermées
                        </button>
                      ) : user ? (
                        event.user_inscription ? (
                          <button
                            onClick={() =>
                              setGererInscription({
                                event,
                                inscription: event.user_inscription,
                              })
                            }
                            className="btn-primary whitespace-nowrap text-center bg-green-600 hover:bg-green-700"
                          >
                            ✓ Gérer mon inscription
                          </button>
                        ) : (
                          <button
                            onClick={() => setInscriptionEvent(event)}
                            className="btn-primary whitespace-nowrap text-center"
                          >
                            S&apos;inscrire
                          </button>
                        )
                      ) : (
                        <Link
                          href="/inscription"
                          className="btn-primary whitespace-nowrap text-center"
                        >
                          S&apos;inscrire
                        </Link>
                      )}
                      <Link
                        href={`/galerie?event=${event.id}`}
                        className="btn-secondary whitespace-nowrap text-center"
                      >
                        Voir la galerie
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modales */}
      {inscriptionEvent && user && (
        <InscriptionEventModal
          event={inscriptionEvent}
          userEmail={user.email}
          onClose={() => setInscriptionEvent(null)}
          onSuccess={() => {
            fetchEvents();
            setInscriptionEvent(null);
          }}
        />
      )}

      {gererInscription && user && (
        <GererInscriptionModal
          event={gererInscription.event}
          userEmail={user.email}
          inscription={gererInscription.inscription}
          onClose={() => setGererInscription(null)}
          onUpdate={() => {
            fetchEvents();
            setGererInscription(null);
          }}
        />
      )}
    </section>
  );
}
